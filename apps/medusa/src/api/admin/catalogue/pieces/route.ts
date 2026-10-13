import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
  ContainerRegistrationKeys,
  MedusaError,
  ProductStatus,
} from "@medusajs/framework/utils"
import {
  createInventoryLevelsWorkflow,
  createProductOptionsWorkflow,
  createProductsWorkflow,
  updateProductsWorkflow,
  uploadFilesWorkflow,
} from "@medusajs/medusa/core-flows"
import { z } from "@medusajs/framework/zod"
import { COMMISSION_COLLECTION, SILHOUETTE_COLLECTION } from "../../../../lib/commission-catalogue"

/* How a piece enters the catalogue.
 *
 * One upsert, keyed on the handle, so an agent that is unsure whether it
 * already sent a piece can simply send it again. What the house never lets
 * a caller decide is supplied here rather than asked for: a piece arrives as
 * a draft, carries the one option the house offers, is stocked at its run and
 * is priced in francs with the other currencies derived. A person publishes
 * it (docs/CATALOGUE-INGESTION.md §2).
 *
 * The rules that refuse are the ones that cost money if they are wrong: an
 * unknown season, a handle that belongs to the commission side of the house,
 * and a price moved on a piece the house has already published.
 */

const LENGTH_KINDS = ["dress", "skirt", "trouser", "top", "robe"] as const

/* Per-piece size of the season's capped run, when a caller does not say. */
const RUN_CAP = 10

const MAX_IMAGES = 8
const MAX_IMAGE_BYTES = 15 * 1024 * 1024

/* Only the handle is ever required: it is what the piece is. Everything else
   is required the first time a piece is cut and optional afterwards, so that
   attaching photography later, or correcting a material, does not mean
   restating the whole piece. What a create needs is checked once the route
   knows whether it is creating. */
const schema = z.object({
  /* The catalogue's own id for the piece, and its URL. Lower case, digits and
     hyphens: it is read back as a path segment and sorted as a name. */
  handle: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "is a lower-case handle such as 'w4' or 'coat-sand'")
    .max(80),
  title: z.string().trim().min(1).max(200).optional(),
  /** Cloth and construction, shown under the name on every tile. */
  material: z.string().trim().min(1).max(200).optional(),
  /* What the piece is cut from, which decides the colours the client chooses
     from: the silk swatches or the linen swatches. The house makes in nothing
     else, and a piece is never named for a colour. */
  cloth: z.enum(["silk", "linen"]).optional(),
  /** The handle of a season that already exists. */
  collection: z.string().trim().min(1).optional(),
  group: z.enum(["women", "men"]).optional(),
  /** Whole Swiss francs. Set once, at creation. */
  price_chf: z.number().int().positive().max(1_000_000).optional(),
  /* Which finished lengths the measurement sheet asks for. A scarf asks for
     none, so an empty list is a real answer. */
  length_kinds: z.array(z.enum(LENGTH_KINDS)).max(4).optional(),
  /** Art direction, drawn as a placeholder until the piece is photographed. */
  shot: z.string().trim().max(200).optional(),
  sleep: z.boolean().optional(),
  run_size: z.number().int().positive().max(10_000).optional(),
  /* Omitted, photography is untouched — whatever `images_action` says. Present,
     it is read against `images_action`: URLs to fetch and add or become the
     whole set, or — for `remove` — the piece's own already-stored URLs
     (as `list_pieces` reports them back) to take off it. */
  images: z
    .array(z.object({ url: z.string().url(), alt: z.string().trim().max(200).optional() }))
    .max(MAX_IMAGES)
    .optional(),
  /** What `images` does to what the piece already carries. */
  images_action: z.enum(["replace", "add", "remove"]).default("replace"),
})

/** What a piece cannot be cut without. */
const REQUIRED_TO_CUT = ["title", "material", "cloth", "collection", "group", "price_chf"] as const

function refuse(message: string): never {
  throw new MedusaError(MedusaError.Types.INVALID_DATA, message)
}

/* Fetching a URL is the backend making a request on a caller's say-so, so the
   hosts it will fetch from are named in the environment rather than left open.
   Unset means the house has not agreed to fetch from anywhere yet, and the
   refusal says which variable to set. */
