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
  let failure: unknown
  try {
    await issueFirstOrderCredit(container, fulfillment.order_id, { notify: !event.data.no_notification })
  } catch (error) {
    failure = error
    container.resolve("logger").error(`First-order credit for ${fulfillment.order_id} failed: ${(error as Error).message}`)
  }

  if (!event.data.no_notification) {
    const order = await noticeForOrder(container, fulfillment.order_id)
    if (order) {
      await sendOrderMail(
        container,
        orderDeliveredEmail(order),
        order.id,
        `order-delivered:${fulfillment.id}`
      )
    }
  }

  /* The delivery notice is out; a failed credit is raised so the event is
     tried again (both mails carry keys, so nothing is sent twice). */
  if (failure) throw failure
}

export const config: SubscriberConfig = {
  event: "delivery.created",
}
