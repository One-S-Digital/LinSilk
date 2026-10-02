import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import { ContainerRegistrationKeys, Modules, ProductStatus } from "@medusajs/framework/utils"
import {
  createCollectionsWorkflow,
  createDefaultsWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
} from "@medusajs/medusa/core-flows"
import { ATELIER_MODULE } from "../../src/modules/atelier"
import type AtelierModuleService from "../../src/modules/atelier/service"
import { updateCommissionWorkflow } from "../../src/workflows/atelier/commissions"
import { COMMISSION_COLLECTION, SILHOUETTE_COLLECTION } from "../../src/lib/commission-catalogue"
import { BODY_ZONES, LENGTH_ZONES } from "../../src/lib/measurements"

jest.setTimeout(180 * 1000)

/* The ECB's feed, frozen: a test should not depend on the bank being up, and
   a known rate makes the converted figures checkable. */
const ECB_FEED = `<?xml version="1.0" encoding="UTF-8"?>
<gesmes:Envelope xmlns:gesmes="http://www.gesmes.org/xml/2002-08-01">
  <Cube><Cube time='2026-09-11'>
    <Cube currency='GBP' rate='0.85915'/>
    <Cube currency='CHF' rate='0.9432'/>
  </Cube></Cube>
</gesmes:Envelope>`

const SHEET = Object.fromEntries([
  ...BODY_ZONES.map((z, i) => [z.key, 30 + i]),
  [LENGTH_ZONES.top.key, 78],
])

