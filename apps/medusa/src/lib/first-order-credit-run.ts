import type { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import {
  creditAmount,
  creditCode,
  expiryFrom,
  firstOrderCreditEmail,
  hasEarlierOrder,
  type PriorOrder,
} from "./first-order-credit"
import { sendOrderMail } from "./order-notice"
import type { OrderRecord } from "./order-emails"

/* Issuing, and taking back, the first-order credit (first-order-credit.ts).

   Issued when the order is delivered, and only if it is still the client's
   first: no earlier order from the same account, email or address, and no
   refund; the mail is left out when the delivery was recorded without
   notifying the client. A credit already issued is left alone, so a repeated event writes
   nothing twice. Taken back, while unspent, if the order is later cancelled
   or refunded. */

const secret = () => process.env.JWT_SECRET ?? "development-secret"

const ORDER_FIELDS = [
  "id", "display_id", "email", "customer_id", "currency_code", "status", "created_at",
  "item_total", "item_tax_total", "total", "shipping_address.*",
  "payment_collections.refunded_amount",
]

export async function issueFirstOrderCredit(
  container: MedusaContainer,
  orderId: string,
  { notify = true }: { notify?: boolean } = {}
) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const promotions = container.resolve(Modules.PROMOTION)

  const { data: [order] } = await query.graph({ entity: "order", fields: ORDER_FIELDS, filters: { id: orderId } })
  if (!order || order.status === "canceled") return
  const refunded = (order.payment_collections ?? []).some((c) => Number(c?.refunded_amount ?? 0) > 0)
  if (refunded) return

  const code = creditCode(order.id, secret())
  if ((await promotions.listPromotions({ code: [code] })).length) return

  const created = new Date(order.created_at as string | Date)
  const { data: others } = await query.graph({
    entity: "order",
    fields: ["id", "status", "customer_id", "email", "shipping_address.*"],
    filters: {
      ...(order.customer_id ? { customer_id: order.customer_id } : { email: order.email as string }),
      created_at: { $lte: created },
    },
  })
  /* An earlier order to the same address under another email is found by
     address: the street, postcode and country of this order. */
  const a = order.shipping_address
  const { data: sameAddress } = a?.postal_code
    ? await query.graph({
        entity: "order",
        fields: ["id", "status", "customer_id", "email", "shipping_address.*"],
        filters: { shipping_address: { postal_code: a.postal_code, country_code: a.country_code }, created_at: { $lte: created } },
      })
    : { data: [] }

  const earlier = [...others, ...sameAddress] as unknown as PriorOrder[]
  if (hasEarlierOrder(order as unknown as PriorOrder, earlier)) return

  const amount = creditAmount(Number(order.item_total) - Number(order.item_tax_total ?? 0))
  if (amount <= 0) return

  const expires = expiryFrom(new Date())
  await promotions.createPromotions({
    code,
    type: "standard",
    status: "active",
    is_automatic: false,
    application_method: {
      type: "fixed",
      target_type: "order",
      allocation: "across",
      value: amount,
      currency_code: order.currency_code,
    },
    campaign: {
      name: `First-order credit — ${order.id}`,
      campaign_identifier: code,
      ends_at: expires,
      budget: { type: "usage", limit: 1 },
    },
  })
  logger.info(`Order ${order.id} earned a first-order credit of ${amount} ${order.currency_code}.`)

  if (!notify) return
  await sendOrderMail(
    container,
    firstOrderCreditEmail(order as unknown as OrderRecord, { code, amount, expires }),
    order.id,
    `first-order-credit:${order.id}`
  )
}

/** The credit an order earned is withdrawn if it has not been spent. */
export async function withdrawFirstOrderCredit(container: MedusaContainer, orderId: string) {
  const promotions = container.resolve(Modules.PROMOTION)
  const [promotion] = await promotions.listPromotions(
    { code: [creditCode(orderId, secret())] },
    { relations: ["campaign", "campaign.budget"] }
  )
  if (!promotion || promotion.status === "inactive") return
  if (Number(promotion.campaign?.budget?.used ?? 0) > 0) return
  await promotions.updatePromotions([{ id: promotion.id, status: "inactive" }])
}
