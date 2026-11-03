import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { fulfillmentWithOrder, noticeForOrder, sendOrderMail } from "../lib/order-notice"
import { orderDeliveredEmail } from "../lib/order-updates"
import { issueFirstOrderCredit } from "../lib/first-order-credit-run"

/* The bench has marked a fulfilment as delivered. */
export default async function deliveryCreatedHandler({
  event,
  container,
}: SubscriberArgs<{ id: string; no_notification?: boolean }>) {
  const fulfillment = await fulfillmentWithOrder(container, event.data.id)
  if (!fulfillment) return

  /* The first-order credit is earned by the delivery, told or not. */
  try {
    await issueFirstOrderCredit(container, fulfillment.order_id, { notify: !event.data.no_notification })
  } catch (error) {
    container.resolve("logger").error(`First-order credit for ${fulfillment.order_id} failed: ${(error as Error).message}`)
  }
  if (event.data.no_notification) return

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
