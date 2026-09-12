import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { ATELIER_MODULE } from "../modules/atelier"
import type AtelierModuleService from "../modules/atelier/service"

/* An order for a commission closes the loop the quote opened: the client has
   agreed the figure and paid it, so the brief leaves the queue and goes to
   the bench. The link between the two rides on the line item, because that is
   what survives a cart becoming an order. */
export default async function commissionPaidHandler({
  event,
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const notification = container.resolve(Modules.NOTIFICATION)
  const atelier: AtelierModuleService = container.resolve(ATELIER_MODULE)

  const { data: [order] } = await query.graph({
    entity: "order",
    fields: ["id", "email", "items.metadata"],
    filters: { id: event.data.id },
  })

  const commissionId = (order?.items ?? [])
    .map((item) => item?.metadata?.commission_id)
    .find((id): id is string => typeof id === "string")

  if (!commissionId) {
    return
  }

  const commission = await atelier.retrieveCommission(commissionId).catch(() => null)
  if (!commission) {
    logger.warn(`Order ${order.id} names commission ${commissionId}, which no longer exists.`)
    return
  }

  await atelier.updateCommissions({
    id: commissionId,
    status: "in_production",
    order_id: order.id,
    paid_at: new Date(),
    /* The link has done its work, and it carried a measurement sheet. */
    access_token: null,
  } as never)

  logger.info(`Commission ${commissionId} paid; order ${order.id} is with the bench.`)

  try {
    await notification.createNotifications({
      to: process.env.ATELIER_EMAIL ?? "",
      channel: "email",
      template: "commission-paid",
      content: {
        subject: `Commission paid — ${commission.silhouette_title}, ${commission.name}`,
        text: [
          `${commission.name} has paid for their ${commission.silhouette_title.toLowerCase()}.`,
          "",
          `Cloth   ${commission.fabric}`,
          `Order   ${order.id}`,
          "",
          "The sheet is on the order line, and on the commission in the admin.",
        ].join("\n"),
      },
    })
  } catch (error) {
    logger.error(`Commission ${commissionId} is paid, but the bench was not told: ${(error as Error).message}`)
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
