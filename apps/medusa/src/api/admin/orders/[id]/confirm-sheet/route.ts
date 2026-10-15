import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { confirmOrderSheetWorkflow } from "../../../../../workflows/orders/confirm-order-sheet"

/* The atelier confirms a client's measurement sheet; the client is told by
   email. Guarded by the order:update permission in middlewares.ts. */
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const { result } = await confirmOrderSheetWorkflow(req.scope).run({
    input: { id: req.params.id },
  })
  res.json({ confirmed_at: result.confirmed_at })
}
