import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError, Modules } from "@medusajs/framework/utils"
import { z } from "@medusajs/framework/zod"
import { createAttemptLimit } from "../../../../lib/attempt-limit"
import { changePasswordWorkflow } from "../../../../workflows/account/change-password"

/* Change your own password.

   Medusa's admin has no form for it, and its reset-by-email route needs an
   email subscriber the house has not written for staff. This takes the
   current password as proof, so a borrowed signed-in browser cannot lock the
   owner out, and sets the new one on the caller's own emailpass identity —
   the identity is read from the caller's token, never from the body, so
   there is no way to name someone else's.

   Signed-in sessions already issued stay valid until they expire; Medusa
   keeps no session list to end them from here. */

export const MIN_PASSWORD_LENGTH = 12

/* The current password is the thing being guessed here, and a signed-in
   session is not proof of who is at the keyboard, so wrong guesses are
   counted per account and the account is paused after five. */
const attempts = createAttemptLimit()

const schema = z.object({
  current_password: z.string().min(1, "Enter your current password"),
  new_password: z
    .string()
    .min(MIN_PASSWORD_LENGTH, `A new password is at least ${MIN_PASSWORD_LENGTH} characters`)
    .max(128, "A new password is at most 128 characters"),
})

const refuse = (message: string) => new MedusaError(MedusaError.Types.INVALID_DATA, message)

export const POST = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const auth = req.auth_context
  /* A person's own account. An API key has no password to change. */
  if (auth?.actor_type !== "user" || !auth.auth_identity_id) {
    throw new MedusaError(MedusaError.Types.FORBIDDEN, "Only a signed-in person can change a password.")
  }

  const parsed = schema.safeParse(req.body)
  if (!parsed.success) {
    throw refuse(parsed.error.issues[0].message)
  }
  const { current_password, new_password } = parsed.data
  if (new_password === current_password) {
    throw refuse("The new password is the same as the current one.")
  }

  const authModule = req.scope.resolve(Modules.AUTH)
  const identity = await authModule.retrieveAuthIdentity(auth.auth_identity_id, {
    relations: ["provider_identities"],
  })
  const email = identity.provider_identities?.find((p) => p.provider === "emailpass")?.entity_id
  if (!email) {
    throw refuse("This account does not sign in with a password.")
  }

  /* The same workflow the storefront's account page uses: it checks the
     current password and sets the new one. */
  const wait = attempts.waitSeconds(auth.auth_identity_id)
  if (wait > 0) {
    res.status(429).json({
      type: "not_allowed",
      message: `Too many wrong passwords. Try again in ${Math.ceil(wait / 60)} minute(s).`,
    })
    return
  }

  try {
    await changePasswordWorkflow(req.scope).run({
      input: { email, currentPassword: current_password, password: new_password },
    })
  } catch (error) {
    if ((error as { type?: string }).type === MedusaError.Types.UNAUTHORIZED) {
      attempts.fail(auth.auth_identity_id)
    }
    throw error
  }
  attempts.clear(auth.auth_identity_id)

  res.json({ success: true })
}
