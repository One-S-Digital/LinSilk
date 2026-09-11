import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import {
  createCollectionsWorkflow,
  createDefaultsWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  updateCollectionsWorkflow,
} from "@medusajs/medusa/core-flows"

jest.setTimeout(120 * 1000)

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

      const piece = (title: string, handle: string, collection: string) => ({
        title,
        handle,
        status: "published" as const,
        collection_id: collectionId(collection),
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
            piece("Coat, Bảo Lộc silk", "w1", "autumn-iv"),
            piece("Shirt dress, flax", "s1", "summer-iii"),
          ],
        },
      })
      openVariantId = products.find((p) => p.handle === "w1")!.variants[0].id
      closedVariantId = products.find((p) => p.handle === "s1")!.variants[0].id
    })

    const newCart = async (items?: { variant_id: string; quantity: number }[]) =>
      api.post("/store/carts", { region_id: regionId, email: "client@example.com", items }, headers)

    it("adds a piece from the current collection", async () => {
      const { data: { cart } } = await newCart()
      const response = await api.post(
        `/store/carts/${cart.id}/line-items`,
        { variant_id: openVariantId, quantity: 1 },
        headers
      )
      expect(response.status).toBe(200)
      expect(response.data.cart.items).toHaveLength(1)
    })

    it("refuses to add a piece from a past collection", async () => {
      const { data: { cart } } = await newCart()
      const response = await api
        .post(`/store/carts/${cart.id}/line-items`, { variant_id: closedVariantId, quantity: 1 }, headers)
        .catch((e) => e.response)

      expect(refusal(response)).toEqual({
        status: 400,
        message: "Shirt dress, flax closed with Summer — Collection III and is not made again.",
      })
    })

    it("refuses to create a cart holding a piece from a past collection", async () => {
      const response = await newCart([{ variant_id: closedVariantId, quantity: 1 }]).catch((e) => e.response)
      expect(refusal(response).status).toBe(400)
      expect(refusal(response).message).toContain("is not made again")
    })

    it("refuses checkout when the season closed while the piece sat in the cart", async () => {
      const { data: { cart } } = await newCart([{ variant_id: openVariantId, quantity: 1 }])

      const { data: { payment_collection } } = await api.post(
        "/store/payment-collections",
        { cart_id: cart.id },
        headers
      )
      await api.post(
        `/store/payment-collections/${payment_collection.id}/payment-sessions`,
        { provider_id: "pp_system_default" },
        headers
      )

      await updateCollectionsWorkflow(getContainer()).run({
        input: { selector: { id: openCollectionId }, update: { metadata: { status: "past" } } },
      })

      const response = await api.post(`/store/carts/${cart.id}/complete`, {}, headers).catch((e) => e.response)
      expect(refusal(response)).toEqual({
        status: 400,
        message: "Coat, Bảo Lộc silk closed with Autumn — Collection IV and is not made again.",
      })
    })
  },
})
