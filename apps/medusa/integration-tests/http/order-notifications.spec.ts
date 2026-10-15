import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import type { MedusaContainer } from "@medusajs/framework/types"
import deliveryCreatedHandler from "../../src/subscribers/delivery-created"
import orderCanceledHandler from "../../src/subscribers/order-canceled"
import orderSheetConfirmedHandler from "../../src/subscribers/order-sheet-confirmed"
import paymentCapturedHandler from "../../src/subscribers/payment-captured"
import paymentRefundedHandler from "../../src/subscribers/payment-refunded"
import shipmentCreatedHandler from "../../src/subscribers/shipment-created"
import { confirmOrderSheetWorkflow } from "../../src/workflows/orders/confirm-order-sheet"

jest.setTimeout(120 * 1000)

/* What the client is told as an order moves on. The subscribers are called
   directly, as commission-payment.spec.ts does, with the event payloads Medusa
   itself emits; what is checked is the real database path — payment or
   fulfilment to order — and that the same event never writes twice. */

medusaIntegrationTestRunner({
  inApp: true,
  env: {},
  testSuite: ({ api, getContainer }) => {
    const event = (data: Record<string, unknown>) => ({ name: "test", data })
    const run = (
      handler: (args: never) => Promise<void>,
      container: MedusaContainer,
      data: Record<string, unknown>
    ) => handler({ event: event(data), container } as never)

    /* The notification module keeps a record of each mail but not its body, so
       the body is read from what was handed to it. Records, not calls, are
       what is counted: a repeated event reaches the module but must not
       become a second record. */
    const bodies = new Map<string, { text: string; html: string }>()
    /** Every text handed over, for the one case where two mails share a template. */
    const everyText: string[] = []

    beforeEach(() => {
      bodies.clear()
      everyText.length = 0
      const notification = getContainer().resolve(Modules.NOTIFICATION)
      const create = notification.createNotifications.bind(notification) as (data: never) => Promise<unknown>
      jest.spyOn(notification, "createNotifications").mockImplementation(((data: {
        resource_id?: string
        template?: string
        content?: { text?: string; html?: string }
      }) => {
        everyText.push(data.content?.text ?? "")
        bodies.set(`${data.resource_id}:${data.template}`, {
          text: data.content?.text ?? "",
          html: data.content?.html ?? "",
        })
        return create(data as never)
      }) as never)
    })

    afterEach(() => jest.restoreAllMocks())

    const sentFor = async (orderId: string) => {
      const notification = getContainer().resolve(Modules.NOTIFICATION)
      const sent = await notification.listNotifications({ resource_id: orderId })
      return sent.map((n) => ({
        template: n.template,
        text: bodies.get(`${orderId}:${n.template}`)?.text ?? "",
        html: bodies.get(`${orderId}:${n.template}`)?.html ?? "",
      }))
    }

    /* A payment, as the system provider makes one: a session on a collection,
       authorised. */
    const authorisedPayment = async (collectionId: string, amount: number) => {
      const payments = getContainer().resolve(Modules.PAYMENT)
      const session = await payments.createPaymentSession(collectionId, {
        provider_id: "pp_system_default",
        currency_code: "chf",
        amount,
        data: {},
      })
      return payments.authorizePaymentSession(session.id, {})
    }

    const makeOrder = async () => {
      const container = getContainer()
      const orders = container.resolve(Modules.ORDER)
      return orders.createOrders({
        currency_code: "chf",
        email: "ada@example.com",
        items: [{ title: "Silk cowl halter gown", quantity: 1, unit_price: 129 }],
        shipping_address: { first_name: "Ada", last_name: "Lovelace", country_code: "ch" },
      })
    }

    const makePayment = async (orderId: string) => {
      const container = getContainer()
      const payments = container.resolve(Modules.PAYMENT)
      const link = container.resolve(ContainerRegistrationKeys.LINK)
      const collection = await payments.createPaymentCollections({ currency_code: "chf", amount: 129 })
      await link.create({
        [Modules.ORDER]: { order_id: orderId },
        [Modules.PAYMENT]: { payment_collection_id: collection.id },
      })
      return authorisedPayment(collection.id, 129)
    }

    const makeFulfillment = async (orderId: string) => {
      const container = getContainer()
      const fulfillments = container.resolve(Modules.FULFILLMENT)
      const link = container.resolve(ContainerRegistrationKeys.LINK)
      const fulfillment = await fulfillments.createFulfillment({
        location_id: "sloc_test",
        provider_id: "manual_manual",
        delivery_address: { address_1: "Rue du Rhône 1", city: "Geneva", country_code: "ch" },
        items: [],
        labels: [
          { tracking_number: "99.12.345", tracking_url: "https://track.example.com/99.12.345", label_url: "https://track.example.com/l" },
        ],
        order: {},
      } as never)
      await link.create({
        [Modules.ORDER]: { order_id: orderId },
        [Modules.FULFILLMENT]: { fulfillment_id: fulfillment.id },
      })
      return fulfillment
    }

    describe("payment received", () => {
      it("tells the client once, with the amount of that payment, however often the event arrives", async () => {
        const container = getContainer()
        const order = await makeOrder()
        const payment = await makePayment(order.id)

        await run(paymentCapturedHandler, container, { id: payment.id })
        await run(paymentCapturedHandler, container, { id: payment.id })

        const sent = await sentFor(order.id)
        expect(sent.map((s) => s.template)).toEqual(["payment-received"])
        expect(sent[0].text).toContain("CHF 129")
        expect(sent[0].text).toContain("Dear Ada Lovelace,")
        expect(sent[0].html).toContain("Silk cowl halter gown")
      })

      it("stays quiet when the confirmation already said the order is paid", async () => {
        const container = getContainer()
        const order = await makeOrder()
        const payment = await makePayment(order.id)
        await container.resolve(Modules.NOTIFICATION).createNotifications({
          to: "ada@example.com",
          channel: "email",
          template: "order-confirmation",
          resource_id: order.id,
          data: { paid: true },
          content: { subject: "Your order", text: "Thank you. Your order is paid for." },
        })

        await run(paymentCapturedHandler, container, { id: payment.id })

        expect((await sentFor(order.id)).map((s) => s.template)).toEqual(["order-confirmation"])
      })

      it("ignores a payment that belongs to no order, without failing", async () => {
        const container = getContainer()
        const payments = container.resolve(Modules.PAYMENT)
        const collection = await payments.createPaymentCollections({ currency_code: "chf", amount: 50 })
        const payment = await authorisedPayment(collection.id, 50)

        await expect(run(paymentCapturedHandler, container, { id: payment.id })).resolves.toBeUndefined()
      })
    })

    describe("refund", () => {
      it("is told with the amount refunded, and a second refund is told as its own", async () => {
        const container = getContainer()
        const payments = container.resolve(Modules.PAYMENT)
        const order = await makeOrder()
        const payment = await makePayment(order.id)
        await payments.capturePayment({ payment_id: payment.id, amount: 129 })

        await payments.refundPayment({ payment_id: payment.id, amount: 40 })
        await run(paymentRefundedHandler, container, { id: payment.id })
        await run(paymentRefundedHandler, container, { id: payment.id })
        await new Promise((resolve) => setTimeout(resolve, 20))
        await payments.refundPayment({ payment_id: payment.id, amount: 10 })
        await run(paymentRefundedHandler, container, { id: payment.id })

        const refunds = (await sentFor(order.id)).filter((s) => s.template === "payment-refunded")
        expect(refunds).toHaveLength(2)
        expect(everyText.some((text) => text.includes("refunded CHF 40"))).toBe(true)
        expect(everyText.some((text) => text.includes("refunded CHF 10"))).toBe(true)
      })
    })

    describe("shipment and delivery", () => {
      it("sends the tracking, once, and the delivery after it", async () => {
        const container = getContainer()
        const order = await makeOrder()
        const fulfillment = await makeFulfillment(order.id)

        await run(shipmentCreatedHandler, container, { id: fulfillment.id })
        await run(shipmentCreatedHandler, container, { id: fulfillment.id })
        await run(deliveryCreatedHandler, container, { id: fulfillment.id })

        const sent = await sentFor(order.id)
        expect(sent.map((s) => s.template).sort()).toEqual(["order-delivered", "order-shipped"])
        const shipped = sent.find((s) => s.template === "order-shipped")!
        expect(shipped.text).toContain("99.12.345")
        expect(shipped.html).toContain('href="https://track.example.com/99.12.345"')
      })

      it("says nothing when the admin switched notification off", async () => {
        const container = getContainer()
        const order = await makeOrder()
        const fulfillment = await makeFulfillment(order.id)

        await run(shipmentCreatedHandler, container, { id: fulfillment.id, no_notification: true })
        await run(deliveryCreatedHandler, container, { id: fulfillment.id, no_notification: true })

        expect(await sentFor(order.id)).toEqual([])
      })
    })

    describe("cancellation", () => {
      it("is told once", async () => {
        const container = getContainer()
        const order = await makeOrder()

        await run(orderCanceledHandler, container, { id: order.id })
        await run(orderCanceledHandler, container, { id: order.id })

        expect((await sentFor(order.id)).map((s) => s.template)).toEqual(["order-canceled"])
      })

      it("does nothing for an order with no email address, and does not fail", async () => {
        const container = getContainer()
        const orders = container.resolve(Modules.ORDER)
        const order = await orders.createOrders({
          currency_code: "chf",
          items: [{ title: "Silk cowl halter gown", quantity: 1, unit_price: 129 }],
        })

        await expect(run(orderCanceledHandler, container, { id: order.id })).resolves.toBeUndefined()
        expect(await sentFor(order.id)).toEqual([])
      })
    })

    describe("measurement sheet confirmed", () => {
      it("stamps the order, tells the client once, and keeps the first date on a repeat", async () => {
        const container = getContainer()
        const orders = container.resolve(Modules.ORDER)
        const order = await makeOrder()

        const { result: first } = await confirmOrderSheetWorkflow(container).run({ input: { id: order.id } })
        await run(orderSheetConfirmedHandler, container, { id: order.id })
        const { result: second } = await confirmOrderSheetWorkflow(container).run({ input: { id: order.id } })
        await run(orderSheetConfirmedHandler, container, { id: order.id })

        expect(second.confirmed_at).toBe(first.confirmed_at)
        const stored = await orders.retrieveOrder(order.id, { select: ["id", "metadata"] })
        expect(stored.metadata?.sheet_confirmed_at).toBe(first.confirmed_at)
        const confirmed = (await sentFor(order.id)).filter((s) => s.template === "order-confirmed")
        expect(confirmed).toHaveLength(1)
        expect(confirmed[0].text).toContain("confirmed it")
      })

      it("refuses a cancelled order", async () => {
        const container = getContainer()
        const orders = container.resolve(Modules.ORDER)
        const order = await makeOrder()
        await orders.updateOrders(order.id, { status: "canceled" })

        await expect(
          confirmOrderSheetWorkflow(container).run({ input: { id: order.id } })
        ).rejects.toMatchObject({ message: expect.stringContaining("cancelled") })
      })

      it("is reachable only by someone signed in to the admin", async () => {
        const response = await api.post("/admin/orders/order_x/confirm-sheet", {}, { validateStatus: () => true })
        expect(response.status).toBe(401)
      })
    })
  },
})
