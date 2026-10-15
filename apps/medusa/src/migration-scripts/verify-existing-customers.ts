import type { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { isVerifiedIdentity, markVerified } from "../lib/email-verification-state"

/* Every customer who existed before email verification arrived counts as
   verified, so switching it on locks nobody out of their saved sheet or
   addresses. Staff identities have no customer and are left alone. Accounts
   opened from now on start unverified. */
export default async function verifyExistingCustomers({ container }: { container: MedusaContainer }) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const auth = container.resolve(Modules.AUTH)

  const identities = await auth.listAuthIdentities({}, { take: null })
  const customers = identities.filter(
    (identity) => identity.app_metadata?.customer_id && !isVerifiedIdentity(identity)
  )
  for (const identity of customers) {
    await markVerified(container, identity)
  }
  if (customers.length) logger.info(`${customers.length} existing customers marked as email-verified.`)
}
