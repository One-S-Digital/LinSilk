import { randomBytes } from "crypto"
import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
  transform,
  when,
} from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys, MedusaError, Modules, ProductStatus } from "@medusajs/framework/utils"
import {
  createInventoryLevelsWorkflow,
  createProductsWorkflow,
  deleteProductsWorkflow,
  emitEventStep,
  updateProductVariantsWorkflow,
} from "@medusajs/medusa/core-flows"
import { ATELIER_MODULE } from "../../modules/atelier"
import type AtelierModuleService from "../../modules/atelier/service"
import { commissionQuotedEmail, type CommissionRecord } from "../../lib/commission-emails"
import { COMMISSION_COLLECTION } from "../../lib/commission-catalogue"
import { chfRates } from "../../lib/exchange-rates"
import { CURRENCIES, fromChf } from "../../lib/pricing"

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

/* Putting a price on a commission makes it payable, and what makes it
   payable is a product of its own: one variant, priced at the figure the
   tailor set, with a stock of exactly one. A commission is a capped run of
   one, so it is modelled as one — which is also what lets the bench fulfil
   it like any other order, and what stops a link being paid twice.

   The cart is not built here. A cart belongs to a region, and a region
   decides the currency and the shipping, neither of which is known until the
   client says where the piece is going; that happens on the payment page.

   Re-quoting moves the price on the product and throws away any cart the
   client has not yet paid, so a figure that has moved cannot be settled at
   the old one. */
const prepareQuoteStep = createStep(
  "prepare-quote",
  async ({ id, quote_amount }: { id: string; quote_amount: number }, { container }) => {
    const atelier: AtelierModuleService = container.resolve(ATELIER_MODULE)
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
    const carts = container.resolve(Modules.CART)
    const commission = await atelier.retrieveCommission(id)

    if (commission.paid_at) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "This commission is paid for; re-quoting it would move a figure the client has already settled."
      )
    }

    /* A cart standing against the old figure must not outlive it. */
    if (commission.cart_id) {
      await carts.deleteCarts([commission.cart_id as string]).catch(() => undefined)
    }

    const rates = await chfRates(logger)
    const prices = CURRENCIES.map((currency_code) => ({
      currency_code,
      amount: fromChf(quote_amount, currency_code, rates),
    }))

    const handle = `commission-of-${id.replace(/^com_/, "").toLowerCase()}`
    const { data: [existing] } = await query.graph({
      entity: "product",
      fields: ["id", "variants.id"],
      filters: { handle },
    })

    let createdProductId: string | null = null

    if (existing) {
      await updateProductVariantsWorkflow(container).run({
        input: {
          product_variants: [{ id: existing.variants![0]!.id, prices }],
        },
      })
    } else {
      const { data: [collection] } = await query.graph({
        entity: "product_collection",
        fields: ["id"],
        filters: { handle: COMMISSION_COLLECTION },
      })
      const { data: [shippingProfile] } = await query.graph({
        entity: "shipping_profile",
        fields: ["id"],
      })
      const { data: [store] } = await query.graph({
        entity: "store",
        fields: ["default_sales_channel_id"],
      })
      const { result: created } = await createProductsWorkflow(container).run({
        input: {
          products: [
            {
              title: `Commission — ${commission.silhouette_title.toLowerCase()}, ${commission.name}`,
              subtitle: commission.fabric,
              handle,
              status: ProductStatus.PUBLISHED,
              collection_id: collection?.id,
              shipping_profile_id: shippingProfile?.id,
              origin_country: "vn",
              metadata: {
                commission_id: id,
                length_kinds: commission.length_kinds ?? [],
              },
              sales_channels: store?.default_sales_channel_id
                ? [{ id: store.default_sales_channel_id }]
                : undefined,
              /* Its own option, not the catalogue's: a product option belongs
                 to one product. There are no sizes here either. */
              options: [{ title: "Cut", values: ["Made to measure"] }],
              variants: [
                {
                  title: "Made to measure",
                  sku: `LINSILK-${id.toUpperCase()}`,
                  options: { Cut: "Made to measure" },
                  manage_inventory: true,
                  allow_backorder: false,
                  prices,
                },
              ],
            },
          ],
        },
      })
      createdProductId = created[0].id

      /* A run of one: once it is paid for, the link buys nothing.

         The item is asked for by the sku the variant was just given, rather
         than by reading every inventory item in the house and looking for
         the one that points back — that list grows with every piece and
         every commission ever quoted, and this is the payment path. */
      const { data: [item] } = await query.graph({
        entity: "inventory_item",
        fields: ["id"],
        filters: { sku: `LINSILK-${id.toUpperCase()}` },
      })
      const { data: [location] } = await query.graph({
        entity: "stock_location",
        fields: ["id"],
        filters: { name: "Atelier, Hội An" },
      })
      if (item && location) {
        await createInventoryLevelsWorkflow(container).run({
          input: {
            inventory_levels: [
              { inventory_item_id: item.id, location_id: location.id, stocked_quantity: 1 },
            ],
          },
        })
      }
    }

    /* The link carries a person's measurements, so it has to be unguessable
       rather than merely obscure. It survives a re-quote: the client keeps
       the link they were sent, and sees the new figure through it. */
    const access_token =
      (commission.access_token as string) ?? randomBytes(24).toString("base64url")

    return new StepResponse({ access_token, cart_id: null }, createdProductId)
  },
  async (createdProductId: string | null | undefined, { container }) => {
    if (!createdProductId) return
    await deleteProductsWorkflow(container).run({ input: { ids: [createdProductId] } })
  }
)

const updateCommissionStep = createStep(
  "update-commission",
  async ({
    notify: _notify,
    ...update
  }: UpdateInput & { cart_id?: string | null; access_token?: string }, { container }) => {
    const atelier: AtelierModuleService = container.resolve(ATELIER_MODULE)
    const before = await atelier.retrieveCommission(update.id)

    /* Putting a figure on a brief is what makes it quoted, whoever asked. */
    const priced =
      update.quote_amount !== undefined
        ? { status: update.status ?? "quoted", quoted_at: update.quoted_at ?? new Date() }
        : {}

    const commission = await atelier.updateCommissions({ ...update, ...priced } as never)
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
    /* A figure has to be payable before it is recorded or sent. */
    const payable = when({ input }, (data) => data.input.quote_amount !== undefined).then(() =>
      prepareQuoteStep(
        transform({ input }, (data) => ({
          id: data.input.id,
          quote_amount: data.input.quote_amount!,
        }))
      )
    )

    const commission = updateCommissionStep(
      transform({ input, payable }, (data) => ({
        ...data.input,
        ...(data.payable ?? {}),
      }))
    )

    when({ input }, (data) => data.input.notify).then(() => {
      sendCommissionQuoteStep(commission as unknown as CommissionRecord)
    })

    return new WorkflowResponse(commission)
  }
)
