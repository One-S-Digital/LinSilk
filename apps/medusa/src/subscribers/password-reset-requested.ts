import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { AuthWorkflowEvents, ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { passwordResetEmail } from "../lib/account-emails"

type PasswordResetEvent = { entity_id: string; actor_type: string; token: string }

/* Someone asked to reset a password, for the emailpass provider only — Google
   and other providers have no password to reset. A customer is sent to the
   storefront to choose a new one; a member of staff, who asked from the admin
   login screen, to the admin's own reset page. Medusa sends neither email
   itself: it only announces the request. */
export default async function passwordResetRequestedHandler({
  event,
  container,
}: SubscriberArgs<PasswordResetEvent>) {
  const actor = event.data.actor_type
  if (actor !== "customer" && actor !== "user") return

  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const notification = container.resolve(Modules.NOTIFICATION)

  try {
    await notification.createNotifications(
      passwordResetEmail(event.data.entity_id, event.data.token, actor)
    )
  } catch (error) {
    /* The token still works if the client already has it some other way; it
       is the telling-them that failed. */
    logger.error(
      `Password reset for ${event.data.entity_id} could not be emailed: ${(error as Error).message}`
    )
  }
}

export const config: SubscriberConfig = {
  event: AuthWorkflowEvents.PASSWORD_RESET,
}
