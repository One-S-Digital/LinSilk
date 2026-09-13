import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { removeCustomerAccountWorkflow } from "@medusajs/medusa/core-flows"
import { MedusaError, Modules } from "@medusajs/framework/utils"
import { z } from "@medusajs/framework/zod"

/* Closing an account. A password confirms it, the same defence a bank asks
   for before an irreversible transfer: a valid session already proves who
   is asking, but not that this is a considered decision rather than a
   moment at an unlocked, unattended browser.
   removeCustomerAccountWorkflow is the same workflow the admin's own
   "delete customer" route runs — it drops the customer and detaches the
   auth identity (or just this actor type, if the identity is shared),
   rather than something built by hand against the tables underneath. */

const schema = z.object({
  password: z.string().min(1),
})

export const POST = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "Your password is needed to close the account.")
  }

  const customerModule = req.scope.resolve(Modules.CUSTOMER)
  const customer = await customerModule.retrieveCustomer(req.auth_context.actor_id)

  const auth = req.scope.resolve(Modules.AUTH)
  const check = await auth.authenticate("emailpass", {
    body: { email: customer.email, password: parsed.data.password },
  })
  if (!check.success) {
    throw new MedusaError(MedusaError.Types.UNAUTHORIZED, "That is not the current password.")
  }

  await removeCustomerAccountWorkflow(req.scope).run({
    input: { customerId: customer.id },
  })

  res.json({ success: true })
}
