import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { noticeForOrder, paymentWithOrder, sendOrderMail } from "../lib/order-notice"
import { paymentRefundedEmail } from "../lib/order-updates"
import { withdrawFirstOrderCredit } from "../lib/first-order-credit-run"

/* Money has gone back to the client. The event names the payment, not the
   refund, so the amount is that of the most recent refund on it; each refund
   has its own key, so a second partial refund is told as its own. */
export default async function paymentRefundedHandler({
  event,
  container,
}: SubscriberArgs<{ id: string }>) {
  const payment = await paymentWithOrder(container, event.data.id)
  if (!payment?.latest_refund) return

  /* The notice goes out whatever happens to the credit; a failure to take
     it back is raised afterwards so the event is tried again. */
  let failure: unknown
  try {
    await withdrawFirstOrderCredit(container, payment.order_id)
  } catch (error) {
    failure = error
  }
  const order = await noticeForOrder(container, payment.order_id)
  if (order) {
    await sendOrderMail(
      container,
      paymentRefundedEmail(order, payment.latest_refund.amount),
      order.id,
      `payment-refunded:${payment.latest_refund.id}`
    )
  }
  if (failure) throw failure
}

export const config: SubscriberConfig = {
  event: "payment.refunded",
}
