import { createStep, createWorkflow, StepResponse, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"
import { ATELIER_MODULE } from "../../modules/atelier"
import type AtelierModuleService from "../../modules/atelier/service"

/* Publishing, hiding and deleting a cloth catalogue. */

type CreateInput = {
  title: string
  description: string | null
  file_id: string
  url: string
  mime_type: string
  size: number
  rank: number
}

const createStep_ = createStep(
  "create-fabric-catalogue",
  async (input: CreateInput, { container }) => {
    const atelier: AtelierModuleService = container.resolve(ATELIER_MODULE)
    const catalogue = await atelier.createFabricCatalogues(input)
    return new StepResponse(catalogue, catalogue.id)
  },
  async (id: string | undefined, { container }) => {
    if (!id) return
    const atelier: AtelierModuleService = container.resolve(ATELIER_MODULE)
    await atelier.deleteFabricCatalogues(id)
  }
)

export const createFabricCatalogueWorkflow = createWorkflow(
  "create-fabric-catalogue",
  (input: CreateInput) => new WorkflowResponse(createStep_(input))
)

type UpdateInput = {
  id: string
  title?: string
  description?: string | null
  rank?: number
  published?: boolean
}

const updateStep_ = createStep(
  "update-fabric-catalogue",
  async (input: UpdateInput, { container }) => {
    const atelier: AtelierModuleService = container.resolve(ATELIER_MODULE)
    const before = await atelier.retrieveFabricCatalogue(input.id)
    const catalogue = await atelier.updateFabricCatalogues(input)
    return new StepResponse(catalogue, before)
  },
  async (before: Record<string, unknown> | undefined, { container }) => {
    if (!before) return
    const atelier: AtelierModuleService = container.resolve(ATELIER_MODULE)
    await atelier.updateFabricCatalogues(before as never)
  }
)

export const updateFabricCatalogueWorkflow = createWorkflow(
  "update-fabric-catalogue",
  (input: UpdateInput) => new WorkflowResponse(updateStep_(input))
)

/* The record is what the storefront reads, so it goes first. The file is
   tidied after, and a provider that refuses must not resurrect the
   catalogue. */
const deleteStep_ = createStep(
  "delete-fabric-catalogue",
  async (id: string, { container }) => {
    const atelier: AtelierModuleService = container.resolve(ATELIER_MODULE)
    const fileModule = container.resolve(Modules.FILE)

    const catalogue = await atelier.retrieveFabricCatalogue(id)
    await atelier.deleteFabricCatalogues(id)

    try {
      await fileModule.deleteFiles(catalogue.file_id)
    } catch {
      // Already gone, or the provider refused. The record is what mattered.
    }

    return new StepResponse({ id, deleted: true })
  }
)

export const deleteFabricCatalogueWorkflow = createWorkflow(
  "delete-fabric-catalogue",
  (input: string) => new WorkflowResponse(deleteStep_(input))
)
