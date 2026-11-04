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
  /* The notice goes out whatever happens to the credit; a failure to take
     it back is raised afterwards so the event is tried again. */
  let failure: unknown
  try {
    await withdrawFirstOrderCredit(container, event.data.id)
  } catch (error) {
    failure = error
  }
  const order = await noticeForOrder(container, event.data.id)
  if (order) await sendOrderMail(container, orderCanceledEmail(order), order.id, `order-canceled:${order.id}`)
  if (failure) throw failure
}

export const config: SubscriberConfig = {
  event: "order.canceled",
}
