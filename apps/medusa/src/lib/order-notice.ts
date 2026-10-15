import type { CreateNotificationDTO, MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import type { OrderNotice } from "./order-updates"

/* What the order subscribers share: finding the order an event is about,
   reading what a client-facing mail needs of it, and sending the mail.

   Medusa's payment and fulfilment events carry only their own id, so the
   order is found through the link between them. A mail that fails is logged
   and nothing else: the payment, the shipment and the cancellation have
   already happened whether or not anyone was told. */

export async function noticeForOrder(
  container: MedusaContainer,
  orderId: string
): Promise<OrderNotice | undefined> {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data: [order] } = await query.graph({
    entity: "order",
    fields: [
      "id",
      "display_id",
      "email",
      "currency_code",
      "total",
      "items.title",
      "shipping_address.*",
    ],
    filters: { id: orderId },
  })
  if (!order) return undefined
  return {
    ...(order as unknown as OrderNotice),
    items: (order.items ?? []).flatMap((item) => (item ? [{ title: item.title }] : [])),
  }
}

export type PaymentFacts = {
  id: string
  amount: number
  /** The refund made last, if there is one. */
  latest_refund?: { id: string; amount: number }
  order_id: string
}

/** The payment an event named, and the order it was for. Undefined when the
    payment belongs to no order (a cart not yet placed). */
export async function paymentWithOrder(
  container: MedusaContainer,
  paymentId: string
): Promise<PaymentFacts | undefined> {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data: [payment] } = await query.graph({
    entity: "payment",
    fields: ["id", "amount", "payment_collection_id", "refunds.id", "refunds.amount", "refunds.created_at"],
    filters: { id: paymentId },
  })
  if (!payment?.payment_collection_id) return undefined

  const { data: [link] } = await query.graph({
    entity: "order_payment_collection",
    fields: ["order_id"],
    filters: { payment_collection_id: payment.payment_collection_id },
  })
  if (!link?.order_id) return undefined

  const refunds = [...(payment.refunds ?? [])]
    .flatMap((refund) => (refund ? [refund] : []))
    .sort((a, b) => new Date(b.created_at as string).getTime() - new Date(a.created_at as string).getTime())

  return {
    id: payment.id,
    amount: Number(payment.amount),
    latest_refund: refunds[0] ? { id: refunds[0].id, amount: Number(refunds[0].amount) } : undefined,
    order_id: link.order_id,
  }
}

export type FulfillmentFacts = {
  id: string
  order_id: string
  tracking_number?: string | null
  tracking_url?: string | null
}

/** The fulfilment an event named, with its first tracking label, and the order
    it belongs to. */
export async function fulfillmentWithOrder(
  container: MedusaContainer,
  fulfillmentId: string
): Promise<FulfillmentFacts | undefined> {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data: [fulfillment] } = await query.graph({
    entity: "fulfillment",
    fields: ["id", "labels.tracking_number", "labels.tracking_url"],
    filters: { id: fulfillmentId },
  })
  if (!fulfillment) return undefined

  const { data: [link] } = await query.graph({
    entity: "order_fulfillment",
    fields: ["order_id"],
    filters: { fulfillment_id: fulfillmentId },
  })
  if (!link?.order_id) return undefined

  const label = (fulfillment.labels ?? []).find((l) => l?.tracking_number || l?.tracking_url)
  return {
    id: fulfillment.id,
    order_id: link.order_id,
    tracking_number: label?.tracking_number,
    tracking_url: label?.tracking_url,
  }
}

/** Whether the client was already told, in the confirmation sent when the
    order was placed, that it is paid for. */
export async function toldItIsPaid(container: MedusaContainer, orderId: string) {
  const notification = container.resolve(Modules.NOTIFICATION)
  const sent = await notification.listNotifications({
    resource_id: orderId,
    template: "order-confirmation",
  })
  return sent.some((n) => n.status === "success" && (n.data as { paid?: boolean } | null)?.paid === true)
}

/** Send one mail about an order, once. The same key is never sent twice — a
    repeated event does not write to the client again — but a send that failed
    is tried again, which is how the notification module treats its keys. */
export async function sendOrderMail(
  container: MedusaContainer,
  mail: CreateNotificationDTO,
  orderId: string,
  key: string
) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  if (!mail.to) {
    logger.warn(`Order ${orderId} has no email address, so its "${mail.template}" mail was not sent.`)
    return false
  }
  try {
    await container.resolve(Modules.NOTIFICATION).createNotifications({
      ...mail,
      resource_id: orderId,
      resource_type: "order",
      idempotency_key: key,
    })
    return true
  } catch (error) {
    logger.error(`Order ${orderId}: its "${mail.template}" mail failed: ${(error as Error).message}`)
    return false
  }
}
