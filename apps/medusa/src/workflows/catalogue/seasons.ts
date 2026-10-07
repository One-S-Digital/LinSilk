import { createStep, createWorkflow, StepResponse, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys, MedusaError, Modules } from "@medusajs/framework/utils"
import { acquireLockStep, releaseLockStep } from "@medusajs/medusa/core-flows"
import type { IProductModuleService } from "@medusajs/framework/types"

/* Opening a season.
 *
 * At least two collections change at once: the one being opened becomes
 * `current`, and whichever were open become `past`. Those writes must not
 * come apart. A season that closed while nothing replaced it would leave the
 * shop empty; worse, two collections marked `current` would leave an
 * archived season quietly orderable, because `current` is the whole of the
 * cart's gate.
 *
 * So all of it goes in one call to the product module, which settles them in
 * a single transaction, and the step restores exactly what it found if
 * anything after it fails.
 *
 * Two opens of different seasons must also not overlap. Each would read the
 * same season as the one to close, and each would then open its own, leaving
 * both `current`. So the read of what is open and the write that replaces it
 * happen together, behind one lock, and whichever open comes second reads
 * what the first left. Every collection found `current` is archived, not only
 * the first, so a pair left standing is put right by the next open.
 */

export type SeasonMetadata = Record<string, unknown>

type OpenInput = {
  /** The season being opened. What it carries is read once the lock is held. */
  id: string
}

type Restore = { id: string; metadata: SeasonMetadata }[]

const SEASON_LOCK = "season-rollover"

const openStep = createStep(
  "open",
  async ({ id }: OpenInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const products: IProductModuleService = container.resolve(Modules.PRODUCT)

    const { data } = await query.graph({
      entity: "product_collection",
      fields: ["id", "handle", "metadata"],
    })
    const collections = data.map((c) => ({
      id: c.id,
      handle: c.handle,
      metadata: (c.metadata ?? {}) as SeasonMetadata,
    }))

    const opening = collections.find((c) => c.id === id)
    if (!opening) {
      throw new MedusaError(MedusaError.Types.NOT_FOUND, "That season no longer exists.")
    }

    /* Another open of this very season got here first: it is open, and there
       is nothing left to change. */
    if (opening.metadata.status === "current") {
      return new StepResponse({ archived: [] as { handle: string; status: string }[] }, [] as Restore)
    }
    /* Checked again now the lock is held — the season may have been opened
       and closed again while this request waited. */
    if (opening.metadata.status !== "pending") {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `${opening.handle} is not a season waiting to be opened.`
      )
    }

    const outgoing = collections.filter((c) => c.metadata.status === "current")

    /* Every season on its way out keeps its wording and loses its closing
       date — it has closed, so there is nothing left to say it is about to.
       Metadata is merged rather than replaced, so an empty string is what
       retires a key; dropping it from the object would leave the old value
       standing. */
    const restore: Restore = [opening, ...outgoing].map(({ id, metadata }) => ({ id, metadata }))

    await products.upsertProductCollections([
      { id, metadata: { ...opening.metadata, status: "current" } },
      ...outgoing.map(({ id, metadata }) => ({
        id,
        metadata: { ...metadata, status: "past", closes: "" },
      })),
    ])

    return new StepResponse(
      { archived: outgoing.map(({ handle }) => ({ handle, status: "past" })) },
      restore
    )
  },
  async (restore: Restore | undefined, { container }) => {
    if (!restore?.length) return
    const products: IProductModuleService = container.resolve(Modules.PRODUCT)
    await products.upsertProductCollections(restore)
  }
)

export const openSeasonWorkflow = createWorkflow("open-season", (input: OpenInput) => {
  /* Released by the step below once the rollover is written, and by this
     step's own compensation if anything fails first. The ttl is only so a
     process that dies holding it cannot keep the shop from ever rolling over. */
  acquireLockStep({ key: SEASON_LOCK, timeout: 30, ttl: 60 })
  const opened = openStep(input)
  releaseLockStep({ key: SEASON_LOCK })
  return new WorkflowResponse(opened)
})
