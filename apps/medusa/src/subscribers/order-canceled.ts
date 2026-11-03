import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { noticeForOrder, sendOrderMail } from "../lib/order-notice"
import { orderCanceledEmail } from "../lib/order-updates"
import { withdrawFirstOrderCredit } from "../lib/first-order-credit-run"

/* An order has been cancelled. Any refund is announced separately, when the
   money actually goes back (payment-refunded.ts). */
export default async function orderCanceledHandler({
  event,
  container,
}: SubscriberArgs<{ id: string }>) {
  await withdrawFirstOrderCredit(container, event.data.id)
  const order = await noticeForOrder(container, event.data.id)
  if (!order) return

  await sendOrderMail(container, orderCanceledEmail(order), order.id, `order-canceled:${order.id}`)
}

export const config: SubscriberConfig = {
  event: "order.canceled",
}
