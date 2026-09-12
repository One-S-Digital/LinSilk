import { createStep, createWorkflow, StepResponse, WorkflowResponse, when } from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"
import { emitEventStep } from "@medusajs/medusa/core-flows"
import { ATELIER_MODULE } from "../../modules/atelier"
import type AtelierModuleService from "../../modules/atelier/service"
import { commissionQuotedEmail, type CommissionRecord } from "../../lib/commission-emails"

/* Writing a commission down, and later putting a price on it. Both are
   workflows rather than a service call in a route, so a half-finished
   request rolls back rather than leaving a brief nobody will read. */

type CreateInput = Record<string, unknown>

const createCommissionStep = createStep(
  "create-commission",
  async (input: CreateInput, { container }) => {
    const atelier: AtelierModuleService = container.resolve(ATELIER_MODULE)
    const commission = await atelier.createCommissions(input as never)
    return new StepResponse(commission, commission.id)
  },
  async (id: string | undefined, { container }) => {
    if (!id) return
    const atelier: AtelierModuleService = container.resolve(ATELIER_MODULE)
    await atelier.deleteCommissions(id)
  }
)

export const createCommissionWorkflow = createWorkflow(
  "create-commission",
  (input: CreateInput) => {
    const commission = createCommissionStep(input)
    emitEventStep({ eventName: "commission.submitted", data: { id: commission.id } })
    return new WorkflowResponse(commission)
  }
)

type UpdateInput = {
  id: string
  status?: string
  quote_amount?: number
  internal_note?: string | null
  quoted_at?: Date
  /** Whether the client is told the figure now. */
  notify: boolean
}

const updateCommissionStep = createStep(
  "update-commission",
  async ({ notify: _notify, ...update }: UpdateInput, { container }) => {
    const atelier: AtelierModuleService = container.resolve(ATELIER_MODULE)
    const before = await atelier.retrieveCommission(update.id)
    const commission = await atelier.updateCommissions(update as never)
    return new StepResponse(commission, before)
  },
  async (before: Record<string, unknown> | undefined, { container }) => {
    if (!before) return
    const atelier: AtelierModuleService = container.resolve(ATELIER_MODULE)
    await atelier.updateCommissions(before as never)
  }
)

/* Telling the client is deliberately its own step: an email cannot be
   unsent, so it runs last, once the figure is safely recorded. */
const sendCommissionQuoteStep = createStep(
  "send-commission-quote",
  async (commission: CommissionRecord, { container }) => {
    const notification = container.resolve(Modules.NOTIFICATION)
    await notification.createNotifications(commissionQuotedEmail(commission))
    return new StepResponse(void 0)
  }
)

export const updateCommissionWorkflow = createWorkflow(
  "update-commission",
  (input: UpdateInput) => {
    const commission = updateCommissionStep(input)

    when({ input }, (data) => data.input.notify).then(() => {
      sendCommissionQuoteStep(commission as unknown as CommissionRecord)
    })

    return new WorkflowResponse(commission)
  }
)
