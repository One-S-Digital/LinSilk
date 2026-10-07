import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { ATELIER_MODULE } from "../modules/atelier"
import type AtelierModuleService from "../modules/atelier/service"
import {
  commissionReceivedEmail,
  commissionSubmittedEmail,
  type CommissionRecord,
} from "../lib/commission-emails"

/* A commission is priced by a person, so the only thing the machine can do is
   make sure a person hears about it — and tell the client a person will. */
export default async function commissionSubmittedHandler({
  event,
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const notification = container.resolve(Modules.NOTIFICATION)
  const atelier: AtelierModuleService = container.resolve(ATELIER_MODULE)

  const commission = (await atelier.retrieveCommission(event.data.id)) as CommissionRecord
  const house = process.env.ATELIER_EMAIL

  if (!house) {
    logger.warn(
      `ATELIER_EMAIL is not set, so commission ${commission.id} was not announced to anyone.`
    )
  }

  const emails = [
    ...(house ? [commissionSubmittedEmail(commission, house)] : []),
    commissionReceivedEmail(commission),
  ]

  for (const email of emails) {
    try {
      await notification.createNotifications(email)
    } catch (error) {
      /* A brief that is saved but unannounced is recoverable; one that is
         lost because the mail failed is not. */
      logger.error(
        `Commission ${commission.id} saved, but "${email.template}" to ${email.to} failed: ${
          (error as Error).message
        }`
      )
    }
  }
}

export const config: SubscriberConfig = {
  event: "commission.submitted",
}
