import { createStep, createWorkflow, StepResponse, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { MedusaError, Modules } from "@medusajs/framework/utils"

/* The current password is checked and the new one set in a single step: there
   is nothing here worth rolling back separately, and nothing after it in the
   workflow to fail if this succeeds. */

type Input = { email: string; currentPassword: string; password: string }

const changePasswordStep = createStep(
  "change-password",
  async ({ email, currentPassword, password }: Input, { container }) => {
    const auth = container.resolve(Modules.AUTH)

    const check = await auth.authenticate("emailpass", {
      body: { email, password: currentPassword },
    })
    if (!check.success) {
      throw new MedusaError(MedusaError.Types.UNAUTHORIZED, "That is not the current password.")
    }

    const { success, error } = await auth.updateProvider("emailpass", {
      entity_id: email,
      password,
    })
    if (!success) {
      throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, error || "Could not change the password.")
    }

    return new StepResponse(success)
  }
)

export const changePasswordWorkflow = createWorkflow("change-password", (input: Input) => {
  const result = changePasswordStep(input)
  return new WorkflowResponse(result)
})
