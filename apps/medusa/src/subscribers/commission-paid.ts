import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { commissionIdOf, type GatedVariant } from "../lib/archive"
import { ATELIER_MODULE } from "../modules/atelier"
import type AtelierModuleService from "../modules/atelier/service"

/* An order for a commission closes the loop the quote opened: the client has
   agreed the figure and paid it, so the brief leaves the queue and goes to
   the bench.

   Which commission an order paid for is read from what was bought: each
   line's variant belongs to a product the house made for one commission, and
   names it. It is never read from the line's own metadata — a client can put
   anything there, so a commission id on an unrelated line would otherwise mark
   someone else's commission paid, and one taken off the line would leave a
   real purchase unrecorded. */
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
    fields: ["id", "email", "items.variant_id"],
    filters: { id: event.data.id },
  })

  const variantIds = [
    ...new Set((order?.items ?? []).flatMap((item) => (item?.variant_id ? [item.variant_id] : []))),
  ]
  if (!variantIds.length) {
    return
  }
  const { data: variants } = await query.graph({
    entity: "variant",
    fields: ["id", "product.metadata"],
    filters: { id: variantIds },
  })
  const commissionIds = [
    ...new Set((variants as GatedVariant[]).flatMap((variant) => commissionIdOf(variant) ?? [])),
  ]

  for (const commissionId of commissionIds) {
    const commission = await atelier.retrieveCommission(commissionId).catch(() => null)
    if (!commission) {
      logger.warn(`Order ${order.id} bought commission ${commissionId}, which no longer exists.`)
      continue
    }

    /* The same event arriving twice must not rewrite the record of the first. */
    if (commission.paid_at) {
      logger.info(`Commission ${commissionId} was already paid for; order ${order.id} changes nothing.`)
      continue
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
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
