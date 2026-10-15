import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import {
  noticeForOrder,
  paymentWithOrder,
  sendOrderMail,
  toldItIsPaid,
} from "../lib/order-notice"
import { paymentReceivedEmail } from "../lib/order-updates"

/* The money has been taken. A client who paid at the till was already told so
   by the confirmation (order-placed.ts), so this is for the one whose payment
   was only authorised then and captured since. A missed mail is worse than a
   doubled one, so the only thing that silences this is the confirmation
   having said "paid". A payment that belongs to no order yet is ignored. */
export default async function paymentCapturedHandler({
  event,
  container,
}: SubscriberArgs<{ id: string }>) {
  const payment = await paymentWithOrder(container, event.data.id)
  if (!payment || (await toldItIsPaid(container, payment.order_id))) return

  const order = await noticeForOrder(container, payment.order_id)
  if (!order) return

  await sendOrderMail(
    container,
    paymentReceivedEmail(order, payment.amount),
    order.id,
    `payment-received:${payment.id}`
  )
}

export const config: SubscriberConfig = {
  event: "payment.captured",
}
