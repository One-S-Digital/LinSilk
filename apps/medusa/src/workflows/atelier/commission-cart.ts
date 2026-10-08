import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys, MedusaError, Modules } from "@medusajs/framework/utils"
import { createCartWorkflow } from "@medusajs/medusa/core-flows"
import { PAYABLE_STATUSES } from "../../lib/archive"
import { ATELIER_MODULE } from "../../modules/atelier"
import type AtelierModuleService from "../../modules/atelier/service"

/* Opening the cart behind a quote.
 *
 * A quote is written in Swiss francs before anyone knows where the piece is
 * going, so the cart is built only once the client says: in the region that
 * country belongs to, with the figure re-derived from the franc at the day's
 * rate — the same arithmetic the seasonal prices use — and the measurement
 * sheet on the line, where the bench will read it.
 *
 * Asking again with a different country replaces the cart rather than moving
 * it: Medusa rebuilds a cart's lines when its region changes, and a line with
 * no variant behind it does not survive that.
 */

type OpenInput = { token: string; country_code: string }

const openCommissionCartStep = createStep(
  "open-commission-cart",
  async ({ token, country_code }: OpenInput, { container }) => {
    const atelier: AtelierModuleService = container.resolve(ATELIER_MODULE)
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const carts = container.resolve(Modules.CART)
    const country = country_code.toLowerCase()

    const [commission] = await atelier.listCommissions({ access_token: token })
    if (!commission) {
      throw new MedusaError(MedusaError.Types.NOT_FOUND, "No commission answers to that link.")
    }
    if (commission.paid_at) {
      throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "This commission is already paid for.")
    }
    if (!commission.quote_amount) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "This commission has no price yet; a tailor is still reading it."
      )
    }
    if (!PAYABLE_STATUSES.includes(commission.status)) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        `This commission is ${commission.status}; it is not one a payment can be opened on.`
      )
    }

    const { data: regions } = await query.graph({
      entity: "region",
      fields: ["id", "currency_code", "countries.iso_2"],
    })
    const region = regions.find((r) =>
      (r.countries ?? []).some((c) => c?.iso_2?.toLowerCase() === country)
    )
    if (!region) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "The house does not ship there yet. Write to hello@bylinsilk.com and we will arrange it."
      )
    }

    /* Already standing in the right region: keep the cart, and whatever the
       client has already filled in on it. */
    if (commission.cart_id) {
      const { data: [existing] } = await query.graph({
        entity: "cart",
        fields: ["id", "region_id", "completed_at"],
        filters: { id: commission.cart_id as string },
      })
      if (existing && !existing.completed_at) {
        if (existing.region_id === region.id) {
          return new StepResponse(
            { cart_id: existing.id, currency_code: region.currency_code },
            null
          )
        }
        await carts.deleteCarts([existing.id]).catch(() => undefined)
      }
    }

    /* The commission's own product carries the figure, in every currency the
       house sells in, so the cart takes the price rather than being told it. */
    const { data: [product] } = await query.graph({
      entity: "product",
      fields: ["variants.id"],
      filters: { handle: `commission-of-${commission.id.replace(/^com_/, "").toLowerCase()}` },
    })
    const variantId = product?.variants?.[0]?.id
    if (!variantId) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        "This commission has a price but nothing to buy; the house has been told."
      )
    }

    const measurements = (commission.measurements ?? {}) as Record<string, unknown>

    const { result: cart } = await createCartWorkflow(container).run({
      input: {
        region_id: region.id,
        email: commission.email,
        metadata: { commission_id: commission.id },
        items: [
          {
            /* The price, the shipping profile and the run of one all come
               from the commission's own variant. */
            variant_id: variantId,
            quantity: 1,
            metadata: {
              commission_id: commission.id,
              measurement_unit: commission.measurement_unit ?? "cm",
              ...Object.fromEntries(
                Object.entries(measurements).map(([key, value]) => [
                  `measure_${key}_cm`,
                  String(value),
                ])
              ),
            },
          },
        ],
      },
    })

    await atelier.updateCommissions({ id: commission.id, cart_id: cart.id } as never)

    return new StepResponse(
      { cart_id: cart.id, currency_code: region.currency_code },
      { created_cart_id: cart.id, commission_id: commission.id, previous_cart_id: commission.cart_id ?? null }
    )
  },
  async (undo: { created_cart_id: string; commission_id: string; previous_cart_id: string | null } | null | undefined, { container }) => {
    if (!undo) return
    const atelier: AtelierModuleService = container.resolve(ATELIER_MODULE)
    const carts = container.resolve(Modules.CART)
    await atelier.updateCommissions({
      id: undo.commission_id,
      cart_id: undo.previous_cart_id,
    } as never)
    await carts.deleteCarts([undo.created_cart_id]).catch(() => undefined)
  }
)

export const openCommissionCartWorkflow = createWorkflow(
  "open-commission-cart",
  (input: OpenInput) => new WorkflowResponse(openCommissionCartStep(input))
)
