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
 * A price that carries conditions (a rule such as "free above CHF 500", or a
 * quantity bound) keeps them. What cannot be carried across safely stops the
 * run before anything is changed: a shipping option with no plain franc price
 * to go by, a regional price that has conditions of its own, a variant with
 * no franc base price, a price-list (sale) price with no franc price beside
 * it. Dry run reports them too.
 *
 * Orders already placed keep the currency they were paid in. A cart opened
 * before this ran keeps its old currency too, and is better started again.
 *
 * Safe to run again: a database already in francs reports nothing to do.
 * Without `apply` it changes nothing. */

import { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
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
  min_quantity?: number | string | null
  max_quantity?: number | string | null
  price_rules?: { attribute: string; operator?: string | null; value: string }[] | null
}
type Priced = { id: string; name?: string; prices?: Price[] | null }

const regionOf = (price: Price) =>
  price.price_rules?.find((rule) => rule.attribute === "region_id")?.value

/* The conditions a price carries besides its region: the region is rebuilt by
   the shipping workflow from `region_id`, everything else must be handed back
   or the workflow rebuilds the price without it. */
const conditionsOf = (price: Price) =>
  (price.price_rules ?? []).filter((rule) => rule.attribute !== "region_id")

const carried = (price: Price) => {
  const rules = conditionsOf(price).map(({ attribute, operator, value }) => ({
    attribute,
    operator: operator ?? "eq",
    value,
  }))
  return {
    ...(price.min_quantity != null ? { min_quantity: Number(price.min_quantity) } : {}),
    ...(price.max_quantity != null ? { max_quantity: Number(price.max_quantity) } : {}),
    ...(rules.length ? { rules } : {}),
  }
}

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
  const problems: string[] = []

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
      "prices.min_quantity",
      "prices.max_quantity",
      "prices.price_rules.attribute",
      "prices.price_rules.operator",
      "prices.price_rules.value",
    ],
  })
  const optionUpdates = (options as unknown as Priced[]).flatMap((option) => {
    const prices = (option.prices ?? []).map((p) => ({ ...p, amount: Number(p.amount) }))
    const francs = prices.find(
      (p) => p.currency_code === "chf" && !regionOf(p) && conditionsOf(p).length === 0
    )?.amount
    const stale = prices.some(
      (p) => p.currency_code !== "chf" || foreignIds.has(regionOf(p) ?? "")
    )
    if (!stale) {
      return []
    }
    if (francs === undefined) {
      problems.push(`Shipping option "${option.name}" has no plain franc price to go by.`)
      return []
    }
    const conditionalRegional = prices.some((p) => regionOf(p) && conditionsOf(p).length > 0)
    if (conditionalRegional) {
      problems.push(
        `Shipping option "${option.name}" has a regional price with conditions of its own; its franc figure cannot be worked out here.`
      )
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
            const price = { id, currency_code, amount, ...rest }
            /* A regional price in a region that is moving to francs takes the
               franc figure, its old one being in another currency. One that is
               already in francs, in a region that already is, keeps what it
               has. */
            const converting = currency_code !== "chf" || foreignIds.has(region_id ?? "")
            return region_id
              ? { id, region_id, amount: converting ? francs : amount, ...carried(price) }
              : { id, currency_code, amount, ...carried(price) }
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
    /* Sale prices are left alone, but one with no franc figure beside it would
       stop applying once the region is in francs, so it is not left behind. */
    const listed = new Map<string, Set<string>>()
    for (const p of variant.prices ?? []) {
      if (p.price_list_id) {
        listed.set(p.price_list_id, (listed.get(p.price_list_id) ?? new Set()).add(p.currency_code))
      }
    }
    for (const [list, currencies] of listed) {
      if (currencies.size && !currencies.has("chf")) {
        problems.push(
          `Variant ${variant.id} has a price in price list ${list} but none in francs, so the sale would stop applying.`
        )
      }
    }

    const base = (variant.prices ?? []).filter((p) => !p.price_list_id)
    if (!base.some((p) => p.currency_code !== "chf")) {
      return []
    }
    if (!base.some((p) => p.currency_code === "chf")) {
      problems.push(`Variant ${variant.id} has no franc base price, so it would be left unpriced.`)
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

  if (problems.length) {
    for (const problem of problems) {
      logger.error(problem)
    }
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      `${problems.length} price(s) cannot be moved to francs safely. Nothing was changed.`
    )
  }

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
