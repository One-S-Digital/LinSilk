import {
  orderCanceledEmail,
  orderConfirmedEmail,
  orderDeliveredEmail,
  orderShippedEmail,
  paymentReceivedEmail,
  paymentRefundedEmail,
  type OrderNotice,
} from "../order-updates"

const order: OrderNotice = {
  id: "order_01TEST",
  display_id: 12,
  email: "ada@example.com",
  currency_code: "chf",
  total: 129,
  items: [{ title: "Silk cowl halter gown" }],
  shipping_address: { first_name: "Ada", last_name: "Lovelace" },
}

describe("order update emails", () => {
  it("all go to the client, as email, with a plain and an HTML body", () => {
    const mails = [
      paymentReceivedEmail(order, 129),
      orderConfirmedEmail(order),
      orderShippedEmail(order),
      orderDeliveredEmail(order),
      orderCanceledEmail(order),
      paymentRefundedEmail(order, 129),
    ]
    for (const mail of mails) {
      expect(mail.to).toBe("ada@example.com")
      expect(mail.channel).toBe("email")
      expect(mail.content.subject).toContain("no. 12")
      expect(mail.content.text).toContain("Dear Ada Lovelace,")
      expect(mail.content.text).toContain("Silk cowl halter gown")
      expect(mail.content.html).toContain("Silk cowl halter gown")
    }
  })

  it("has a distinct template name for each, so a log says which was sent", () => {
    const templates = [
      paymentReceivedEmail(order, 1),
      orderConfirmedEmail(order),
      orderShippedEmail(order),
      orderDeliveredEmail(order),
      orderCanceledEmail(order),
      paymentRefundedEmail(order, 1),
    ].map((mail) => mail.template)
    expect(new Set(templates).size).toBe(6)
  })

  it("states the amount of the payment it is about, not the order's total", () => {
    const text = paymentReceivedEmail({ ...order, total: 500 }, 129).content.text
    expect(text).toContain("CHF 129")
    expect(text).not.toContain("CHF 500")
    expect(paymentRefundedEmail(order, 40).content.text).toContain("refunded CHF 40")
  })

  it("greets a client with no name plainly", () => {
    const mail = orderShippedEmail({ ...order, shipping_address: null })
    expect(mail.content.text.startsWith("Hello,")).toBe(true)
  })

  it("gives the tracking number and link when there are some, and neither when there are none", () => {
    const tracked = orderShippedEmail(order, {
      tracking_number: "99.12.345",
      tracking_url: "https://track.example.com/99.12.345",
    })
    expect(tracked.content.text).toContain("99.12.345")
    expect(tracked.content.text).toContain("https://track.example.com/99.12.345")
    expect(tracked.content.html).toContain('href="https://track.example.com/99.12.345"')

    const bare = orderShippedEmail(order)
    expect(bare.content.text).not.toContain("Tracking")
    expect(bare.content.html).not.toContain("<a ")
  })

  it("promises the client what the confirmation promised: a pattern before any cutting", () => {
    expect(orderConfirmedEmail(order).content.text).toContain("two to four weeks from today")
  })
})
