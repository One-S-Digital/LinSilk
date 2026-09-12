import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ATELIER_MODULE } from "../../../modules/atelier"
import type AtelierModuleService from "../../../modules/atelier/service"

/* The queue the bench works from: briefs waiting on a quote, newest first. */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const atelier: AtelierModuleService = req.scope.resolve(ATELIER_MODULE)
  const { status, limit, offset } = req.query as {
    status?: string
    limit?: string
    offset?: string
  }

  const [commissions, count] = await atelier.listAndCountCommissions(
    status ? { status } : {},
    {
      order: { created_at: "DESC" },
      take: Number(limit ?? 50),
      skip: Number(offset ?? 0),
    }
  )

  res.json({ commissions, count })
}
