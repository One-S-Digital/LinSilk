import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { fulfillmentWithOrder, noticeForOrder, sendOrderMail } from "../lib/order-notice"
import { orderShippedEmail } from "../lib/order-updates"

/* A shipment has been registered: the client is told it is on its way, with
   the tracking the bench entered. The admin can switch the mail off for one
   shipment (`no_notification`), and that is honoured. */
export default async function shipmentCreatedHandler({
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
    orderShippedEmail(order, fulfillment),
    order.id,
    `order-shipped:${fulfillment.id}`
  )
}

export const config: SubscriberConfig = {
  event: "shipment.created",
}
