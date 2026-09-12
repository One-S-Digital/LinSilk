import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
  deleteFabricCatalogueWorkflow,
  updateFabricCatalogueWorkflow,
} from "../../../../workflows/atelier/fabric-catalogues"

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const body = req.body as {
    title?: string
    description?: string
    rank?: number
    published?: boolean
  }

  const { result: fabric_catalogue } = await updateFabricCatalogueWorkflow(req.scope).run({
    input: {
      id: req.params.id,
      ...(body.title !== undefined ? { title: body.title } : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
      ...(body.rank !== undefined ? { rank: Number(body.rank) } : {}),
      ...(body.published !== undefined ? { published: Boolean(body.published) } : {}),
    },
  })

  res.json({ fabric_catalogue })
}

export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  await deleteFabricCatalogueWorkflow(req.scope).run({ input: req.params.id })
  res.json({ id: req.params.id, object: "fabric_catalogue", deleted: true })
}
