import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { commissionIdOf, type GatedVariant } from "../lib/archive"
import { orderConfirmationEmail, orderPlacedEmail, type OrderRecord } from "../lib/order-emails"

/* An order has been placed: the client is told so, and the atelier is given
   what it needs to read the sheet and write back. `order.placed` is not proof
   the money was taken — an order can be placed with the payment only
   authorised — so both emails say "paid" only when Medusa reports the payment
   captured, and otherwise say what state it is in.

   Which lines are commissions is read from the product, as commission-paid.ts
   does, never from the line's own metadata, which a client can write to. A
   commission is announced to the atelier by commission-paid.ts, so only the
   seasonal lines are sent on here. A mail that fails is logged and the order
   stands: the order exists whether or not anyone was told. */
export default async function orderPlacedHandler({
  event,
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const notification = container.resolve(Modules.NOTIFICATION)

  const { data: [found] } = await query.graph({
    entity: "order",
    fields: [
      "id",
      "display_id",
      "email",
      "currency_code",
      "item_total",
      "original_item_total",
      "item_discount_total",
      "discount_total",
      "payment_status",
      "shipping_total",
      "total",
      "items.title",
      "items.total",
      "items.metadata",
      "items.variant_id",
      "shipping_methods.name",
      "shipping_address.*",
    ],
    filters: { id: event.data.id },
  })
  if (!found) {
    logger.warn(`Order ${event.data.id} was placed but could not be read, so no email was sent.`)
    return
  }

  const variantIds = [
    ...new Set(
      (found.items ?? []).flatMap((item) => (item?.variant_id ? [item.variant_id] : []))
    ),
  ]
  const { data: variants } = variantIds.length
    ? await query.graph({
        entity: "variant",
        fields: ["id", "product.metadata"],
        filters: { id: variantIds },
      })
    : { data: [] }
  const commissionVariants = new Set(
    (variants as (GatedVariant & { id: string })[])
      .filter((variant) => commissionIdOf(variant) !== undefined)
      .map((variant) => variant.id)
  )

  const order: OrderRecord = {
    ...(found as unknown as OrderRecord),
    items: (found.items ?? []).flatMap((item) =>
      item
        ? [
            {
              title: item.title,
              total: item.total as number,
              metadata: item.metadata as Record<string, unknown> | null,
              commission: Boolean(item.variant_id && commissionVariants.has(item.variant_id)),
            },
          ]
        : []
    ),
  }

  const house = process.env.ATELIER_EMAIL
  const seasonal = order.items.some((line) => !line.commission)
  if (seasonal && !house) {
    logger.warn(`ATELIER_EMAIL is not set, so order ${order.id} was not announced to the atelier.`)
  }

  const emails = [
    ...(order.email ? [orderConfirmationEmail(order)] : []),
    ...(seasonal && house ? [orderPlacedEmail(order, house)] : []),
  ]
  if (!order.email) {
    logger.warn(`Order ${order.id} has no email address, so it could not be confirmed to the client.`)
  }

  for (const email of emails) {
    try {
      await notification.createNotifications(email)
    } catch (error) {
      logger.error(
        `Order ${order.id} placed, but its "${email.template}" email failed: ${
          (error as Error).message
        }`
      )
    }
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
