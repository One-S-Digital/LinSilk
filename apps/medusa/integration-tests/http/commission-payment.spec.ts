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
import commissionPaidHandler from "../../src/subscribers/commission-paid"
import { updateCommissionWorkflow } from "../../src/workflows/atelier/commissions"
import { ATELIER_ADDRESS, ATELIER_LOCATION } from "../../src/lib/atelier-location"
import { COMMISSION_COLLECTION, SILHOUETTE_COLLECTION } from "../../src/lib/commission-catalogue"
import { BODY_ZONES, LENGTH_ZONES } from "../../src/lib/measurements"

jest.setTimeout(180 * 1000)

const SHEET = Object.fromEntries([
  ...BODY_ZONES.map((z, i) => [z.key, 30 + i]),
  [LENGTH_ZONES.top.key, 78],
])

medusaIntegrationTestRunner({
  inApp: true,
  env: {},
  testSuite: ({ api, getContainer }) => {
    let headers: { headers: Record<string, string> }

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
              currency_code: "chf",
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
        input: { locations: [{ name: ATELIER_LOCATION, address: ATELIER_ADDRESS }] },
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

    /* Everything a client does between filling a cart and paying for it. */
    const readyToPay = async (cartId: string) => {
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
    }

    const placeOrder = async (cartId: string) => {
      const { data } = await api.post(`/store/carts/${cartId}/complete`, {}, headers)
      expect(data.type).toBe("order")
      return data.order as { id: string }
    }

    /* A commission is recorded as paid by a subscriber to order.placed, which
       runs on the event bus after the response has been sent. */
    const untilPaid = async (id: string) => {
      for (let attempt = 0; attempt < 100; attempt++) {
        const commission = await storedCommission(id)
        if (commission.paid_at) {
          return commission
        }
        await new Promise((resolve) => setTimeout(resolve, 150))
      }
      throw new Error(`${id} was never recorded as paid.`)
    }

    /* The same subscriber, run by hand: for what it must not do, which
       waiting for it cannot show, and for an event delivered a second time. */
    const deliver = (orderId: string) =>
      commissionPaidHandler({
        event: { name: "order.placed", data: { id: orderId } },
        container: getContainer(),
      } as never)

    const storedCommission = (id: string) =>
      (getContainer().resolve(ATELIER_MODULE) as AtelierModuleService).retrieveCommission(id)

    /* The figure on a commission's own product, in francs. */
    const figureOnProduct = async (commissionId: string) => {
      const query = getContainer().resolve(ContainerRegistrationKeys.QUERY)
      const { data: [product] } = await query.graph({
        entity: "product",
        fields: ["variants.prices.amount", "variants.prices.currency_code"],
        filters: { handle: `commission-of-${commissionId.replace(/^com_/, "").toLowerCase()}` },
      })
      const { prices } = product.variants![0] as unknown as {
        prices: { amount: number; currency_code: string }[]
      }
      return Number(prices.find((price) => price.currency_code === "chf")!.amount)
    }

    const openCart = async (token: string) =>
      (await api.post(`/store/commissions/${token}/cart`, { country_code: "ch" }, headers)).data
        .cart_id as string

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

    it("prices the same quote in francs wherever it is going", async () => {
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
      expect(german.currency_code).toBe("chf")
      /* A new cart, because moving one between regions drops a line whose
         product is a run of one. */
      expect(german.cart_id).not.toBe(swiss.cart_id)

      const { data: cart } = await api.get(`/store/carts/${german.cart_id}`, headers)
      expect(cart.cart.items[0].unit_price).toBe(3600)
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

    it("refuses to complete a cart that was opened before the commission was declined", async () => {
      const { data: submitted } = await submitBrief()
      const quoted = await quote(submitted.commission.id, 3600)

      const cartId = await openCart(quoted.access_token)
      await readyToPay(cartId)

      /* The tailor declines while the cart is open. A status change leaves the
         cart, its line and the published variant exactly as they were. */
      await updateCommissionWorkflow(getContainer()).run({
        input: { id: submitted.commission.id, status: "declined", notify: false },
      })

      const refused = await api
        .post(`/store/carts/${cartId}/complete`, {}, headers)
        .catch((e) => e.response)
      expect(refused.status).toBe(400)
      expect(refused.data.message).toContain("declined")

      const atelier = getContainer().resolve(ATELIER_MODULE) as AtelierModuleService
      const stored = await atelier.retrieveCommission(submitted.commission.id)
      expect(stored.status).toBe("declined")
      expect(stored.order_id).toBeNull()
    })

    it("does not mark a commission paid because an order line names it", async () => {
      const container = getContainer()
      const query = container.resolve(ContainerRegistrationKeys.QUERY)
      const { data: submitted } = await submitBrief()
      const quoted = await quote(submitted.commission.id, 3600)

      /* An ordinary seasonal piece, bought in the ordinary way, with someone
         else's commission written on its line: a line's metadata is whatever
         the client sent. */
      const { result: [autumn] } = await createCollectionsWorkflow(container).run({
        input: {
          collections: [
            { title: "Autumn — Collection IV", handle: "autumn-iv", metadata: { status: "current" } },
          ],
        },
      })
      const { data: [store] } = await query.graph({
        entity: "store",
        fields: ["default_sales_channel_id"],
      })
      const { data: [profile] } = await query.graph({ entity: "shipping_profile", fields: ["id"] })
      const { data: [swiss] } = await query.graph({
        entity: "region",
        fields: ["id"],
        filters: { name: "Switzerland" },
      })
      const { result: [coat] } = await createProductsWorkflow(container).run({
        input: {
          products: [
            {
              title: "Coat, autumn silk",
              handle: "w1",
              status: ProductStatus.PUBLISHED,
              collection_id: autumn.id,
              shipping_profile_id: profile.id,
              metadata: { length_kinds: ["top"] },
              sales_channels: [{ id: store.default_sales_channel_id! }],
              options: [{ title: "Cut", values: ["Made to measure"] }],
              variants: [
                {
                  title: "Made to measure",
                  options: { Cut: "Made to measure" },
                  manage_inventory: false,
                  prices: [{ currency_code: "chf", amount: 1980 }],
                },
              ],
            },
          ],
        },
      })
      const { data: { cart } } = await api.post(
        "/store/carts",
        {
          region_id: swiss.id,
          email: "alan@example.com",
          items: [
            {
              variant_id: coat.variants![0].id,
              quantity: 1,
              metadata: {
                measurement_unit: "cm",
                ...Object.fromEntries(BODY_ZONES.map((z, i) => [`measure_${z.key}_cm`, String(30 + i)])),
                [`measure_${LENGTH_ZONES.top.key}_cm`]: "78",
                commission_id: submitted.commission.id,
              },
            },
          ],
        },
        headers
      )
      await readyToPay(cart.id)
      const order = await placeOrder(cart.id)
      await deliver(order.id)

      const stored = await storedCommission(submitted.commission.id)
      expect(stored.status).toBe("quoted")
      expect(stored.paid_at).toBeNull()
      expect(stored.order_id).toBeNull()
      expect(stored.access_token).toBe(quoted.access_token)
    })

    it("records a commission as paid whatever the client did to the metadata on its line", async () => {
      const { data: submitted } = await submitBrief()
      const quoted = await quote(submitted.commission.id, 3600)
      const cartId = await openCart(quoted.access_token)

      /* Take the commission's id off the line, as a client can. Metadata is
         merged, so a blank value is how a key is removed. */
      const { data: before } = await api.get(`/store/carts/${cartId}`, headers)
      const line = before.cart.items[0]
      await api.post(
        `/store/carts/${cartId}/line-items/${line.id}`,
        { quantity: 1, metadata: { ...line.metadata, commission_id: "" } },
        headers
      )
      const { data: after } = await api.get(`/store/carts/${cartId}`, headers)
      expect(after.cart.items[0].metadata.commission_id).not.toBe(submitted.commission.id)

      await readyToPay(cartId)
      const order = await placeOrder(cartId)

      const stored = await untilPaid(submitted.commission.id)
      expect(stored.status).toBe("in_production")
      expect(stored.order_id).toBe(order.id)
      expect(stored.paid_at).not.toBeNull()
      expect(stored.access_token).toBeNull()
    })

    it("does not record the same payment twice", async () => {
      const container = getContainer()
      const { data: submitted } = await submitBrief()
      const quoted = await quote(submitted.commission.id, 3600)
      const cartId = await openCart(quoted.access_token)
      await readyToPay(cartId)
      const order = await placeOrder(cartId)

      const first = await untilPaid(submitted.commission.id)
      expect(first.order_id).toBe(order.id)

      /* The event is delivered again. */
      const notification = container.resolve(Modules.NOTIFICATION)
      const sent = jest.spyOn(notification, "createNotifications")
      try {
        await deliver(order.id)
        expect(sent).not.toHaveBeenCalled()
      } finally {
        sent.mockRestore()
      }

      const second = await storedCommission(submitted.commission.id)
      expect(second.paid_at).toEqual(first.paid_at)
      expect(second.order_id).toBe(first.order_id)
    })

    it("keeps the client's cart when a re-quote fails before the figure has moved", async () => {
      const { data: submitted } = await submitBrief()
      const quoted = await quote(submitted.commission.id, 3600)
      const cartId = await openCart(quoted.access_token)

      /* The catalogue refuses the new figure, so nothing has changed: the
         client's cart, with whatever they have filled in on it, is still the
         one that settles the figure they were quoted. */
      const products = getContainer().resolve(Modules.PRODUCT)
      const refusing = jest
        .spyOn(products, "upsertProductVariants")
        .mockRejectedValueOnce(new Error("the catalogue is not answering"))
      try {
        await expect(
          updateCommissionWorkflow(getContainer()).run({
            input: { id: submitted.commission.id, quote_amount: 4000, notify: false },
          })
        ).rejects.toBeTruthy()
        expect(refusing).toHaveBeenCalledTimes(1)
      } finally {
        refusing.mockRestore()
      }

      const { data } = await api.get(`/store/carts/${cartId}`, headers)
      expect(data.cart.id).toBe(cartId)
      const stored = await storedCommission(submitted.commission.id)
      expect(stored.cart_id).toBe(cartId)
      expect(Number(stored.quote_amount)).toBe(3600)
    })

    it("puts the cart and the figure back when a re-quote cannot be recorded on the commission", async () => {
      const { data: submitted } = await submitBrief()
      const quoted = await quote(submitted.commission.id, 3600)
      const cartId = await openCart(quoted.access_token)

      /* The new figure is on the product and the old cart is gone by the time
         the commission itself fails to take it. */
      const atelier = getContainer().resolve(ATELIER_MODULE) as AtelierModuleService
      const failing = jest
        .spyOn(atelier, "updateCommissions")
        .mockRejectedValueOnce(new Error("the database went away"))
      try {
        await expect(
          updateCommissionWorkflow(getContainer()).run({
            input: { id: submitted.commission.id, quote_amount: 4000, notify: false },
          })
        ).rejects.toBeTruthy()
        expect(failing).toHaveBeenCalledTimes(1)
      } finally {
        failing.mockRestore()
      }

      /* Nothing happened: the old quote stands, at the old figure, with the
         client's cart still behind it. */
      const { data } = await api.get(`/store/carts/${cartId}`, headers)
      expect(data.cart.items).toHaveLength(1)
      const stored = await storedCommission(submitted.commission.id)
      expect(stored.cart_id).toBe(cartId)
      expect(Number(stored.quote_amount)).toBe(3600)
      expect(await figureOnProduct(submitted.commission.id)).toBe(3600)
    })

    it("refuses a re-quote when the old cart cannot be dropped", async () => {
      const { data: submitted } = await submitBrief()
      const quoted = await quote(submitted.commission.id, 3600)
      const cartId = await openCart(quoted.access_token)

      /* A cart that survived would still settle the figure that has moved, so
         the re-quote must not go ahead as if it had been dropped. */
      const carts = getContainer().resolve(Modules.CART)
      const failing = jest
        .spyOn(carts, "softDeleteCarts")
        .mockRejectedValueOnce(new Error("the cart store is not answering"))
      try {
        await expect(
          updateCommissionWorkflow(getContainer()).run({
            input: { id: submitted.commission.id, quote_amount: 4000, notify: false },
          })
        ).rejects.toBeTruthy()
        expect(failing).toHaveBeenCalledTimes(1)
      } finally {
        failing.mockRestore()
      }

      const { data } = await api.get(`/store/carts/${cartId}`, headers)
      expect(data.cart.id).toBe(cartId)
      const stored = await storedCommission(submitted.commission.id)
      expect(stored.cart_id).toBe(cartId)
      expect(Number(stored.quote_amount)).toBe(3600)
      expect(await figureOnProduct(submitted.commission.id)).toBe(3600)
    })

    it("re-quotes a commission whose remembered cart no longer exists", async () => {
      const { data: submitted } = await submitBrief()
      await quote(submitted.commission.id, 3600)

      /* A cart id left behind by a cart that has since been removed must not
         stand in the way of putting a new figure on the brief. */
      const atelier = getContainer().resolve(ATELIER_MODULE) as AtelierModuleService
      await atelier.updateCommissions({ id: submitted.commission.id, cart_id: "cart_long_gone" } as never)

      await quote(submitted.commission.id, 4000)

      const stored = await storedCommission(submitted.commission.id)
      expect(stored.cart_id).toBeNull()
      expect(Number(stored.quote_amount)).toBe(4000)
      expect(await figureOnProduct(submitted.commission.id)).toBe(4000)
    })

    it("still drops the cart once a re-quote has moved the figure", async () => {
      const { data: submitted } = await submitBrief()
      const quoted = await quote(submitted.commission.id, 3600)
      const cartId = await openCart(quoted.access_token)

      await quote(submitted.commission.id, 4000)

      /* A cart priced at the old figure must not be able to settle the new one. */
      const gone = await api.get(`/store/carts/${cartId}`, headers).catch((e) => e.response)
      expect(gone.status).toBe(404)
      expect((await storedCommission(submitted.commission.id)).cart_id).toBeNull()
    })

    it("refuses a link that does not answer to a commission", async () => {
      const response = await api
        .post("/store/commissions/not-a-real-token/cart", { country_code: "ch" }, headers)
        .catch((e) => e.response)
      expect(response.status).toBe(404)
    })
  },
})
