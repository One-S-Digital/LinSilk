/* Provisions the house: store, regions, shipping, collections, pieces and the
 * commission silhouettes.
 *
 *   pnpm --filter medusa exec medusa exec ./src/scripts/seed.ts
 *
 * Safe to run again. Anything missing is created; a piece that already exists
 * has its wording, collection and metadata brought back in line with the
 * catalogue. Prices are written once, at creation — after that the house owns
 * them in the admin, and the refresh-exchange-rates job keeps the euro and
 * sterling figures derived from the franc.
 *
 * The catalogue is read straight from the storefront's lib/catalog.ts, which
 * is the source of truth for the domain. Every piece is one product with one
 * variant — nothing in this house is sold in sizes — and the measurement
 * sheet travels on the line item, not the variant.
 *
 * Collections I-III are placeholder content. Seed them for a working archive,
 * but do not let them reach production without the client's real archive.
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
  updateCollectionsWorkflow,
  updateProductsWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows"
import { COLLECTIONS, PIECES, SILHOUETTES } from "../../../storefront/lib/catalog"
import { fetchChfRates } from "../lib/exchange-rates"
import { SILHOUETTE_COLLECTION } from "../lib/commission-catalogue"
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

  /* ---- Where it is made, and how it travels ----
     Everything is cut in Hội An and ships from there; the courier clears
     customs out of Việt Nam. */

  const { data: [existingLocation] } = await query.graph({
    entity: "stock_location",
    fields: ["id"],
    filters: { name: "Atelier, Hội An" },
  })
  let atelierId = existingLocation?.id

  if (!atelierId) {
    logger.info("Creating the atelier's stock location and shipping...")
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

    await link.create({
      [Modules.STOCK_LOCATION]: { stock_location_id: atelierId },
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
      [Modules.STOCK_LOCATION]: { stock_location_id: atelierId },
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
      input: { id: atelierId, add: [salesChannelId] },
    })
  }

  /* ---- Collections ----
     `metadata.status` is the gate: `current` is orderable, `past` never is
     again, and the silhouettes are never orderable at all — a commission is
     quoted by a person, not bought. The cart enforces all three. */

  const wanted = [
    ...COLLECTIONS.map((c) => ({
      handle: c.slug,
      title: c.title,
      metadata: {
        status: c.status,
        season: c.season,
        number: c.number,
        note: c.note,
        ...(c.closes ? { closes: c.closes } : {}),
      } as Record<string, unknown>,
    })),
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
    /* A silhouette is a price on a page, not a garment in a capped run. */
    managed: boolean
  }

  const wantedProducts: Wanted[] = [
    ...PIECES.map((p) => ({
      handle: p.id,
      title: p.name,
      subtitle: p.material,
      collection: p.collection,
      metadata: {
        group: p.group,
        shot: p.shot,
        ...(p.sleep ? { sleep: true } : {}),
        ...(p.lengthKinds ? { length_kinds: p.lengthKinds } : {}),
      },
      chf: p.price,
      managed: true,
    })),
    ...SILHOUETTES.map((s, rank) => ({
      handle: `commission-${s.key}`,
      title: s.name,
      subtitle: s.note,
      collection: SILHOUETTE_COLLECTION,
      metadata: { silhouette: s.key, length_kinds: s.lengthKinds, rank },
      chf: s.estimate,
      managed: false,
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
              sku: `AYLA-${p.handle.toUpperCase()}`,
              options: { Cut: "Made to measure" },
              manage_inventory: p.managed,
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
    `Provisioned ${regions.length} regions, ${collections.length} collections, ` +
      `${PIECES.length} pieces and ${SILHOUETTES.length} silhouettes ` +
      `(${toCreate.length} created, ${toUpdate.length} refreshed).`
  )
}