medusaIntegrationTestRunner({
  inApp: true,
  env: {},
  testSuite: ({ api, getContainer }) => {
    let headers: { headers: Record<string, string> }
    let realFetch: typeof fetch

    beforeAll(() => {
      realFetch = global.fetch
      global.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
        if (String(input).includes("ecb.europa.eu")) {
          return new Response(ECB_FEED, { status: 200 })
        }
        return realFetch(input, init)
      }) as typeof fetch
    })

    afterAll(() => {
      global.fetch = realFetch
    })

    beforeEach(async () => {
      const container = getContainer()
      const query = container.resolve(ContainerRegistrationKeys.QUERY)

      await createDefaultsWorkflow(container).run()
      const { data: [store] } = await query.graph({
        entity: "store",
        fields: ["id", "default_sales_channel_id"],
      })
      const { data: [key] } = await query.graph({
        entity: "api_key",
        fields: ["token"],
        filters: { type: "publishable" },
      })
      headers = { headers: { "x-publishable-api-key": key.token } }

      await createRegionsWorkflow(container).run({
        input: {
          regions: [
            {
              name: "Switzerland",
              currency_code: "chf",
              countries: ["ch"],
              payment_providers: ["pp_system_default"],
            },
            {
              name: "Europe",
              currency_code: "eur",
              countries: ["de"],
              payment_providers: ["pp_system_default"],
            },
          ],
        },
      })

      await createCollectionsWorkflow(container).run({
        input: {
          collections: [
            {
              title: "Commission silhouettes",
              handle: SILHOUETTE_COLLECTION,
              metadata: { status: "silhouettes" },
            },
            { title: "Commissions", handle: COMMISSION_COLLECTION, metadata: { status: "commission" } },
          ],
        },
      })

      /* One silhouette to quote against. */
      const { data: [collection] } = await query.graph({
        entity: "product_collection",
        fields: ["id"],
        filters: { handle: SILHOUETTE_COLLECTION },
      })
      await createProductsWorkflow(container).run({
        input: {
          products: [
            {
              title: "Jacket",
              handle: "commission-jacket",
              status: ProductStatus.PUBLISHED,
              collection_id: collection.id,
              metadata: { silhouette: "jacket", length_kinds: ["top"], rank: 0 },
              sales_channels: [{ id: store.default_sales_channel_id! }],
              options: [{ title: "Cut", values: ["Made to measure"] }],
              variants: [
                {
                  title: "Made to measure",
                  options: { Cut: "Made to measure" },
                  manage_inventory: false,
                  prices: [{ currency_code: "chf", amount: 3200 }],
                },
              ],
            },
          ],
        },
      })

      /* Somewhere to make it, and a way to send it. */
      const { result: [location] } = await createStockLocationsWorkflow(container).run({
        input: { locations: [{ name: "Atelier, Hội An", address: { city: "Hội An", country_code: "VN", address_1: "" } }] },
      })
      const link = container.resolve(ContainerRegistrationKeys.LINK)
      await link.create({
        [Modules.STOCK_LOCATION]: { stock_location_id: location.id },
        [Modules.FULFILLMENT]: { fulfillment_provider_id: "manual_manual" },
      })
      const fulfillment = container.resolve(Modules.FULFILLMENT)
      const set = await fulfillment.createFulfillmentSets({
        name: "Atelier",
        type: "shipping",
        service_zones: [
          { name: "Switzerland", geo_zones: [{ type: "country" as const, country_code: "ch" }] },
        ],
      })
      await link.create({
        [Modules.STOCK_LOCATION]: { stock_location_id: location.id },
        [Modules.FULFILLMENT]: { fulfillment_set_id: set.id },
      })
      await linkSalesChannelsToStockLocationWorkflow(container).run({
        input: { id: location.id, add: [store.default_sales_channel_id!] },
      })
      const { data: profiles } = await query.graph({ entity: "shipping_profile", fields: ["id"] })
      const profile =
        profiles[0] ??
        (
          await createShippingProfilesWorkflow(container).run({
            input: { data: [{ name: "Default", type: "default" }] },
          })
        ).result[0]
      await createShippingOptionsWorkflow(container).run({
        input: [
          {
            name: "Switzerland",
            price_type: "flat" as const,
            provider_id: "manual_manual",
            service_zone_id: set.service_zones[0].id,
            shipping_profile_id: profile.id,
            type: { label: "Switzerland", description: "Two to three days.", code: "chf" },
            prices: [{ currency_code: "chf", amount: 0 }],
            rules: [
              { attribute: "enabled_in_store", value: "true", operator: "eq" as const },
              { attribute: "is_return", value: "false", operator: "eq" as const },
            ],
          },
        ],
      })
    })

    const submitBrief = async () =>
      api.post(
        "/store/commissions",
        {
          name: "Alan Turing",
          email: "alan@example.com",
          silhouette: "jacket",
          fabric: "Linen canvas, olive",
          measurements: JSON.stringify(SHEET),
        },
        headers
      )

    const quote = async (id: string, amount: number) => {
      const { result } = await updateCommissionWorkflow(getContainer()).run({
        input: { id, quote_amount: amount, notify: true },
      })
      return result as unknown as { access_token: string; status: string; cart_id: string | null }
    }

    it("turns a quote into a payable link, and the payment into an order", async () => {
      const { data: submitted } = await submitBrief()
      const quoted = await quote(submitted.commission.id, 3600)

      expect(quoted.status).toBe("quoted")
      expect(quoted.access_token).toEqual(expect.any(String))

      /* The client opens the link and says where the piece is going. */
      const { data: opened } = await api.post(
        `/store/commissions/${quoted.access_token}/cart`,
        { country_code: "ch" },
        headers
      )
      expect(opened.currency_code).toBe("chf")

      const cartId = opened.cart_id
      await api.post(
        `/store/carts/${cartId}`,
        {
          shipping_address: {
            first_name: "Alan",
            last_name: "Turing",
            address_1: "Bahnhofstrasse 1",
            city: "Zürich",
            postal_code: "8001",
            country_code: "ch",
          },
        },
        headers
      )
      const { data: options } = await api.get(`/store/shipping-options?cart_id=${cartId}`, headers)
      await api.post(
        `/store/carts/${cartId}/shipping-methods`,
        { option_id: options.shipping_options[0].id },
        headers
      )
      const { data: collection } = await api.post(
        "/store/payment-collections",
        { cart_id: cartId },
        headers
      )
      await api.post(
        `/store/payment-collections/${collection.payment_collection.id}/payment-sessions`,
        { provider_id: "pp_system_default" },
        headers
      )
      const { data: completed } = await api.post(`/store/carts/${cartId}/complete`, {}, headers)

      expect(completed.type).toBe("order")
      expect(completed.order.total).toBe(3600)
      /* The sheet reaches the bench on the order line. */
      expect(completed.order.items[0].metadata).toMatchObject({
        commission_id: submitted.commission.id,
        [`measure_${LENGTH_ZONES.top.key}_cm`]: "78",
      })
    })

    it("prices the same quote in the currency of the country it is going to", async () => {
      const { data: submitted } = await submitBrief()
      const quoted = await quote(submitted.commission.id, 3600)

      const { data: swiss } = await api.post(
        `/store/commissions/${quoted.access_token}/cart`,
        { country_code: "ch" },
        headers
      )
      const { data: german } = await api.post(
        `/store/commissions/${quoted.access_token}/cart`,
        { country_code: "de" },
        headers
      )

      expect(swiss.currency_code).toBe("chf")
      expect(german.currency_code).toBe("eur")
      /* A new cart, because moving one between regions drops a line whose
         product is a run of one. */
      expect(german.cart_id).not.toBe(swiss.cart_id)

      const { data: cart } = await api.get(`/store/carts/${german.cart_id}`, headers)
      /* 3600 francs at 1/0.9432, rounded to the nearest ten. */
      expect(cart.cart.items[0].unit_price).toBe(3820)
    })

    const briefWithReference = (filename: string, type: string) => {
      const form = new FormData()
      form.set("name", "Alan Turing")
      form.set("email", "alan@example.com")
      form.set("silhouette", "jacket")
      form.set("fabric", "Linen canvas, olive")
      form.set("measurements", JSON.stringify(SHEET))
      form.append("references", new Blob([new Uint8Array([1, 2, 3])], { type }), filename)
      return api.post("/store/commissions", form, headers)
    }

    it("takes a .heic reference the browser gave no type for", async () => {
      /* Chrome and Firefox send a .heic with no type at all, which arrives as
         application/octet-stream; the form invites HEIC, so the endpoint must
         not refuse it after the client has filled in the whole brief. */
      const { data } = await briefWithReference("front.heic", "application/octet-stream")

      const atelier = getContainer().resolve(ATELIER_MODULE) as AtelierModuleService
      const stored = await atelier.retrieveCommission(data.commission.id)
      expect(stored.references).toEqual([
        expect.objectContaining({ filename: "front.heic", mime_type: "image/heic" }),
      ])
    })

    it("takes the uploaded references back out when the brief cannot be written", async () => {
      const container = getContainer()
      const atelier = container.resolve(ATELIER_MODULE) as AtelierModuleService
      const files = container.resolve(Modules.FILE)
      const deleted = jest.spyOn(files, "deleteFiles")
      const failing = jest
        .spyOn(atelier, "createCommissions")
        .mockRejectedValueOnce(new Error("the database went away"))

      try {
        const failed = await briefWithReference("front.jpg", "image/jpeg").catch((e) => e.response)
        expect(failed.status).toBe(500)

        /* The file went up before the brief was attempted; with no brief to
           point at it, it must not be left in the private bucket. */
        expect(deleted).toHaveBeenCalledTimes(1)
        expect(deleted).toHaveBeenCalledWith([expect.any(String)])
      } finally {
        failing.mockRestore()
        deleted.mockRestore()
      }
    })

    it("does not relabel a .heic the browser declared as something else", async () => {
      const refused = await briefWithReference("front.heic", "text/plain").catch((e) => e.response)
      expect(refused.status).toBe(400)
      expect(refused.data.message).toContain("front.heic")
    })

    it("still refuses a reference that is neither an image nor a PDF", async () => {
      const refused = await briefWithReference("notes.txt", "application/octet-stream").catch(
        (e) => e.response
      )
      expect(refused.status).toBe(400)
      expect(refused.data.message).toContain("notes.txt")
    })

    it("refuses a cart on a commission that was declined after being quoted", async () => {
      const { data: submitted } = await submitBrief()
      const quoted = await quote(submitted.commission.id, 3600)

      await updateCommissionWorkflow(getContainer()).run({
        input: { id: submitted.commission.id, status: "declined", notify: false },
      })

      /* The figure from before it was declined is still sitting on the
         record — it is the status, not the figure, that has to refuse this. */
      const refused = await api
        .post(`/store/commissions/${quoted.access_token}/cart`, { country_code: "ch" }, headers)
        .catch((e) => e.response)
      expect(refused.status).toBe(400)
      expect(refused.data.message).toContain("declined")
    })

    it("refuses a link that does not answer to a commission", async () => {
      const response = await api
        .post("/store/commissions/not-a-real-token/cart", { country_code: "ch" }, headers)
        .catch((e) => e.response)
      expect(response.status).toBe(404)
    })
  },
})
