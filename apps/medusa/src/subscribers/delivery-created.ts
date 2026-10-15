import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { fulfillmentWithOrder, noticeForOrder, sendOrderMail } from "../lib/order-notice"
import { orderDeliveredEmail } from "../lib/order-updates"

/* The bench has marked a fulfilment as delivered. */
export default async function deliveryCreatedHandler({
  event,
  container,
}: SubscriberArgs<{ id: string; no_notification?: boolean }>) {
  if (event.data.no_notification) return

  const fulfillment = await fulfillmentWithOrder(container, event.data.id)
  if (!fulfillment) return
  const order = await noticeForOrder(container, fulfillment.order_id)
  if (!order) return

  await sendOrderMail(
    container,
    orderDeliveredEmail(order),
    order.id,
    `order-delivered:${fulfillment.id}`
  )
}

export const config: SubscriberConfig = {
  event: "delivery.created",
}
