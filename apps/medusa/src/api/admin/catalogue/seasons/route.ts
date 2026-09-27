import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, MedusaError, ProductStatus } from "@medusajs/framework/utils"
import { createCollectionsWorkflow, updateCollectionsWorkflow } from "@medusajs/medusa/core-flows"
import { z } from "@medusajs/framework/zod"
import { COMMISSION_COLLECTION, SILHOUETTE_COLLECTION } from "../../../../lib/commission-catalogue"

/* The seasons, and the making of one.
 *
 * A season is created `pending`: it exists, pieces can be cut for it, and the
 * storefront cannot see it — `lib/catalog.ts` reads only `current` and `past`,
 * so anything else is invisible by construction rather than by a flag someone
 * has to remember. Opening it is a separate, deliberate act (./[handle]/open).
 *
 * Editorial can be corrected on a season at any point in its life. Its status
 * cannot: `current` and `past` are what the cart reads to decide whether a
 * piece can still be bought, and they move one way, through `open`.
 */

const HOLDING = [COMMISSION_COLLECTION, SILHOUETTE_COLLECTION]

const schema = z.object({
  handle: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "is a lower-case handle such as 'autumn-iv'")
    .max(80),
  /** Full display title — 'Autumn — Collection IV'. */
  title: z.string().trim().min(1).max(200),
  /** The season's name on its own — 'Autumn'. */
  season: z.string().trim().min(1).max(80),
  number: z.number().int().positive().max(999),
  /** The cloth the season was built on. */
  note: z.string().trim().max(500).optional(),
  /** When the season closes, shown while it is the open one. */
  closes: z.string().trim().max(80).optional(),
})

function refuse(message: string): never {
  throw new MedusaError(MedusaError.Types.INVALID_DATA, message)
}

/* What the storefront reads back off a collection. `status` is never taken
   from a caller, only carried or changed by `open`. */
const editorial = (s: z.infer<typeof schema>) => ({
  season: s.season,
  number: s.number,
  note: s.note ?? "",
  /* Metadata is merged, not replaced, so every field is written on every
     pass: an omitted `closes` is a season with no closing date, and an empty
     string is what says so. */
  closes: s.closes ?? "",
})

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: collections } = await query.graph({
    entity: "product_collection",
    fields: ["id", "handle", "title", "metadata"],
  })
  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "status", "collection.handle"],
  })

  /* A season is worth reading with its pieces counted: it is what says whether
     there is anything to open, and which pieces are still waiting on someone
     to publish them. */
  const counted = collections
    .filter((c) => !HOLDING.includes(c.handle))
    .map((c) => {
      const meta = (c.metadata ?? {}) as Record<string, unknown>
      const mine = products.filter((p) => p.collection?.handle === c.handle)
      return {
        handle: c.handle,
        title: c.title,
        status: (meta.status as string) ?? null,
        season: (meta.season as string) ?? null,
        number: Number(meta.number ?? 0),
        note: (meta.note as string) ?? "",
        ...(meta.closes ? { closes: meta.closes as string } : {}),
        pieces: {
          published: mine.filter((p) => p.status === ProductStatus.PUBLISHED).length,
          draft: mine.filter((p) => p.status === ProductStatus.DRAFT).length,
        },
      }
    })
    .sort((a, b) => b.number - a.number)

  res.json({ seasons: counted, count: counted.length })
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const parsed = schema.safeParse(req.body)
  if (!parsed.success) {
    refuse(parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(" "))
  }
  const season = parsed.data!

  if (HOLDING.includes(season.handle)) {
    refuse(`${season.handle} holds commissions, and is not a season.`)
  }

  const { data: [existing] } = await query.graph({
    entity: "product_collection",
    fields: ["id", "handle", "metadata"],
    filters: { handle: season.handle },
  })

  if (existing) {
    const status = existing.metadata?.status as string | undefined
    if (status && !["pending", "current", "past"].includes(status)) {
      refuse(`${season.handle} is not a season.`)
    }

    /* The status it already has is carried through untouched. Correcting the
       wording of an archived season is a reasonable thing to do; reopening it
       by sending a field is not. */
    await updateCollectionsWorkflow(req.scope).run({
      input: {
        selector: { id: existing.id },
        update: {
          title: season.title,
          metadata: { status: status ?? "pending", ...editorial(season) },
        },
      },
    })

    res.json({ season: { handle: season.handle, id: existing.id, status: status ?? "pending" } })
    return
  }

  const { result: created } = await createCollectionsWorkflow(req.scope).run({
    input: {
      collections: [
        {
          handle: season.handle,
          title: season.title,
          /* Invisible to the storefront until someone opens it. */
          metadata: { status: "pending", ...editorial(season) },
        },
      ],
    },
  })

  res.status(201).json({ season: { handle: season.handle, id: created[0].id, status: "pending" } })
}
