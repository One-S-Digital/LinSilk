import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import { ATELIER_MODULE } from "../../../../modules/atelier"
import type AtelierModuleService from "../../../../modules/atelier/service"

/* What the client sees when they open the link in their quote: the brief they
   sent, the figure a tailor set, and the cart that figure became. The token
   is the only key — the brief holds a person's measurements, so nothing here
   is reachable without it. */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const atelier: AtelierModuleService = req.scope.resolve(ATELIER_MODULE)
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const [commission] = await atelier.listCommissions({ access_token: req.params.token })
  if (!commission) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "No commission answers to that link.")
  }

  /* Only the currency and the figure travel to the browser; the sheet stays
     with the house and the bench. */
  const { data: [region] } = commission.cart_id
    ? await query.graph({
        entity: "cart",
        fields: ["region.id", "region.name", "region.currency_code"],
        filters: { id: commission.cart_id },
      })
    : { data: [] }

  res.json({
    commission: {
      id: commission.id,
      status: commission.status,
      name: commission.name,
      email: commission.email,
      silhouette_title: commission.silhouette_title,
      fabric: commission.fabric,
      note: commission.note,
      quote_amount: commission.quote_amount ? Number(commission.quote_amount) : null,
      currency_code: commission.currency_code,
      cart_id: commission.cart_id,
      paid_at: commission.paid_at,
      order_id: commission.order_id,
      region: region?.region ?? null,
    },
  })
}
