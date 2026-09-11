import { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import {
  updateProductVariantsWorkflow,
  updateShippingOptionsWorkflow,
} from "@medusajs/medusa/core-flows"
import { fetchChfRates, type DatedRates } from "../lib/exchange-rates"
import { rederive, type Price } from "../lib/pricing"

/* Keeps every euro and sterling price derived from its franc price at the
   latest ECB rate. Runs hourly: the ECB publishes once a working day, and
   the hourly pass also picks up franc prices edited in the admin.

   Sale prices (price lists) are never touched. If the rates cannot be
   fetched, nothing is changed and the prices stay at the last good rate. */
export default async function refreshExchangeRates(container: MedusaContainer) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  let rates: DatedRates
  try {
    rates = await fetchChfRates()
  } catch (error) {
    logger.warn(`Exchange rates unavailable, prices left as they are: ${(error as Error).message}`)
    return
  }

  /* `prices` is a link field: query resolves it, but the generated entity
     types do not declare it. */
  type Priced = {
    id: string
    prices?:
      | (Price & {
          price_list_id?: string | null
          price_rules?: { attribute: string; value: string }[] | null
        })[]
      | null
  }

  const basePrices = ({ prices }: Priced) =>
    (prices ?? [])
      .filter((p) => !p.price_list_id)
      .map(({ id, currency_code, amount }) => ({ id, currency_code, amount: Number(amount) }))

  const { data: variants } = await query.graph({
    entity: "variant",
    fields: ["id", "prices.id", "prices.currency_code", "prices.amount", "prices.price_list_id"],
  })
  const variantUpdates = (variants as unknown as Priced[]).flatMap((v) => {
    const prices = rederive(basePrices(v), rates, ["eur", "gbp"])
    return prices ? [{ id: v.id, prices }] : []
  })
  if (variantUpdates.length) {
    await updateProductVariantsWorkflow(container).run({
      input: { product_variants: variantUpdates },
    })
  }

  /* Shipping carries its franc price beside the regional one, so the rest of
     world rate follows the franc too.

     Every price must be sent with its currency, or with its region if it is
     bound to one: Medusa de-duplicates incoming prices by currency and rules,
     so bare `{ id, amount }` entries collapse into one and the rest are
     deleted. Sending `region_id` also keeps the price's region rule. */
  const { data: options } = await query.graph({
    entity: "shipping_option",
    fields: [
      "id",
      "prices.id",
      "prices.currency_code",
      "prices.amount",
      "prices.price_rules.attribute",
      "prices.price_rules.value",
    ],
  })
  const optionUpdates = (options as unknown as Priced[]).flatMap((o) => {
    const prices = rederive(basePrices(o), rates)
    if (!prices) {
      return []
    }
    const regionOf = (priceId?: string) =>
      o.prices
        ?.find((p) => p.id === priceId)
        ?.price_rules?.find((r) => r.attribute === "region_id")?.value
    return [
      {
        id: o.id,
        prices: prices.map(({ id, currency_code, amount }) => {
          const region_id = regionOf(id)
          return region_id ? { id, region_id, amount } : { id, currency_code, amount }
        }),
      },
    ]
  })
  if (optionUpdates.length) {
    await updateShippingOptionsWorkflow(container).run({ input: optionUpdates })
  }

  logger.info(
    `ECB rates of ${rates.date}: CHF 1 = EUR ${rates.eur.toFixed(4)} = GBP ${rates.gbp.toFixed(4)}. ` +
      `Re-priced ${variantUpdates.length} pieces and ${optionUpdates.length} shipping options.`
  )
}

export const config = {
  name: "refresh-exchange-rates",
  schedule: "0 * * * *",
}
