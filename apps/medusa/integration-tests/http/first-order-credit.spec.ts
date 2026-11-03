import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import deliveryCreatedHandler from "../../src/subscribers/delivery-created"
import orderCanceledHandler from "../../src/subscribers/order-canceled"
import { creditCode } from "../../src/lib/first-order-credit"

jest.setTimeout(120 * 1000)

/* The first-order credit, through the real database: issued when a first
   order is delivered, once, and not to a repeat client; withdrawn if the
   order is cancelled before it is spent. */

medusaIntegrationTestRunner({
  inApp: true,
  env: {},
  testSuite: ({ getContainer }) => {
    const call = (handler: (args: never) => Promise<void>, data: Record<string, unknown>) =>
      handler({ event: { name: "test", data }, container: getContainer() } as never)

    const makeOrder = (email: string, address1 = "Rue du Rhône 1", unitPrice = 129) =>
      getContainer().resolve(Modules.ORDER).createOrders({
        currency_code: "chf",
        email,
        items: [{ title: "Silk cowl halter gown", quantity: 1, unit_price: unitPrice }],
        shipping_address: { first_name: "Ada", last_name: "Lovelace", address_1: address1, postal_code: "1204", country_code: "ch" },
      })

    const deliver = async (orderId: string) => {
      const container = getContainer()
      const fulfillment = await container.resolve(Modules.FULFILLMENT).createFulfillment({
        location_id: "sloc_test",
        provider_id: "manual_manual",
        delivery_address: { address_1: "x", city: "Geneva", country_code: "ch" },
        items: [],
        labels: [],
        order: {},
      } as never)
      await container.resolve(ContainerRegistrationKeys.LINK).create({
        [Modules.ORDER]: { order_id: orderId },
        [Modules.FULFILLMENT]: { fulfillment_id: fulfillment.id },
      })
      await call(deliveryCreatedHandler, { id: fulfillment.id })
    }

    const credit = async (orderId: string) => {
      const [promotion] = await getContainer()
        .resolve(Modules.PROMOTION)
        .listPromotions({ code: [creditCode(orderId, process.env.JWT_SECRET ?? "development-secret")] }, { relations: ["application_method", "campaign", "campaign.budget"] })
      return promotion
    }

    const mails = async (orderId: string) =>
      (await getContainer().resolve(Modules.NOTIFICATION).listNotifications({ resource_id: orderId, template: "first-order-credit" }))

    it("issues 20% of the pieces on delivery, once, and tells the client", async () => {
      const order = await makeOrder("ada@example.com")
      await deliver(order.id)
      await deliver(order.id)

      const promotion = await credit(order.id)
      expect(promotion.status).toBe("active")
      expect(Number(promotion.application_method?.value)).toBe(25.8)
      expect(promotion.application_method?.currency_code).toBe("chf")
      expect(promotion.campaign?.budget?.type).toBe("usage")
      expect(promotion.campaign?.budget?.limit).toBe(1)
      expect(promotion.campaign?.ends_at).toBeTruthy()
      expect(await mails(order.id)).toHaveLength(1)
    })

    it("takes its amount off a later order's pieces, and no more than once", async () => {
      const order = await makeOrder("ada2@example.com", "Rue Neuve 2")
      await deliver(order.id)
      const code = creditCode(order.id, process.env.JWT_SECRET ?? "development-secret")
      const promotions = getContainer().resolve(Modules.PROMOTION)
      const cart = {
        currency_code: "chf",
        items: [{ id: "item_1", quantity: 1, subtotal: 300, original_total: 300, is_discountable: true, product: { id: "prod_1" } }],
      } as never

      const actions = await promotions.computeActions([code], cart)
      expect(actions).toHaveLength(1)
      expect(actions[0]).toMatchObject({ action: "addItemAdjustment", code })
      expect(Number((actions[0] as { amount: unknown }).amount)).toBe(25.8)

      const [promotion] = await promotions.listPromotions({ code: [code] }, { relations: ["campaign", "campaign.budget"] })
      await promotions.registerUsage([{ amount: 25.8, code }], { customer_id: null, customer_email: "ada2@example.com" } as never)
      expect((await promotions.computeActions([code], cart)).map((a) => a.action)).toEqual(["campaignBudgetExceeded"])
      expect(promotion.campaign?.budget?.limit).toBe(1)
    })

    it("gives nothing for a later order from the same email or the same address", async () => {
      const first = await makeOrder("grace@example.com", "Quai 5")
      const sameEmail = await makeOrder("grace@example.com", "Elsewhere 9")
      const sameAddress = await makeOrder("other@example.com", "quai 5")
      await deliver(sameEmail.id)
      await deliver(sameAddress.id)
      expect(await credit(sameEmail.id)).toBeUndefined()
      expect(await credit(sameAddress.id)).toBeUndefined()
      await deliver(first.id)
      expect(await credit(first.id)).toBeDefined()
    })

    it("is withdrawn when the order is cancelled before the credit is spent", async () => {
      const order = await makeOrder("hedy@example.com", "Place 3")
      await deliver(order.id)
      expect((await credit(order.id)).status).toBe("active")

      await call(orderCanceledHandler, { id: order.id })
      expect((await credit(order.id)).status).toBe("inactive")
    })
  },
})
