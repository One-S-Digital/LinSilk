/* Provisions the house: store, regions, shipping, and the commission
 * silhouettes.
 *
 *   pnpm --filter medusa exec medusa exec ./src/scripts/seed.ts
 *
 * Safe to run again. Anything missing is created; a piece that already exists
 * has its wording, collection and metadata brought back in line with the
 * catalogue. Prices are written once, at creation — after that the house owns
 * them in the admin, and the refresh-exchange-rates job keeps the euro and
 * sterling figures derived from the franc.
 *
 * No season and no piece is seeded. The house's own catalogue arrives through
 * the admin or the ingestion route (docs/CATALOGUE-INGESTION.md) and lives in
 * Medusa from then on; seeding it from a file here would mean inventing it,
 * and invented pieces have a way of reaching production.
 *
 * What is seeded is the structure a piece needs to exist at all — the store,
 * the regions and their prices, the atelier's stock location and shipping, the
 * single `Cut` option, and the two collections that hold commissions rather
 * than a season — plus the commission silhouettes, which are opening figures
 * the house edits in the admin rather than content.
 *
 * Every piece is one product with one variant — nothing in this house is sold
 * in sizes — and the measurement sheet travels on the line item, not the
 * variant.
 */

import { MedusaContainer } from "@medusajs/framework"
import {
  ContainerRegistrationKeys,
  MedusaError,
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
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateCollectionsWorkflow,
  updateProductsWorkflow,
  updateRegionsWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows"
import { SILHOUETTES } from "./catalogue-fixture"
import { fetchChfRates } from "../lib/exchange-rates"
import { COMMISSION_COLLECTION, SILHOUETTE_COLLECTION } from "../lib/commission-catalogue"
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

  /* Fetched before anything is written: a run that cannot price in euro and
     sterling should fail here, not halfway through. */
  const rates = await fetchChfRates()
  logger.info(`Pricing at ECB rates of ${rates.date}.`)

  /* ---- Store, sales channel, publishable key, shipping profile ----
     Medusa creates a default store, sales channel and publishable key on
     first boot. Make sure they exist — a fresh database may never have
     booted — and use them rather than making duplicates.

     The shipping profile is not one of them: nothing in Medusa creates it,
     so a migrated database has none and every shipping option and product
     below would have nothing to hang from. It is made here when it is
     missing. */

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

  const { data: [existingProfile] } = await query.graph({
    entity: "shipping_profile",
    fields: ["id"],
  })
  const shippingProfile =
    existingProfile ??
    (
      await createShippingProfilesWorkflow(container).run({
        input: { data: [{ name: "Default", type: "default" }] },
      })
    ).result[0]
  if (!existingProfile) {
    logger.info("Creating the default shipping profile...")
  }

  const salesChannelId = store.default_sales_channel_id!

  if (!apiKey.sales_channels?.some((sc) => sc?.id === salesChannelId)) {
    await linkSalesChannelsToApiKeyWorkflow(container).run({
      input: { id: apiKey.id, add: [salesChannelId] },
    })
  }

  /* ---- Regions ---- */

  const { data: existingRegions } = await query.graph({ entity: "region", fields: ["id", "name"] })
  const missingRegions = REGIONS.filter(
    (r) => !existingRegions.some((existing) => existing.name === r.name)
  )
  if (missingRegions.length) {
    logger.info(`Creating ${missingRegions.length} region(s)...`)
    await createRegionsWorkflow(container).run({
      input: {
        regions: missingRegions.map((r) => ({
          name: r.name,
          currency_code: r.currency,
          countries: r.countries,
          payment_providers: ["pp_system_default"],
          is_tax_inclusive: true,
        })),
      },
    })
    await createTaxRegionsWorkflow(container).run({
      input: missingRegions.flatMap((r) =>
        r.countries.map((country_code) => ({ country_code, provider_id: "tp_system" }))
      ),
    })
  }

  const { data: regions } = await query.graph({ entity: "region", fields: ["id", "name"] })
  const regionId = (name: string) => regions.find((r) => r.name === name)!.id

  /* Every region offers whatever payment providers are configured: the system
     provider on its own until STRIPE_API_KEY is set, Stripe as well once it
     is. Re-running this is how a region picks Stripe up. */
  const { data: providers } = await query.graph({
    entity: "payment_provider",
    fields: ["id", "is_enabled"],
  })
  /* The system provider authorises without charging, which is how checkout
     is worked on before Stripe has keys. The moment a real provider exists it
     takes over alone: a region that still offered the system one would let
     anybody take a garment for nothing. */
  const available = providers.filter((p) => p.is_enabled !== false).map((p) => p.id)
  const real = available.filter((id) => !id.includes("system"))
  const enabled = real.length ? real : available
  if (enabled.length) {
    await updateRegionsWorkflow(container).run({
      input: {
        selector: { id: regions.map((r) => r.id) },
        update: { payment_providers: enabled },
      },
    })
    logger.info(`Payment providers on every region: ${enabled.join(", ")}.`)
  }

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        name: "LinSilk",
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

  /* ---- Where it is made, and how it travels ----
     Everything is cut in Hội An and ships from there; the courier clears
     customs out of Việt Nam. */

  /* Each of these is asked for separately rather than behind one "have we
     ever run?" flag. A seed that fails halfway — and the first one on a fresh
     database used to — would otherwise be skipped wholesale on the next run
     and report success over a house with no way to ship anything. */

  const { data: [existingLocation] } = await query.graph({
    entity: "stock_location",
    fields: ["id"],
    filters: { name: "Atelier, Hội An" },
  })
  let atelierId = existingLocation?.id

  if (!atelierId) {
    logger.info("Creating the atelier's stock location...")
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
    atelierId = atelier.id
  }

  const FULFILLMENT_SET = "Atelier, Hội An — shipping"

  const [existingSet] = await fulfillment.listFulfillmentSets(
    { name: FULFILLMENT_SET },
    { relations: ["service_zones"] }
  )
  const fulfillmentSet =
    existingSet ??
    (await fulfillment.createFulfillmentSets({
      name: FULFILLMENT_SET,
      type: "shipping",
      service_zones: REGIONS.map((r) => ({
        name: r.name,
        geo_zones: r.countries.map((country_code) => ({ type: "country" as const, country_code })),
      })),
    }))
  if (!existingSet) {
    logger.info("Creating the atelier's shipping zones...")
  }

  /* Both links are upserts on the pivot, so asking for one that is already
     there costs a statement and changes nothing. */
  await link.create([
    {
      [Modules.STOCK_LOCATION]: { stock_location_id: atelierId },
      [Modules.FULFILLMENT]: { fulfillment_provider_id: "manual_manual" },
    },
    {
      [Modules.STOCK_LOCATION]: { stock_location_id: atelierId },
      [Modules.FULFILLMENT]: { fulfillment_set_id: fulfillmentSet.id },
    },
  ])

  const zoneId = (name: string) => {
    const zone = (fulfillmentSet.service_zones ?? []).find((z) => z.name === name)
    if (!zone) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `The shipping set "${FULFILLMENT_SET}" has no zone named "${name}". ` +
          "Delete the set in the admin and seed again."
      )
    }
    return zone.id
  }

  const { data: existingOptions } = await query.graph({
    entity: "shipping_option",
    fields: ["id", "name"],
  })
  const missingShipping = REGIONS.filter(
    (r) => !existingOptions.some((o) => o.name === r.shipping.name)
  )
  if (missingShipping.length) {
    logger.info(`Creating ${missingShipping.length} shipping option(s)...`)
    await createShippingOptionsWorkflow(container).run({
      input: missingShipping.map((r) => ({
        name: r.shipping.name,
        price_type: "flat" as const,
        provider_id: "manual_manual",
        service_zone_id: zoneId(r.name),
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
  }

  const { data: [linkedLocation] } = await query.graph({
    entity: "stock_location",
    fields: ["id", "sales_channels.id"],
    filters: { id: atelierId },
  })
  if (!linkedLocation?.sales_channels?.some((sc) => sc?.id === salesChannelId)) {
    await linkSalesChannelsToStockLocationWorkflow(container).run({
      input: { id: atelierId, add: [salesChannelId] },
    })
  }

  /* ---- Collections ----
     `metadata.status` is the gate: `current` is orderable, `past` never is
     again, and the silhouettes are never orderable at all — a commission is
     quoted by a person, not bought. The cart enforces all three.

     Only the two that are not seasons are seeded. A season is opened by the
     house, against real pieces. */

  const wanted = [
    {
      handle: COMMISSION_COLLECTION,
      title: "Commissions",
      metadata: {
        status: "commission",
        note: "One product per quoted commission: a run of one, priced at the figure the tailor set. Created when a quote is sent; not for browsing.",
      } as Record<string, unknown>,
    },
    {
      handle: SILHOUETTE_COLLECTION,
      title: "Commission silhouettes",
      metadata: {
        status: "silhouettes",
        note: "Opening figures for Design Your Own. Edit the price here; the client is quoted properly once a tailor has read the brief.",
      } as Record<string, unknown>,
    },
  ]

  const { data: existingCollections } = await query.graph({
    entity: "product_collection",
    fields: ["id", "handle"],
  })
  const missingCollections = wanted.filter(
    (c) => !existingCollections.some((existing) => existing.handle === c.handle)
  )
  if (missingCollections.length) {
    logger.info(`Creating ${missingCollections.length} collection(s)...`)
    await createCollectionsWorkflow(container).run({ input: { collections: missingCollections } })
  }

  const { data: collections } = await query.graph({
    entity: "product_collection",
    fields: ["id", "handle"],
  })
  const collectionId = (handle: string) => collections.find((c) => c.handle === handle)!.id

  for (const collection of wanted) {
    await updateCollectionsWorkflow(container).run({
      input: {
        selector: { id: collectionId(collection.handle) },
        update: { title: collection.title, metadata: collection.metadata },
      },
    })
  }

  /* ---- Pieces and silhouettes ----
     Medusa requires every product to carry an option. There are no sizes, so
     everything shares the one option the house actually offers. */

  const { data: [existingCut] } = await query.graph({
    entity: "product_option",
    fields: ["id"],
    filters: { title: "Cut" },
  })
  const cutId =
    existingCut?.id ??
    (
      await createProductOptionsWorkflow(container).run({
        input: { product_options: [{ title: "Cut", values: ["Made to measure"] }] },
      })
    ).result[0].id

  type Wanted = {
    handle: string
    title: string
    subtitle: string
    collection: string
    metadata: Record<string, unknown>
    chf: number
  }

  const wantedProducts: Wanted[] = [
    ...SILHOUETTES.map((s, rank) => ({
      handle: `commission-${s.key}`,
      title: s.name,
      subtitle: s.note,
      collection: SILHOUETTE_COLLECTION,
      metadata: { silhouette: s.key, length_kinds: s.lengthKinds, rank },
      chf: s.estimate,
    })),
  ]

  const { data: existingProducts } = await query.graph({
    entity: "product",
    fields: ["id", "handle"],
  })
  const known = new Map(existingProducts.map((p) => [p.handle, p.id]))

  const toCreate = wantedProducts.filter((p) => !known.has(p.handle))
  if (toCreate.length) {
    logger.info(`Creating ${toCreate.length} product(s)...`)
    await createProductsWorkflow(container).run({
      input: {
        products: toCreate.map((p) => ({
          title: p.title,
          subtitle: p.subtitle,
          handle: p.handle,
          status: ProductStatus.PUBLISHED,
          collection_id: collectionId(p.collection),
          shipping_profile_id: shippingProfile.id,
          origin_country: "vn",
          metadata: p.metadata,
          sales_channels: [{ id: salesChannelId }],
          options: [{ id: cutId }],
          variants: [
            {
              title: "Made to measure",
              sku: `LINSILK-${p.handle.toUpperCase()}`,
              options: { Cut: "Made to measure" },
              /* A silhouette is a price on a page, not a garment in a capped
                 run, so nothing here is stocked. A piece is, and says so when
                 it is created. */
              manage_inventory: false,
              allow_backorder: false,
              prices: CURRENCIES.map((currency_code) => ({
                currency_code,
                amount: fromChf(p.chf, currency_code, rates),
              })),
            },
          ],
        })),
      },
    })
  }

  /* Wording, collection and metadata follow the catalogue; prices do not —
     once a product exists the house owns its price in the admin. */
  const toUpdate = wantedProducts.filter((p) => known.has(p.handle))
  if (toUpdate.length) {
    await updateProductsWorkflow(container).run({
      input: {
        products: toUpdate.map((p) => ({
          id: known.get(p.handle)!,
          title: p.title,
          subtitle: p.subtitle,
          collection_id: collectionId(p.collection),
          /* Metadata is merged, not replaced, and an empty string retires a
             key — here the single `length_kind` that came before a set could
             ask for two. */
          metadata: { ...p.metadata, length_kind: "" },
        })),
      },
    })
  }

  /* ---- The capped run ----
     Nothing is restocked, so stock is the season's cap and nothing more. */

  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id", "location_levels.id"],
  })
  const unstocked = inventoryItems.filter((item) => !item.location_levels?.length)
  if (unstocked.length) {
    await createInventoryLevelsWorkflow(container).run({
      input: {
        inventory_levels: unstocked.map((item) => ({
          location_id: atelierId,
          inventory_item_id: item.id,
          stocked_quantity: RUN_CAP,
        })),
      },
    })
  }

  logger.info(
    `Provisioned ${regions.length} regions, ${collections.length} collections ` +
      `and ${SILHOUETTES.length} silhouettes ` +
      `(${toCreate.length} created, ${toUpdate.length} refreshed). ` +
      `No season and no piece: the catalogue is the house's to add.`
  )
}
