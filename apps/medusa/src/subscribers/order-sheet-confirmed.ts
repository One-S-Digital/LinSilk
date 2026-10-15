import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { noticeForOrder, sendOrderMail } from "../lib/order-notice"
import { orderConfirmedEmail } from "../lib/order-updates"

/* The atelier has read the measurement sheet and confirmed it — the step the
   confirmation email promised. Emitted by confirmOrderSheetWorkflow, which an
   admin runs from the order page. */
export default async function orderSheetConfirmedHandler({
  event,
  container,
}: SubscriberArgs<{ id: string }>) {
  const order = await noticeForOrder(container, event.data.id)
  if (!order) return

  await sendOrderMail(container, orderConfirmedEmail(order), order.id, `order-confirmed:${order.id}`)
}

export const config: SubscriberConfig = {
  event: "order.sheet_confirmed",
}
