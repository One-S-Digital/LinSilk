import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, MedusaError, ProductStatus } from "@medusajs/framework/utils"
import { openSeasonWorkflow } from "../../../../../../workflows/catalogue/seasons"

/* Opening a season — the one deliberate act in the catalogue.
 *
 * `current` is the whole of the archive gate: the cart refuses a piece from
 * anything else, and the storefront shops the current collection and reads the
 * rest. So a rollover is two writes that must not come apart, and this is the
 * only route that makes them.
 *
 * It is a person's act, not something ingestion does as a side effect. An
 * agent may prepare a season for weeks; opening it is still someone saying so.
 */

function refuse(message: string): never {
  throw new MedusaError(MedusaError.Types.INVALID_DATA, message)
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { handle } = req.params

  const { data: collections } = await query.graph({
    entity: "product_collection",
    fields: ["id", "handle", "title", "metadata"],
  })

  const season = collections.find((c) => c.handle === handle)
  if (!season) {
    refuse(`There is no collection with the handle '${handle}'.`)
  }

  const meta = (season.metadata ?? {}) as Record<string, unknown>
  const status = meta.status as string | undefined

  /* Already open: say so and change nothing, so a caller that lost its answer
     can ask again. */
  if (status === "current") {
    res.json({ season: { handle, id: season.id, status: "current" }, archived: null })
    return
  }
  if (status !== "pending") {
    refuse(
      status === "past"
        ? `${handle} is archived. A closed season is not opened again — nothing in it is cut twice.`
        : `${handle} is not a season waiting to be opened.`
    )
  }

  /* A season opens onto something. An empty collection would replace the shop
     with a blank page, and a rail of drafts nobody has published is the same
     thing with more steps. */
  const { data: pieces } = await query.graph({
    entity: "product",
    fields: ["id", "status"],
    filters: { collection: { handle } },
  })
  const published = pieces.filter((p) => p.status === ProductStatus.PUBLISHED)
  if (!published.length) {
    const drafts = pieces.filter((p) => p.status === ProductStatus.DRAFT).length
    refuse(
      drafts
        ? `${handle} has ${drafts} piece(s), none of them published. Publish them before opening the season.`
        : `${handle} has no pieces. There is nothing to open.`
    )
  }

  /* Which seasons are open, and which of them to close, is settled inside the
     workflow, behind a lock: read here, it could already be out of date by the
     time a second open had written. */
  const { result } = await openSeasonWorkflow(req.scope).run({ input: { id: season.id } })

  res.json({
    season: { handle, id: season.id, status: "current", pieces: published.length },
    archived: result.archived,
  })
}
