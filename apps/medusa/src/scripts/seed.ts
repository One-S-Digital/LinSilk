/* Seeds the house: store, regions, shipping, collections and pieces.
 *
 *   pnpm --filter medusa exec medusa exec ./src/scripts/seed.ts
 *
 * The catalogue is read straight from the storefront's lib/catalog.ts, which
 * is the source of truth for the domain. Every piece is one product with one
 * variant — nothing in this house is sold in sizes — and the measurement
 * sheet travels on the line item, not the variant.
 *
 * Collections I-III are placeholder content. Seed them for a working archive,
 * but do not let them reach production without the client's real archive.
 *
 * Refuses to run twice: it checks for the Switzerland region first.
 */

import { MedusaContainer } from "@medusajs/framework"
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils"
import {
  createCollectionsWorkflow,
  createDefaultsWorkflow,
  createInventoryLevelsWorkflow,
  createProductOptionsWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createShippingOptionsWorkflow,
  createStockLocationsWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows"
import { COLLECTIONS, PIECES } from "../../../storefront/lib/catalog"
import { fetchChfRates } from "../lib/exchange-rates"
import { CURRENCIES, fromChf, type Currency } from "../lib/pricing"

/* Per-piece size of the season's capped run. Placeholder until the client
   gives the real figure for each design. */
const RUN_CAP = 10

/* One region per currency. Prices are tax-inclusive everywhere: the figure on
   the page is the figure paid. Tax rates are not set here — the duty and VAT
   position needs the client's accountant (docs/HANDOVER.md §8). */
const REGIONS: {
  name: string
  currency: Currency
  countries: string[]
  shipping: { name: string; note: string; chf: number }
}[] = [
  {
    name: "Switzerland",
    currency: "chf",
    countries: ["ch"],
    shipping: { name: "Switzerland", note: "Two to three days, duty included.", chf: 0 },
  },
  {
    name: "Europe",
    currency: "eur",
    countries: ["at", "be", "de", "dk", "es", "fr", "ie", "it", "lu", "nl", "pt", "se"],
    shipping: { name: "European Union", note: "Three to six days, duty included.", chf: 0 },
  },
  {
    name: "International",
    currency: "gbp",
    countries: ["gb", "us", "sg", "jp", "au"],
    shipping: {
      name: "Rest of world",
      note: "Five to ten days. Duties and import tax are payable on arrival.",
      chf: 60,
    },
  },
]

export default async function seed({ container }: { container: MedusaContainer }) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const fulfillment = container.resolve(Modules.FULFILLMENT)

  const { data: existing } = await query.graph({
    entity: "region",
    fields: ["id"],
    filters: { name: "Switzerland" },
  })
  if (existing.length) {
    logger.info("Already seeded (Switzerland region exists). Nothing to do.")
    return
  }

  /* Fetched before anything is written: a seed that cannot price in euro and
     sterling should fail here, not halfway through. After this, the
     refresh-exchange-rates job keeps the derived prices current. */
  const rates = await fetchChfRates()
  logger.info(`Pricing at ECB rates of ${rates.date}.`)

  /* ---- Store, sales channel, publishable key ----
     Medusa creates a default store, sales channel and publishable key on
     first boot, and the shipping profile on migrate. Make sure they exist —
     a fresh database may never have booted — and use them rather than making
     duplicates. */

  await createDefaultsWorkflow(container).run()

  const { data: [store] } = await query.graph({
    entity: "store",
    fields: ["id", "default_sales_channel_id"],
  })
  const { data: [apiKey] } = await query.graph({
    entity: "api_key",
    fields: ["id", "sales_channels.id"],
    filters: { type: "publishable" },
  })
  const { data: [shippingProfile] } = await query.graph({
    entity: "shipping_profile",
    fields: ["id"],
  })
  const salesChannelId = store.default_sales_channel_id!

  if (!apiKey.sales_channels?.some((sc) => sc?.id === salesChannelId)) {
    await linkSalesChannelsToApiKeyWorkflow(container).run({
      input: { id: apiKey.id, add: [salesChannelId] },
    })
  }

  /* ---- Regions ---- */

  logger.info("Seeding regions...")
  const { result: regions } = await createRegionsWorkflow(container).run({
    input: {
      regions: REGIONS.map((r) => ({
        name: r.name,
        currency_code: r.currency,
        countries: r.countries,
        payment_providers: ["pp_system_default"],
        is_tax_inclusive: true,
      })),
    },
  })
  const regionId = (name: string) => regions.find((r) => r.name === name)!.id

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        name: "Maison Ayla",
        /* Variant prices are keyed by currency, so it is the currency's
           preference — not the region's — that decides tax inclusivity. */
        supported_currencies: CURRENCIES.map((currency_code) => ({
          currency_code,
          is_default: currency_code === "chf",
          is_tax_inclusive: true,
        })),
        default_region_id: regionId("Switzerland"),
      },
    },
  })

  await createTaxRegionsWorkflow(container).run({
    input: REGIONS.flatMap((r) =>
      r.countries.map((country_code) => ({ country_code, provider_id: "tp_system" }))
    ),
  })

  /* ---- Where it is made, and how it travels ----
     Everything is cut in Hội An and ships from there; the courier clears
     customs out of Việt Nam. */

  logger.info("Seeding stock location and shipping...")
  const { result: [atelier] } = await createStockLocationsWorkflow(container).run({
    input: {
      locations: [
        {
          name: "Atelier, Hội An",
          address: { city: "Hội An", country_code: "VN", address_1: "" },
        },
      ],
    },
  })

  await link.create({
    [Modules.STOCK_LOCATION]: { stock_location_id: atelier.id },
    [Modules.FULFILLMENT]: { fulfillment_provider_id: "manual_manual" },
  })

  const fulfillmentSet = await fulfillment.createFulfillmentSets({
    name: "Atelier, Hội An — shipping",
    type: "shipping",
    service_zones: REGIONS.map((r) => ({
      name: r.name,
      geo_zones: r.countries.map((country_code) => ({ type: "country" as const, country_code })),
    })),
  })

  await link.create({
    [Modules.STOCK_LOCATION]: { stock_location_id: atelier.id },
    [Modules.FULFILLMENT]: { fulfillment_set_id: fulfillmentSet.id },
  })

  await createShippingOptionsWorkflow(container).run({
    input: REGIONS.map((r) => ({
      name: r.shipping.name,
      price_type: "flat" as const,
      provider_id: "manual_manual",
      service_zone_id: fulfillmentSet.service_zones.find((z) => z.name === r.name)!.id,
      shipping_profile_id: shippingProfile.id,
      type: { label: r.shipping.name, description: r.shipping.note, code: r.currency },
      /* The franc price sits beside the regional one as the source the
         exchange-rate job derives it from. */
      prices: [
        { region_id: regionId(r.name), amount: fromChf(r.shipping.chf, r.currency, rates) },
        ...(r.currency === "chf" ? [] : [{ currency_code: "chf", amount: r.shipping.chf }]),
      ],
      rules: [
        { attribute: "enabled_in_store", value: "true", operator: "eq" as const },
        { attribute: "is_return", value: "false", operator: "eq" as const },
      ],
    })),
  })

  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: { id: atelier.id, add: [salesChannelId] },
  })

  /* ---- Collections ----
     `metadata.status` is the gate: `current` is orderable, `past` never is
     again. The cart rejects a piece from a past collection. */

  logger.info("Seeding collections...")
  const { result: collections } = await createCollectionsWorkflow(container).run({
    input: {
      collections: COLLECTIONS.map((c) => ({
        title: c.title,
        handle: c.slug,
        metadata: {
          status: c.status,
          season: c.season,
          number: c.number,
          note: c.note,
          ...(c.closes ? { closes: c.closes } : {}),
        },
      })),
    },
  })
  const collectionId = (slug: string) => collections.find((c) => c.handle === slug)!.id

  /* ---- Pieces ----
     Medusa requires every product to carry an option. There are no sizes, so
     every piece shares the one option the house actually offers. */

  const { result: [cut] } = await createProductOptionsWorkflow(container).run({
    input: { product_options: [{ title: "Cut", values: ["Made to measure"] }] },
  })

  logger.info(`Seeding ${PIECES.length} pieces...`)
  await createProductsWorkflow(container).run({
    input: {
      products: PIECES.map((p) => ({
        title: p.name,
        subtitle: p.material,
        handle: p.id,
        status: ProductStatus.PUBLISHED,
        collection_id: collectionId(p.collection),
        shipping_profile_id: shippingProfile.id,
        origin_country: "vn",
        metadata: {
          group: p.group,
          shot: p.shot,
          ...(p.sleep ? { sleep: true } : {}),
          ...(p.lengthKind ? { length_kind: p.lengthKind } : {}),
        },
        sales_channels: [{ id: salesChannelId }],
        options: [{ id: cut.id }],
        variants: [
          {
            title: "Made to measure",
            sku: `AYLA-${p.id.toUpperCase()}`,
            options: { Cut: "Made to measure" },
            manage_inventory: true,
            allow_backorder: false,
            prices: CURRENCIES.map((currency_code) => ({
              currency_code,
              amount: fromChf(p.price, currency_code, rates),
            })),
          },
        ],
      })),
    },
  })

  /* ---- The capped run ----
     Nothing is restocked, so stock is the season's cap and nothing more. */

  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id"],
  })
  await createInventoryLevelsWorkflow(container).run({
    input: {
      inventory_levels: inventoryItems.map((item) => ({
        location_id: atelier.id,
        inventory_item_id: item.id,
        stocked_quantity: RUN_CAP,
      })),
    },
  })

  logger.info(
    `Seeded ${regions.length} regions, ${collections.length} collections, ${PIECES.length} pieces.`
  )
}
