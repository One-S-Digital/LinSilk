import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { MedusaError, Modules } from "@medusajs/framework/utils"
import { emitEventStep } from "@medusajs/medusa/core-flows"

/* The atelier has read a client's measurement sheet and confirmed it. Nothing
   is cut until this is done, so it is recorded on the order (`sheet_confirmed_at`)
   as well as told to the client.

   Running it again for an order already confirmed keeps the first date and
   emits the event once more. That is deliberate: the mail is sent once per
   order whatever happens (see order-sheet-confirmed.ts), but if the first
   attempt failed, this is how it is tried again. */

type Input = { id: string }

/** What puts the order back as it was, and whether this run changed it at all. */
type Undo = { id: string; metadata: Record<string, unknown>; changed: boolean }

const stampSheetStep = createStep(
  "stamp-sheet",
  async ({ id }: Input, { container }) => {
    const orders = container.resolve(Modules.ORDER)
    const order = await orders.retrieveOrder(id, { select: ["id", "status", "metadata"] })

    if (order.status === "canceled") {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "This order has been cancelled, so there is no sheet to confirm."
      )
    }

    const metadata = (order.metadata ?? {}) as Record<string, unknown>
    if (metadata.sheet_confirmed_at) {
      return new StepResponse(
        { confirmed_at: String(metadata.sheet_confirmed_at) },
        { id, metadata, changed: false }
      )
    }

    const confirmed_at = new Date().toISOString()
    await orders.updateOrders(id, { metadata: { ...metadata, sheet_confirmed_at: confirmed_at } })
    return new StepResponse({ confirmed_at }, { id, metadata, changed: true })
  },
  async (before: Undo | undefined, { container }) => {
    if (!before?.changed) return
    await container.resolve(Modules.ORDER).updateOrders(before.id, { metadata: before.metadata })
  }
)

export const confirmOrderSheetWorkflow = createWorkflow(
  "confirm-order-sheet",
  (input: Input) => {
    const stamped = stampSheetStep(input)
    emitEventStep({ eventName: "order.sheet_confirmed", data: { id: input.id } })
    return new WorkflowResponse(stamped)
  }
)
