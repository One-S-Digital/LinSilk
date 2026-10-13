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
})
