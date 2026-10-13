import { orderConfirmationEmail, orderPlacedEmail, type OrderRecord } from "../order-emails"

const shirt = {
  title: "Linen short-sleeve band-collar shirt",
  total: 129,
  commission: false,
  metadata: { fabric_name: "Burgundy linen", measure_neck_cm: "38", measure_lengthTop_cm: "74" },
}
const commissioned = { title: "Dress, for Ada", total: 2200, commission: true, metadata: null }

const order = (items: OrderRecord["items"], overrides: Partial<OrderRecord> = {}): OrderRecord => ({
  id: "order_01TEST",
  display_id: 12,
  email: "ada@example.com",
  currency_code: "chf",
  item_total: 129,
  discount_total: 0,
  payment_status: "captured",
  shipping_total: 0,
  total: 129,
  items,
  shipping_methods: [{ name: "Standard" }],
  shipping_address: {
    first_name: "Ada",
    last_name: "Lovelace",
    address_1: "Rue du Rhône 1",
    postal_code: "1204",
    city: "Geneva",
    country_code: "ch",
    phone: "+41 22 000 00 00",
  },
  ...overrides,
})

describe("orderConfirmationEmail", () => {
  it("goes to the client and says what happens to a seasonal piece", () => {
    const email = orderConfirmationEmail(order([shirt]))
    expect(email.to).toBe("ada@example.com")
    expect(email.content.subject).toBe("Your order no. 12 — LinSilk")
    expect(email.content.text).toContain("Dear Ada Lovelace,")
    expect(email.content.text).toContain("written back to confirm it")
    expect(email.content.text).toContain("Burgundy linen — CHF 129")
    expect(email.content.text).toContain("Neck")
    expect(email.content.text).toContain("Desired length")
    expect(email.content.text).toContain("1204 Geneva")
  })

  it("tells a commission's client that the bench has it, and prints no sheet", () => {
    const text = orderConfirmationEmail(order([commissioned], { total: 2200 })).content.text
    expect(text).toContain("The bench has your commission")
    expect(text).not.toContain("written back to confirm it")
  })

  it("shows a discount and the shipping that was chosen", () => {
    const text = orderConfirmationEmail(
      order([shirt], { item_total: 103.2, discount_total: 25.8, total: 103.2 })
    ).content.text
    expect(text).toContain("Pieces      CHF 129")
    expect(text).toContain("Discount    −CHF 25.8")
    expect(text).toContain("Shipping    included (Standard)")
  })
})

describe("a discount that also takes money off shipping", () => {
  it("counts only the discount on the pieces in the pieces figure", () => {
    const text = orderConfirmationEmail(
      order([shirt], {
        original_item_total: 129,
        item_total: 103.2,
        item_discount_total: 25.8,
        discount_total: 35.8,
        shipping_total: 0,
        total: 103.2,
      })
    ).content.text
    expect(text).toContain("Pieces      CHF 129")
    expect(text).toContain("Discount    −CHF 25.8")
    expect(text).not.toContain("35.8")
  })
})

describe("an order whose payment has not been captured", () => {
  const authorised = order([shirt], { payment_status: "authorized" })

  it("does not tell the client it is paid for", () => {
    const text = orderConfirmationEmail(authorised).content.text
    expect(text).not.toContain("is paid for")
    expect(text).toContain("once your payment is confirmed")
  })

  it("tells the atelier to check before starting", () => {
    const text = orderPlacedEmail(authorised, "hello@bylinsilk.com").content.text
    expect(text).not.toContain("has paid")
    expect(text).toContain("status: authorized")
    expect(text).toContain("Check it in the admin before starting")
  })
})

describe("orderPlacedEmail", () => {
  it("goes to the house with the sheet, and replies to the client", () => {
    const email = orderPlacedEmail(order([shirt]), "hello@bylinsilk.com")
    expect(email.to).toBe("hello@bylinsilk.com")
    expect(email.provider_data).toEqual({ reply_to: "ada@example.com" })
    expect(email.content.text).toContain("Neck")
    expect(email.content.text).toContain("38 cm")
    expect(email.content.text).toContain("orders / order_01TEST")
  })

  it("leaves a commission's lines to commission-paid", () => {
    const email = orderPlacedEmail(order([shirt, commissioned]), "hello@bylinsilk.com")
    expect(email.content.text).toContain(shirt.title)
    expect(email.content.text).not.toContain("Dress, for Ada")
  })

  it("says the figures cover the whole order when a commission is in it", () => {
    const mixed = orderPlacedEmail(order([shirt, commissioned]), "hello@bylinsilk.com")
    expect(mixed.content.text).toContain("whole order")
    expect(orderPlacedEmail(order([shirt]), "hello@bylinsilk.com").content.text).not.toContain("whole order")
  })
})
