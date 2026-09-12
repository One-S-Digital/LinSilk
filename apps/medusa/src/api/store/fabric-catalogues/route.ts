import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ATELIER_MODULE } from "../../../modules/atelier"
import type AtelierModuleService from "../../../modules/atelier/service"

/* The cloth catalogues a client reads before naming the cloth they want.
   Published ones only, in the order the house set. */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const atelier: AtelierModuleService = req.scope.resolve(ATELIER_MODULE)

  const catalogues = await atelier.listFabricCatalogues(
    { published: true },
    { order: { rank: "ASC", created_at: "ASC" } }
  )

  res.json({
    fabric_catalogues: catalogues.map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      url: c.url,
      mime_type: c.mime_type,
      size: c.size,
    })),
  })
}
