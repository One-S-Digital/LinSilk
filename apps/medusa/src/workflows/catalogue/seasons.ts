import { createStep, createWorkflow, StepResponse, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"
import type { IProductModuleService } from "@medusajs/framework/types"

/* Opening a season.
 *
 * Two collections change at once: the one being opened becomes `current`, and
 * the one that was open becomes `past`. Those two writes must not come apart.
 * A season that closed while nothing replaced it would leave the shop empty;
 * worse, two collections marked `current` would leave an archived season
 * quietly orderable, because `current` is the whole of the cart's gate.
 *
 * So both go in one call to the product module, which settles them in a single
 * transaction, and the step restores exactly what it found if anything after
 * it fails.
 */

export type SeasonMetadata = Record<string, unknown>

type OpenInput = {
  /** The season being opened, and the metadata it should carry. */
  opening: { id: string; metadata: SeasonMetadata }
  /** The season that was open, if there was one. */
  outgoing?: { id: string; metadata: SeasonMetadata }
}

type Restore = { id: string; metadata: SeasonMetadata }[]

const openStep = createStep(
  "open-season",
  async (input: OpenInput, { container }) => {
    const products: IProductModuleService = container.resolve(Modules.PRODUCT)

    const ids = [input.opening.id, ...(input.outgoing ? [input.outgoing.id] : [])]
    const before = await products.listProductCollections({ id: ids }, { select: ["id", "metadata"] })
    const restore: Restore = before.map((c) => ({ id: c.id, metadata: c.metadata ?? {} }))

    const collections = await products.upsertProductCollections([
      { id: input.opening.id, metadata: input.opening.metadata },
      ...(input.outgoing ? [{ id: input.outgoing.id, metadata: input.outgoing.metadata }] : []),
    ])

    return new StepResponse(collections, restore)
  },
  async (restore: Restore | undefined, { container }) => {
    if (!restore?.length) return
    const products: IProductModuleService = container.resolve(Modules.PRODUCT)
    await products.upsertProductCollections(restore)
  }
)

export const openSeasonWorkflow = createWorkflow(
  "open-season",
  (input: OpenInput) => new WorkflowResponse(openStep(input))
)
