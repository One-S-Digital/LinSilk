import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { noticeForOrder, paymentWithOrder, sendOrderMail } from "../lib/order-notice"
import { paymentRefundedEmail } from "../lib/order-updates"

/* Money has gone back to the client. The event names the payment, not the
   refund, so the amount is that of the most recent refund on it; each refund
   has its own key, so a second partial refund is told as its own. */
export default async function paymentRefundedHandler({
  event,
  container,
}: SubscriberArgs<{ id: string }>) {
  const payment = await paymentWithOrder(container, event.data.id)
  if (!payment?.latest_refund) return

  const order = await noticeForOrder(container, payment.order_id)
  if (!order) return

  await sendOrderMail(
    container,
    paymentRefundedEmail(order, payment.latest_refund.amount),
    order.id,
    `payment-refunded:${payment.latest_refund.id}`
  )
}

export const config: SubscriberConfig = {
  event: "payment.refunded",
}
