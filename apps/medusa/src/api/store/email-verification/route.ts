import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError, Modules } from "@medusajs/framework/utils"
import { z } from "@medusajs/framework/zod"
import { readVerificationToken } from "../../../lib/email-verification"
import { findIdentityByEmail, markVerified, verificationSecret } from "../../../lib/email-verification-state"

/* The link in the email lands here, from the storefront. No session: the
   token is the proof, and it may be opened on another device than the one the
   account was made on. Confirming twice is harmless. */

const schema = z.object({ token: z.string().min(1) })

const expired = () =>
  new MedusaError(MedusaError.Types.INVALID_DATA, "This link has expired or is not valid. Ask for a new one.")

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const parsed = schema.safeParse(req.body)
  const claims = parsed.success ? readVerificationToken(parsed.data.token, verificationSecret(req.scope)) : null
  if (!claims) throw expired()

  /* The address on the account must still be the one the link was sent to. */
  const customer = await req.scope
    .resolve(Modules.CUSTOMER)
    .retrieveCustomer(claims.customerId)
    .catch(() => null)
  if (!customer || customer.email.toLowerCase() !== claims.email) throw expired()

  const identity = await findIdentityByEmail(req.scope, customer.email)
  if (!identity) throw expired()

  await markVerified(req.scope, identity)
  res.json({ verified: true })
}
