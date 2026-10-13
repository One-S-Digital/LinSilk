/* Brings an existing database to the house's single currency: francs.
 *
 *   pnpm --filter medusa exec medusa exec ./src/scripts/chf-only.ts          # says what it would do
 *   pnpm --filter medusa exec medusa exec ./src/scripts/chf-only.ts apply    # does it
 *
 * The seed now makes every region priced in francs. A database seeded before
 * that still has a euro region and a sterling one, with euro and sterling
 * prices on every piece and on the shipping options. This moves it across:
 *
 *   1. Regions priced in anything else are repriced in francs. The countries
 *      and the shipping zones are untouched, so the same addresses are served.
 *   2. A shipping option's regional price was written in that region's old
 *      currency, so it is set back to its franc figure. It is read from the
 *      option's own franc price, which the old seed always wrote beside it.
 *   3. Euro and sterling prices are taken off every variant and shipping
 *      option. Sale prices (price lists) are not touched.
 *   4. The store supports francs and nothing else.
 *
 * Orders already placed keep the currency they were paid in. A cart opened
 * before this ran keeps its old currency too, and is better started again.
 *
 * Safe to run again: a database already in francs reports nothing to do.
 * Without `apply` it changes nothing. */

import { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import {
  updateProductVariantsWorkflow,
  updateRegionsWorkflow,
  updateShippingOptionsWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows"

type Price = {
  id: string
  currency_code: string
  amount: number
  price_list_id?: string | null
  price_rules?: { attribute: string; value: string }[] | null
}
type Priced = { id: string; name?: string; prices?: Price[] | null }

const regionOf = (price: Price) =>
  price.price_rules?.find((rule) => rule.attribute === "region_id")?.value

export default async function chfOnly({
  container,
  args,
}: {
  container: MedusaContainer
  args?: string[]
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const apply = args?.includes("apply") ?? false
  const say = (message: string) => logger.info(`${apply ? "" : "[dry run] "}${message}`)

  /* ---- 1. Regions ---- */
  const { data: regions } = await query.graph({
    entity: "region",
    fields: ["id", "name", "currency_code"],
  })
  const foreign = regions.filter((r) => r.currency_code !== "chf")
  const foreignIds = new Set(foreign.map((r) => r.id))

  /* ---- 2 and 3. Shipping options ---- */
  const { data: options } = await query.graph({
    entity: "shipping_option",
    fields: [
      "id",
      "name",
      "prices.id",
      "prices.currency_code",
      "prices.amount",
      "prices.price_rules.attribute",
      "prices.price_rules.value",
    ],
  })
  const optionUpdates = (options as unknown as Priced[]).flatMap((option) => {
    const prices = (option.prices ?? []).map((p) => ({ ...p, amount: Number(p.amount) }))
    const francs = prices.find((p) => p.currency_code === "chf" && !regionOf(p))?.amount
    const stale = prices.some(
      (p) => p.currency_code !== "chf" || foreignIds.has(regionOf(p) ?? "")
    )
    if (!stale) {
      return []
    }
    if (francs === undefined) {
      logger.warn(`Shipping option "${option.name}" has no franc price to go by; left as it is.`)
      return []
    }
    say(`Shipping "${option.name}": CHF ${francs}, other currencies dropped.`)
    return [
      {
        id: option.id,
        prices: prices
          .filter((p) => p.currency_code === "chf" || regionOf(p))
          .map(({ id, currency_code, amount, ...rest }) => {
            const region_id = regionOf({ id, currency_code, amount, ...rest })
            /* A regional price follows its region's currency, which is francs
               from here on, so it takes the franc figure. */
            return region_id
              ? { id, region_id, amount: francs }
              : { id, currency_code, amount }
          }),
      },
    ]
  })

  /* ---- 3. Variants ---- */
  const { data: variants } = await query.graph({
    entity: "variant",
    fields: ["id", "prices.id", "prices.currency_code", "prices.amount", "prices.price_list_id"],
  })
  const variantUpdates = (variants as unknown as Priced[]).flatMap((variant) => {
    const base = (variant.prices ?? []).filter((p) => !p.price_list_id)
    if (!base.some((p) => p.currency_code !== "chf")) {
      return []
    }
    return [
      {
        id: variant.id,
        prices: base
          .filter((p) => p.currency_code === "chf")
          .map(({ id, currency_code, amount }) => ({ id, currency_code, amount: Number(amount) })),
      },
    ]
  })

  say(
    `${foreign.length} region(s) to reprice in francs` +
      (foreign.length ? ` (${foreign.map((r) => `${r.name}: ${r.currency_code}`).join(", ")})` : "") +
      `, ${optionUpdates.length} shipping option(s), ${variantUpdates.length} variant(s).`
  )

  if (!apply) {
    say("Nothing changed. Run again with `apply` to do it.")
    return
  }

  /* Shipping first, while the regions still say what the old figures meant;
     the order matters only for the read above, but keeps the account honest. */
  if (foreign.length) {
    await updateRegionsWorkflow(container).run({
      input: { selector: { id: foreign.map((r) => r.id) }, update: { currency_code: "chf" } },
    })
  }
  if (optionUpdates.length) {
    await updateShippingOptionsWorkflow(container).run({ input: optionUpdates })
  }
  if (variantUpdates.length) {
    await updateProductVariantsWorkflow(container).run({
      input: { product_variants: variantUpdates },
    })
  }

  const { data: [store] } = await query.graph({ entity: "store", fields: ["id"] })
  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        supported_currencies: [{ currency_code: "chf", is_default: true, is_tax_inclusive: true }],
      },
    },
  })

  logger.info("The house prices in francs alone.")
}
