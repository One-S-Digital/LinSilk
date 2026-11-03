import {
  addressKey,
  creditAmount,
  creditCode,
  expiryFrom,
  firstOrderCreditEmail,
  hasEarlierOrder,
} from "../first-order-credit"

const here = { id: "o2", customer_id: "c1", email: "ada@example.com", shipping_address: { address_1: "Rue du Rhône 1", postal_code: "1204", country_code: "ch" } }

describe("first-order credit", () => {
  it("is 20% of the pieces, rounded down to the centime", () => {
    expect(creditAmount(1000)).toBe(200)
    expect(creditAmount(333.33)).toBe(66.66)
    expect(creditAmount(0)).toBe(0)
  })

  it("gives one code per order, the same each time, and not guessable from the id", () => {
    const code = creditCode("order_1", "s")
    expect(code).toMatch(/^LINSILK-[A-Z2-9]{5}-[A-Z2-9]{5}$/)
    expect(creditCode("order_1", "s")).toBe(code)
    expect(creditCode("order_2", "s")).not.toBe(code)
    expect(creditCode("order_1", "other")).not.toBe(code)
  })

  it("lapses after twelve months", () => {
    expect(expiryFrom(new Date("2026-11-03T00:00:00Z")).toISOString()).toBe("2027-11-03T00:00:00.000Z")
  })

  it("is not first when the account, email or address ordered before", () => {
    const other = { id: "o1", status: "pending", customer_id: null, email: null, shipping_address: null }
    expect(hasEarlierOrder(here, [])).toBe(false)
    expect(hasEarlierOrder(here, [{ ...other, customer_id: "c1" }])).toBe(true)
    expect(hasEarlierOrder(here, [{ ...other, email: " ADA@example.com" }])).toBe(true)
    expect(
      hasEarlierOrder(here, [{ ...other, shipping_address: { address_1: "rue du rhone 1", postal_code: "1204", country_code: "CH" } }])
    ).toBe(true)
  })

  it("ignores a cancelled earlier order, and the order itself", () => {
    expect(hasEarlierOrder(here, [{ id: "o1", status: "canceled", customer_id: "c1" }])).toBe(false)
    expect(hasEarlierOrder(here, [{ id: "o2", customer_id: "c1" }])).toBe(false)
  })

  it("does not match on an address that is incomplete", () => {
    expect(addressKey({ address_1: "x", postal_code: "", country_code: "ch" })).toBe("")
  })

  it("writes the client a mail with the code, the worth and the expiry", () => {
    const mail = firstOrderCreditEmail(
      { id: "o2", display_id: 7, email: "ada@example.com", currency_code: "chf", total: 500, items: [], shipping_address: { first_name: "Ada" } },
      { code: "LINSILK-AAAAA-BBBBB", amount: 200, expires: new Date("2027-11-03T00:00:00Z") }
    )
    expect(mail.to).toBe("ada@example.com")
    expect(mail.content.text).toContain("LINSILK-AAAAA-BBBBB")
    expect(mail.content.text).toContain("2027-11-03")
    expect(mail.content.text).toContain("20%")
  })
})
