import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { z } from "@medusajs/framework/zod"
import { ATELIER_MODULE } from "../../../modules/atelier"
import type AtelierModuleService from "../../../modules/atelier/service"

/* The queue the bench works from: briefs waiting on a quote, newest first.

   The page is read off the query string, so it is checked like any other
   input: a limit that is not a number reaches the database as one, and is
   answered with SQL rather than with words. */
const schema = z.object({
  status: z
    .enum(["submitted", "reviewed", "quoted", "approved", "declined", "in_production", "shipped"])
    .optional(),
  limit: z.coerce.number().int().positive().max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
})

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const atelier: AtelierModuleService = req.scope.resolve(ATELIER_MODULE)

  const parsed = schema.safeParse(req.query)
  if (!parsed.success) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(" ")
    )
  }
  const { status, limit, offset } = parsed.data

  const [commissions, count] = await atelier.listAndCountCommissions(
    status ? { status } : {},
    {
      order: { created_at: "DESC" },
      take: limit,
      skip: offset,
    }
  )

  res.json({ commissions, count })
}