const allowedHosts = () =>
  (process.env.CATALOGUE_IMAGE_HOSTS ?? "")
    .split(",")
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean)

async function storeImages(
  scope: MedusaRequest["scope"],
  images: { url: string; alt?: string }[]
) {
  if (!images.length) {
    return []
  }

  const hosts = allowedHosts()
  if (!hosts.length) {
    refuse(
      "No image host is allowed yet. Set CATALOGUE_IMAGE_HOSTS to the hosts the " +
        "house will fetch photography from, as a comma-separated list."
    )
  }

  const files = await Promise.all(
    images.map(async ({ url }) => {
      const host = new URL(url).hostname.toLowerCase()
      if (!hosts.includes(host)) {
        refuse(`The house does not fetch images from ${host}.`)
      }

      /* Redirects are refused rather than followed. An allowed host that
         answers with a 302 is otherwise a way to reach any address the
         backend can reach, the host's own network included, and the
         allowlist would have checked only the first hop. */
      const response = await fetch(url, {
        redirect: "manual",
        signal: AbortSignal.timeout(15_000),
      }).catch(() => null)
      if (response && response.status >= 300 && response.status < 400) {
        refuse(`${host} redirected that photograph elsewhere; give the house the final URL: ${url}`)
      }
      if (!response?.ok) {
        refuse(`That photograph could not be fetched: ${url}`)
      }

      const mimeType = response!.headers.get("content-type")?.split(";")[0] ?? ""
      if (!mimeType.startsWith("image/")) {
        refuse(`A photograph is an image, and ${url} is ${mimeType || "of no stated type"}.`)
      }

      /* What the host says it is sending, before any of it is held in
         memory. A host that says nothing is still weighed after the fact. */
      const declared = Number(response!.headers.get("content-length"))
      if (Number.isFinite(declared) && declared > MAX_IMAGE_BYTES) {
        refuse(`A photograph is ${MAX_IMAGE_BYTES / 1024 / 1024} MB at most: ${url}`)
      }

      const buffer = Buffer.from(await response!.arrayBuffer())
      if (buffer.byteLength > MAX_IMAGE_BYTES) {
        refuse(`A photograph is ${MAX_IMAGE_BYTES / 1024 / 1024} MB at most: ${url}`)
      }

      return {
        filename: new URL(url).pathname.split("/").pop() || "photograph",
        mimeType,
        content: buffer.toString("base64"),
        access: "public" as const,
      }
    })
  )

  const { result } = await uploadFilesWorkflow(scope).run({ input: { files } })
  return result.map((file) => file.url)
}

/* Nothing is restocked, so stock is the run and nothing more — but an
   inventory item with no level yet (a first attempt that was cut off between
   creating the product and stocking it, or an update that is retrying a
   create that never got this far) gets one here, on any write, not only the
   one that first makes the product. */
async function stockRun(
  scope: MedusaRequest["scope"],
  sku: string,
  locationId: string,
  runSize: number
) {
  const query = scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data: unstocked } = await query.graph({
    entity: "inventory_item",
    fields: ["id", "location_levels.id"],
    filters: { sku },
  })
  const levels = unstocked
    .filter((item: { location_levels?: unknown[] | null }) => !item.location_levels?.length)
    .map((item: { id: string }) => ({
      location_id: locationId,
      inventory_item_id: item.id,
      stocked_quantity: runSize,
    }))
  if (levels.length) {
    await createInventoryLevelsWorkflow(scope).run({ input: { inventory_levels: levels } })
  }
}

