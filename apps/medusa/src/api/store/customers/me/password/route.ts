import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError, Modules } from "@medusajs/framework/utils"
import { z } from "@medusajs/framework/zod"
import { changePasswordWorkflow } from "../../../../../workflows/account/change-password"

/* Changing a password while signed in, as opposed to the emailed reset link:
   the emailpass auth route only accepts a reset-purpose token, not an
   ordinary session, so this is a thin route of our own in front of the same
   provider methods that route calls. /store/customers/me* already requires a
   session — see the middlewares Medusa core registers for that matcher. */

const schema = z.object({
  current_password: z.string().min(1),
  password: z.string().min(8),
})

export const POST = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(" ")
    )
  }

  const customerModule = req.scope.resolve(Modules.CUSTOMER)
  const customer = await customerModule.retrieveCustomer(req.auth_context.actor_id)

  await changePasswordWorkflow(req.scope).run({
    input: {
      email: customer.email,
      currentPassword: parsed.data.current_password,
      password: parsed.data.password,
    },
  })

  res.json({ success: true })
}
