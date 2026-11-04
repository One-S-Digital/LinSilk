import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError, Modules } from "@medusajs/framework/utils"
import { createAttemptLimit } from "../../../lib/attempt-limit"
import { CONTACT_EMAIL, contactEmail, contactSchema } from "../../../lib/contact-emails"

/* A message from the contact form to the house. No account is needed. A form
   that anyone can post to is limited: a few messages an hour from one address,
   and a hidden field that only a program fills in is answered as if it had
   worked, so it learns nothing. */

const HOUR = 60 * 60 * 1000
const perAddress = createAttemptLimit({ max: 5, windowMs: HOUR })
const perSender = createAttemptLimit({ max: 3, windowMs: HOUR })
/* Whatever the addresses, the house's inbox is not flooded. */
const everyone = createAttemptLimit({ max: 60, windowMs: HOUR })

const tooMany = () =>
  new MedusaError(MedusaError.Types.NOT_ALLOWED, "Too many messages from here. Please try again later, or write to hello@bylinsilk.com.")

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  /* Every request counts against the address, valid or not, so the form
     cannot be used to probe or to fill the log. */
  const address = req.ip ?? "unknown"
  if (perAddress.waitSeconds(address) > 0 || everyone.waitSeconds("all") > 0) throw tooMany()
  perAddress.fail(address)

  const parsed = contactSchema.safeParse(req.body)
  if (!parsed.success) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "Please give your name, a valid email address and a message.")
  }
  if (parsed.data.website) return res.json({ sent: true })

  const sender = parsed.data.email.toLowerCase()
  if (perSender.waitSeconds(sender) > 0) throw tooMany()
  perSender.fail(sender)
  everyone.fail("all")

  await req.scope
    .resolve(Modules.NOTIFICATION)
    .createNotifications(contactEmail(parsed.data, process.env.CONTACT_EMAIL ?? CONTACT_EMAIL))
  res.json({ sent: true })
}
