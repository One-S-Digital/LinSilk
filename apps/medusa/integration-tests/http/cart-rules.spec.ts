import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import {
  createCollectionsWorkflow,
  createDefaultsWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  updateCollectionsWorkflow,
} from "@medusajs/medusa/core-flows"
import { BODY_ZONES, LENGTH_ZONES } from "../../src/lib/measurements"

jest.setTimeout(120 * 1000)

/* A complete sheet as the storefront's toLineItemMetadata() writes it, for a
   piece that asks for a top length. */
const SHEET: Record<string, string> = {
  measurement_unit: "cm",
  ...Object.fromEntries(BODY_ZONES.map((z, i) => [`measure_${z.key}_cm`, String(30 + i)])),
  [`measure_${LENGTH_ZONES.top.key}_cm`]: "112",
}

medusaIntegrationTestRunner({
  inApp: true,
  env: {},
  testSuite: ({ api, getContainer }) => {
    let headers: { headers: Record<string, string> }
    let regionId: string
    let openVariantId: string
    let closedVariantId: string
    let openCollectionId: string

    const refusal = (response: { status: number; data: { message?: string } }) => ({
      status: response.status,
      message: response.data.message,
    })

    beforeEach(async () => {
      const container = getContainer()
      const query = container.resolve(ContainerRegistrationKeys.QUERY)

      await createDefaultsWorkflow(container).run()
      const { data: [store] } = await query.graph({
        entity: "store",
        fields: ["default_sales_channel_id"],
      })
      const { data: [key] } = await query.graph({
        entity: "api_key",
        fields: ["token"],
        filters: { type: "publishable" },
      })
      headers = { headers: { "x-publishable-api-key": key.token } }

      const { result: [region] } = await createRegionsWorkflow(container).run({
        input: {
          regions: [
            { name: "Switzerland", currency_code: "chf", countries: ["ch"], payment_providers: ["pp_system_default"] },
          ],
        },
      })
      regionId = region.id

      const { result: collections } = await createCollectionsWorkflow(container).run({
        input: {
          collections: [
            { title: "Autumn — Collection IV", handle: "autumn-iv", metadata: { status: "current" } },
            { title: "Summer — Collection III", handle: "summer-iii", metadata: { status: "past" } },
          ],
        },
      })
      const collectionId = (handle: string) => collections.find((c) => c.handle === handle)!.id
      openCollectionId = collectionId("autumn-iv")

      const piece = (title: string, handle: string, collection: string, lengthKind: string) => ({
        title,
        handle,
        status: "published" as const,
        collection_id: collectionId(collection),
        metadata: { length_kinds: [lengthKind] },
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
      })
      const { result: products } = await createProductsWorkflow(container).run({
        input: {
          products: [
            piece("Coat, autumn silk", "w1", "autumn-iv", "top"),
            piece("Shirt dress, flax", "s1", "summer-iii", "dress"),
          ],
        },
      })
      openVariantId = products.find((p) => p.handle === "w1")!.variants[0].id
      closedVariantId = products.find((p) => p.handle === "s1")!.variants[0].id
    })

    type Line = { variant_id: string; quantity: number; metadata?: Record<string, unknown> }

    const newCart = async (items?: Line[]) =>
      api.post("/store/carts", { region_id: regionId, email: "client@example.com", items }, headers)

    const add = async (cartId: string, line: Line) =>
      api.post(`/store/carts/${cartId}/line-items`, line, headers).catch((e) => e.response)

    const checkout = async (cartId: string) => {
      const { data: { payment_collection } } = await api.post(
        "/store/payment-collections",
        { cart_id: cartId },
        headers
      )
      await api.post(
        `/store/payment-collections/${payment_collection.id}/payment-sessions`,
        { provider_id: "pp_system_default" },
        headers
      )
      return api.post(`/store/carts/${cartId}/complete`, {}, headers).catch((e) => e.response)
    }

    describe("open pieces", () => {
      it("adds one piece with a complete sheet", async () => {
        const { data: { cart } } = await newCart()
        const response = await add(cart.id, { variant_id: openVariantId, quantity: 1, metadata: SHEET })
        expect(response.status).toBe(200)
        expect(response.data.cart.items).toHaveLength(1)
      })

      it("checks out one piece with a complete sheet", async () => {
        const { data: { cart } } = await newCart([{ variant_id: openVariantId, quantity: 1, metadata: SHEET }])
        const response = await checkout(cart.id)
        expect(response.status).toBe(200)
        expect(response.data.type).toBe("order")
      })
    })

    describe("the archive", () => {
      it("refuses to add a piece from a past collection", async () => {
        const { data: { cart } } = await newCart()
        const response = await add(cart.id, { variant_id: closedVariantId, quantity: 1, metadata: SHEET })
        expect(refusal(response)).toEqual({
          status: 400,
          message: "Shirt dress, flax closed with Summer — Collection III and is not made again.",
        })
      })

      it("refuses to create a cart holding a piece from a past collection", async () => {
        const response = await newCart([{ variant_id: closedVariantId, quantity: 1, metadata: SHEET }]).catch(
          (e) => e.response
        )
        expect(refusal(response).status).toBe(400)
        expect(refusal(response).message).toContain("is not made again")
      })

      it("refuses checkout when the season closed while the piece sat in the cart", async () => {
        const { data: { cart } } = await newCart([{ variant_id: openVariantId, quantity: 1, metadata: SHEET }])
        await updateCollectionsWorkflow(getContainer()).run({
          input: { selector: { id: openCollectionId }, update: { metadata: { status: "past" } } },
        })
        expect(refusal(await checkout(cart.id))).toEqual({
          status: 400,
          message: "Coat, autumn silk closed with Autumn — Collection IV and is not made again.",
        })
      })
    })

    describe("the measurement sheet", () => {
      it("refuses a piece without a sheet", async () => {
        const { data: { cart } } = await newCart()
        const response = await add(cart.id, { variant_id: openVariantId, quantity: 1 })
        expect(refusal(response).status).toBe(400)
        expect(refusal(response).message).toMatch(
          /^The tailor cannot cut Coat, autumn silk from a partial sheet: Neck, Shoulder, .* and Desired length are missing\.$/
        )
      })

      it("refuses a sheet missing the garment length", async () => {
        const { data: { cart } } = await newCart()
        const { [`measure_${LENGTH_ZONES.top.key}_cm`]: _length, ...noLength } = SHEET
        const response = await add(cart.id, { variant_id: openVariantId, quantity: 1, metadata: noLength })
        expect(refusal(response)).toEqual({
          status: 400,
          message: "The tailor cannot cut Coat, autumn silk from a partial sheet: Desired length is missing.",
        })
      })

      it("accepts a value outside the usual range, which the tailor confirms by hand", async () => {
        const { data: { cart } } = await newCart()
        const response = await add(cart.id, {
          variant_id: openVariantId,
          quantity: 1,
          metadata: { ...SHEET, measure_bust_cm: "150" },
        })
        expect(response.status).toBe(200)
      })

      it("refuses a sheet emptied after the piece was added", async () => {
        const { data: { cart } } = await newCart([{ variant_id: openVariantId, quantity: 1, metadata: SHEET }])
        const response = await api
          .post(
            `/store/carts/${cart.id}/line-items/${cart.items[0].id}`,
            { quantity: 1, metadata: { measurement_unit: "cm" } },
            headers
          )
          .catch((e) => e.response)
        expect(refusal(response).status).toBe(400)
        expect(refusal(response).message).toContain("from a partial sheet")
      })
    })

    describe("one at a time", () => {
      const ONE_AT_A_TIME = "Each piece is cut for one person, so Coat, autumn silk is ordered one at a time."

      it("refuses more than one of a piece", async () => {
        const { data: { cart } } = await newCart()
        expect(refusal(await add(cart.id, { variant_id: openVariantId, quantity: 2, metadata: SHEET }))).toEqual({
          status: 400,
          message: ONE_AT_A_TIME,
        })
      })

      it("refuses raising a line's quantity", async () => {
        const { data: { cart } } = await newCart([{ variant_id: openVariantId, quantity: 1, metadata: SHEET }])
        const response = await api
          .post(`/store/carts/${cart.id}/line-items/${cart.items[0].id}`, { quantity: 2 }, headers)
          .catch((e) => e.response)
        expect(refusal(response)).toEqual({ status: 400, message: ONE_AT_A_TIME })
      })

      it("still lets a line be removed", async () => {
        const { data: { cart } } = await newCart([{ variant_id: openVariantId, quantity: 1, metadata: SHEET }])
        const response = await api.post(
          `/store/carts/${cart.id}/line-items/${cart.items[0].id}`,
          { quantity: 0 },
          headers
        )
        expect(response.status).toBe(200)
        expect(response.data.cart.items).toHaveLength(0)
      })

      it("refuses checkout when identical lines have merged into two", async () => {
        const { data: { cart } } = await newCart([{ variant_id: openVariantId, quantity: 1, metadata: SHEET }])
        await add(cart.id, { variant_id: openVariantId, quantity: 1, metadata: SHEET })
        const { data } = await api.get(`/store/carts/${cart.id}`, headers)
        const quantities = data.cart.items.map((i: { quantity: number }) => i.quantity)

        if (quantities.length === 1) {
          expect(quantities).toEqual([2])
          expect(refusal(await checkout(cart.id))).toEqual({ status: 400, message: ONE_AT_A_TIME })
        } else {
          /* Medusa kept them as two lines of one each, which is acceptable. */
          expect(quantities).toEqual([1, 1])
        }
      })
    })
  },
})
