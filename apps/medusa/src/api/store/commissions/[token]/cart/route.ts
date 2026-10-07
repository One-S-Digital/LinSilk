import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { z } from "@medusajs/framework/zod"
import { openCommissionCartWorkflow } from "../../../../../workflows/atelier/commission-cart"

/* The client has a figure and a link; this is where it becomes payable. */
const schema = z.object({ country_code: z.string().trim().length(2) })

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "A two-letter country is needed.")
  }

  const { result } = await openCommissionCartWorkflow(req.scope).run({
    input: { token: req.params.token, country_code: parsed.data.country_code },
  })

  res.json(result)
}
