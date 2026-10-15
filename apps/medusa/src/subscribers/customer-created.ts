import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys, CustomerWorkflowEvents, Modules } from "@medusajs/framework/utils"
import { emailVerificationEmail } from "../lib/account-emails"
import { createVerificationToken } from "../lib/email-verification"
import { verificationSecret } from "../lib/email-verification-state"

/* A new account: ask the client to confirm the address. Registration does not
   wait for it — the account works, and the storefront holds back what needs a
   confirmed address until the link is opened. */
export default async function customerCreatedHandler({ event, container }: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const customerId = event.data.id

  try {
    const customer = await container.resolve(Modules.CUSTOMER).retrieveCustomer(customerId)
    if (!customer.email) return
    await container
      .resolve(Modules.NOTIFICATION)
      .createNotifications(
        emailVerificationEmail(customer.email, createVerificationToken(customer.id, customer.email, verificationSecret(container)))
      )
  } catch (error) {
    /* The client can ask for another from the account page. */
    logger.error(`Verification for ${customerId} could not be emailed: ${(error as Error).message}`)
  }
}

export const config: SubscriberConfig = {
  event: CustomerWorkflowEvents.CREATED,
}
