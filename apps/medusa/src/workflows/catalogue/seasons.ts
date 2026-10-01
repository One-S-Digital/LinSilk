import { createStep, createWorkflow, StepResponse, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"
import type { IProductModuleService } from "@medusajs/framework/types"

/* Opening a season.
 *
 * At least two collections change at once: the one being opened becomes
 * `current`, and whichever were open become `past`. Those writes must not
 * come apart. A season that closed while nothing replaced it would leave the
 * shop empty; worse, two collections marked `current` would leave an
 * archived season quietly orderable, because `current` is the whole of the
 * cart's gate — which is also why every collection the route finds already
 * `current` is archived here, not only the first: two opens racing each
 * other must not be able to leave a second one standing.
 *
 * So all of it goes in one call to the product module, which settles them in
 * a single transaction, and the step restores exactly what it found if
 * anything after it fails.
 */

export type SeasonMetadata = Record<string, unknown>

type OpenInput = {
  /** The season being opened, and the metadata it should carry. */
  opening: { id: string; metadata: SeasonMetadata }
  /** Every season that was open, if any. Ordinarily at most one. */
  outgoing?: { id: string; metadata: SeasonMetadata }[]
}

type Restore = { id: string; metadata: SeasonMetadata }[]

const openStep = createStep(
  "open",
  async (input: OpenInput, { container }) => {
    const products: IProductModuleService = container.resolve(Modules.PRODUCT)

    const ids = [input.opening.id, ...(input.outgoing ?? []).map((o) => o.id)]
    const before = await products.listProductCollections({ id: ids }, { select: ["id", "metadata"] })
    const restore: Restore = before.map((c) => ({ id: c.id, metadata: c.metadata ?? {} }))

    const collections = await products.upsertProductCollections([
      { id: input.opening.id, metadata: input.opening.metadata },
      ...(input.outgoing ?? []),
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
