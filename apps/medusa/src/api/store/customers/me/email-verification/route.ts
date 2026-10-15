import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError, Modules } from "@medusajs/framework/utils"
import { emailVerificationEmail } from "../../../../../lib/account-emails"
import { createAttemptLimit } from "../../../../../lib/attempt-limit"
import { createVerificationToken } from "../../../../../lib/email-verification"
import { isSessionVerified, verificationSecret } from "../../../../../lib/email-verification-state"

/* Whether the signed-in client has confirmed their address, and a way to ask
   for the link again. /store/customers/me* already requires a session. */

/* Three links an hour per client: enough for a lost email, too few to use the
   house's sender to flood an inbox. */
const resends = createAttemptLimit({ max: 3, windowMs: 60 * 60 * 1000 })

export const GET = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  res.json({ verified: await isSessionVerified(req.scope, req.auth_context.auth_identity_id) })
}

export const POST = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  if (await isSessionVerified(req.scope, req.auth_context.auth_identity_id)) {
    return res.json({ verified: true })
  }

  const customerId = req.auth_context.actor_id
  const wait = resends.waitSeconds(customerId)
  if (wait) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      `A link was sent just now. Try again in ${Math.ceil(wait / 60)} minutes.`
    )
  }
  resends.fail(customerId)

  const customer = await req.scope.resolve(Modules.CUSTOMER).retrieveCustomer(customerId)
  await req.scope
    .resolve(Modules.NOTIFICATION)
    .createNotifications(
      emailVerificationEmail(customer.email, createVerificationToken(customer.id, customer.email, verificationSecret(req.scope)))
    )
  res.json({ verified: false, sent: true })
}