/* The pieces, as the bench and an agent both need to see them: which season
   each belongs to, and which are still drafts waiting on someone. */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { collection } = req.query as { collection?: string }

  /* The season is asked of the database rather than filtered out here: a
     caller reading one season should not pull the whole catalogue across to
     do it. The two holding collections are still dropped below, along with
     anything that belongs to no collection at all. */
  const { data: products } = await query.graph({
    entity: "product",
    fields: [
      "handle",
      "title",
      "subtitle",
      "status",
      "thumbnail",
      "metadata",
      "collection.handle",
      "variants.prices.amount",
      "variants.prices.currency_code",
      "images.url",
    ],
    ...(collection ? { filters: { collection: { handle: collection } } } : {}),
  })

  type Priced = { prices?: { amount: number; currency_code: string }[] | null }
  type Imaged = { url: string }

  const pieces = products
    .filter((p) => {
      const handle = p.collection?.handle
      if (!handle || [COMMISSION_COLLECTION, SILHOUETTE_COLLECTION].includes(handle)) {
        return false
      }
      return collection ? handle === collection : true
    })
    .map((p) => {
      const meta = (p.metadata ?? {}) as Record<string, unknown>
      const francs = ((p.variants ?? []) as unknown as Priced[])
        .flatMap((v) => v.prices ?? [])
        .find((price) => price.currency_code === "chf")?.amount
      return {
        handle: p.handle,
        title: p.title,
        material: p.subtitle ?? "",
        collection: p.collection?.handle ?? null,
        status: p.status,
        group: (meta.group as string) ?? null,
        cloth: (meta.cloth as string) ?? null,
        price_chf: francs ?? null,
        length_kinds: (meta.length_kinds as string[]) ?? [],
        photographed: Boolean(p.thumbnail),
        /* What `images_action: 'remove'` takes URLs from. */
        images: ((p.images ?? []) as unknown as Imaged[]).map((img) => img.url),
      }
    })
    .sort((a, b) => a.handle.localeCompare(b.handle, "en", { numeric: true }))

  res.json({ pieces, count: pieces.length })
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const parsed = schema.safeParse(req.body)
  if (!parsed.success) {
    refuse(parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(" "))
  }
  const piece = parsed.data!

  if (piece.handle.startsWith("commission-")) {
    refuse(
      "A handle beginning 'commission-' belongs to the commission side of the " +
        "house, which is not cut from the catalogue."
    )
  }

  /* ---- The piece as it stands ---- */

  const { data: [existing] } = await query.graph({
    entity: "product",
    fields: [
      "id",
      "status",
      "metadata",
      "collection.id",
      "collection.handle",
      "variants.id",
      "variants.prices.amount",
      "variants.prices.currency_code",
      "images.id",
      "images.url",
    ],
    filters: { handle: piece.handle },
  })

  /* A piece that does not exist yet has to arrive whole; one that does may be
     corrected a field at a time. */
  if (!existing) {
    const missing = REQUIRED_TO_CUT.filter((field) => piece[field] === undefined)
    if (missing.length) {
      refuse(`A new piece needs ${missing.join(", ")}.`)
    }
  }

  /* ---- The season ---- */

  if (
    piece.collection &&
    [COMMISSION_COLLECTION, SILHOUETTE_COLLECTION].includes(piece.collection)
  ) {
    refuse(`${piece.collection} holds commissions, not a season's pieces.`)
  }
  /* Belt and suspenders alongside the `commission-` handle guard above: that
     guard holds only while commission and silhouette products keep that
     prefix by convention. This checks what the product is actually filed
     under, so a product that ever ends up in one of these collections by
     some other path stays out of the agent's reach too. */
  if (
    existing?.collection?.handle &&
    [COMMISSION_COLLECTION, SILHOUETTE_COLLECTION].includes(existing.collection.handle)
  ) {
    refuse(`${existing.collection.handle} holds commissions, not a season's pieces.`)
  }

  let collectionId: string = existing?.collection?.id ?? ""
  if (piece.collection) {
    const { data: [collection] } = await query.graph({
      entity: "product_collection",
      fields: ["id", "handle", "metadata"],
      filters: { handle: piece.collection },
    })
    if (!collection) {
      refuse(
        `There is no collection with the handle '${piece.collection}'. Open the ` +
          "season before cutting for it."
      )
    }
    collectionId = collection.id
  }

  /* `prices` is a link field: query resolves it, the generated entity types do
     not declare it. */
  type Priced = { id: string; prices?: { amount: number; currency_code: string }[] | null }
  const variants = (existing?.variants ?? []) as unknown as Priced[]
  const francs = variants
    .flatMap((v) => v.prices ?? [])
    .find((p) => p.currency_code === "chf")?.amount

  if (existing) {
    const published = existing.status === ProductStatus.PUBLISHED
    const moves = piece.price_chf !== undefined && Number(francs) !== piece.price_chf
    if (published && moves) {
      refuse(
        `${piece.handle} is published at CHF ${francs}. The house owns a published ` +
          "piece's price; change it in the admin."
      )
    }
    /* Publishing is where ownership changes hands, not just where the price
       locks. A collection move is a write like any other below, and this
       route's own collection_id write is not the gate the storefront's cart
       checks — opening a season (seasons/[handle]/open) is. Leaving a
       published piece writable here would let an agent slide it into the
       current season's collection without that gate ever running. So once a
       person has published a piece, the whole piece is theirs; an agent
       resending it, even unchanged, is refused and told where to go instead. */
    if (published) {
      refuse(`${piece.handle} is published. Edit it in the admin.`)
    }
  }

  /* ---- Photography ---- *
     `images` absent leaves photography untouched, whichever action was sent —
     a caller correcting a title has no reason to restate its photographs.
     Present, `images_action` says what it does to what the piece already
     carries: the new whole set (fetched), added to what is there (fetched,
     then appended), or taken off it by URL (no fetch — these are already the
     house's own, matched against what the piece carries and dropped). */

  type StoredImage = { id?: string; url: string }
  const existingImages = (existing?.images ?? []) as unknown as StoredImage[]

  let finalImages: StoredImage[] | undefined
  if (piece.images !== undefined) {
    if (piece.images_action === "remove") {
      if (!piece.images.length) {
        refuse("images_action 'remove' needs the photograph URLs to take off the piece.")
      }
      const toRemove = new Set(piece.images.map((i) => i.url))
      const missing = [...toRemove].filter(
        (url) => !existingImages.some((img) => img.url === url)
      )
      if (missing.length) {
        refuse(`${piece.handle} carries no photograph at ${missing.join(", ")}.`)
      }
      finalImages = existingImages.filter((img) => !toRemove.has(img.url))
    } else {
      const uploaded = await storeImages(req.scope, piece.images)
      finalImages =
        piece.images_action === "add"
          ? [...existingImages, ...uploaded.map((url) => ({ url }))]
          : uploaded.map((url) => ({ url }))
      if (finalImages.length > MAX_IMAGES) {
        refuse(
          `A piece carries ${MAX_IMAGES} photographs at most; ${piece.handle} would carry ` +
            `${finalImages.length}.`
        )
      }
    }
  }

  /* Merged here rather than left to the framework: a product's metadata is
     written whole, so sending only the fields a caller changed would blank
     everything it left out. What was there is carried forward, what was sent
     is laid over it, and an empty string retires a key. */
  const metadata: Record<string, unknown> = {
    ...((existing?.metadata ?? {}) as Record<string, unknown>),
    ...(piece.group !== undefined ? { group: piece.group } : {}),
    ...(piece.cloth !== undefined ? { cloth: piece.cloth } : {}),
    ...(piece.shot !== undefined ? { shot: piece.shot } : {}),
    ...(piece.sleep !== undefined ? { sleep: piece.sleep ? true : "" } : {}),
    ...(piece.length_kinds !== undefined ? { length_kinds: piece.length_kinds } : {}),
  }

  /* A stock location is read here, ahead of the write, because both branches
     below need it: a correction to an existing piece is retry-safe only if a
     stock level that an earlier, interrupted attempt never created still
     gets created now. */
  const { data: [location] } = await query.graph({
    entity: "stock_location",
    fields: ["id"],
  })

  /* ---- Write ---- */

  if (existing) {
    await updateProductsWorkflow(req.scope).run({
      input: {
        products: [
          {
            id: existing.id,
            ...(piece.title !== undefined ? { title: piece.title } : {}),
            ...(piece.material !== undefined ? { subtitle: piece.material } : {}),
            ...(piece.collection !== undefined ? { collection_id: collectionId } : {}),
            metadata,
            ...(finalImages !== undefined
              ? {
                  thumbnail: finalImages[0]?.url ?? null,
                  /* An id keeps a carried-forward image; without one, Medusa
                     creates a new row even when the URL already exists. */
                  images: finalImages.map((img) =>
                    img.id ? { id: img.id, url: img.url } : { url: img.url }
                  ),
                }
              : {}),
          },
        ],
      },
    })

    /* A draft's price is still the route's to set; a published one was
       refused above unless it is the same figure. */
    if (piece.price_chf !== undefined && Number(francs) !== piece.price_chf) {
      if (!variants[0]) {
        refuse(
          `${piece.handle} has no variant to price. Give it one in the admin, or ` +
            "delete it and send the piece again."
        )
      }
      await updateProductsWorkflow(req.scope).run({
        input: {
          products: [
            {
              id: existing.id,
              variants: [
                {
                  id: variants[0].id,
                  prices: [{ currency_code: "chf", amount: piece.price_chf! }],
                },
              ],
            },
          ],
        },
      })
    }

    if (location) {
      await stockRun(req.scope, `LINSILK-${piece.handle.toUpperCase()}`, location.id, piece.run_size ?? RUN_CAP)
    }

    res.json({ piece: { handle: piece.handle, id: existing.id, status: existing.status } })
    return
  }

  /* ---- Or create ---- *
     Everything the house does not ask a caller for is settled here: the draft
     status that keeps it off the site, the one option it offers, the sales
     channel, where it ships from and where it is stocked. */

  /* The house has to exist before a piece can be cut for it. A database that
     was migrated but never seeded has none of this, and saying so is more
     use than the TypeError that reading `.id` off nothing would give. */
  const { data: [store] } = await query.graph({
    entity: "store",
    fields: ["default_sales_channel_id"],
  })
  const { data: [shippingProfile] } = await query.graph({
    entity: "shipping_profile",
    fields: ["id"],
  })
  if (!store?.default_sales_channel_id || !shippingProfile || !location) {
    refuse(
      "The house is not provisioned yet: it needs a store with a sales channel, a " +
        "shipping profile and a stock location before a piece can be cut. Run the " +
        "seed (docs/BACKEND-RENDER.md)."
    )
  }

  /* Only a global option can belong to more than one piece. A commission
     carries a `Cut` of its own, exclusive to that one garment, so the title
     alone would sometimes find that instead and bind a season's piece to one
     client's private option. */
  const { data: [existingCut] } = await query.graph({
    entity: "product_option",
    fields: ["id"],
    filters: { title: "Cut", is_exclusive: false },
  })
  const cutId =
    existingCut?.id ??
    (
      await createProductOptionsWorkflow(req.scope).run({
        input: { product_options: [{ title: "Cut", values: ["Made to measure"] }] },
      })
    ).result[0].id

  const { result: created } = await createProductsWorkflow(req.scope).run({
    input: {
      products: [
        {
          title: piece.title!,
          subtitle: piece.material,
          handle: piece.handle,
          /* Nothing an agent writes reaches the site unreviewed. */
          status: ProductStatus.DRAFT,
          collection_id: collectionId,
          shipping_profile_id: shippingProfile.id,
          metadata,
          ...(finalImages?.length
            ? { thumbnail: finalImages[0].url, images: finalImages.map((img) => ({ url: img.url })) }
            : {}),
          sales_channels: [{ id: store.default_sales_channel_id! }],
          options: [{ id: cutId }],
          variants: [
            {
              title: "Made to measure",
              sku: `LINSILK-${piece.handle.toUpperCase()}`,
              options: { Cut: "Made to measure" },
              manage_inventory: true,
              allow_backorder: false,
              prices: [{ currency_code: "chf", amount: piece.price_chf! }],
            },
          ],
        },
      ],
    },
  })

  await stockRun(req.scope, `LINSILK-${piece.handle.toUpperCase()}`, location.id, piece.run_size ?? RUN_CAP)

  res
    .status(201)
    .json({ piece: { handle: piece.handle, id: created[0].id, status: ProductStatus.DRAFT } })
}
