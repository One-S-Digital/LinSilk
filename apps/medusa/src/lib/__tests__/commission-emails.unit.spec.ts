import {
  commissionPaymentUrl,
  commissionQuotedEmail,
  commissionReceivedEmail,
  commissionSubmittedEmail,
  type CommissionRecord,
} from "../commission-emails"

const brief: CommissionRecord = {
  id: "com_01TEST",
  name: "Ada Lovelace",
  email: "ada@example.com",
  silhouette_title: "Dress",
  fabric: "Oyster charmeuse, 19mm",
  note: "Bias cut, mid-calf.",
  measurements: { neck: 36, bust: 92, lengthDress: 112 },
  measurement_unit: "in",
  length_kinds: ["dress"],
  references: [{ filename: "sketch.png" }],
  estimate_amount: 2200,
  currency_code: "chf",
}

describe("commissionPaymentUrl", () => {
  const original = process.env.STOREFRONT_URL
  afterEach(() => {
    process.env.STOREFRONT_URL = original
  })

  it("hangs the token off the storefront", () => {
    process.env.STOREFRONT_URL = "https://maisonayla.ch"
    expect(commissionPaymentUrl("abc123")).toBe("https://maisonayla.ch/commission/abc123")
  })

  it("does not double the slash when the setting has a trailing one", () => {
    process.env.STOREFRONT_URL = "https://maisonayla.ch/"
    expect(commissionPaymentUrl("abc123")).toBe("https://maisonayla.ch/commission/abc123")
  })
})

describe("what the house is sent", () => {
  it("carries the brief, the sheet in the bench's words, and the client's own note", () => {
    const { to, content, provider_data } = commissionSubmittedEmail(brief, "hello@maisonayla.ch")
    expect(to).toBe("hello@maisonayla.ch")
    expect(provider_data.reply_to).toBe("ada@example.com")
    expect(content.subject).toBe("Commission — Dress, Ada Lovelace")
    expect(content.text).toContain("Oyster charmeuse, 19mm")
    expect(content.text).toContain("Bias cut, mid-calf.")
    /* Recorded in centimetres whatever the client was reading. */
    expect(content.text).toContain("Neck                 36 cm")
    expect(content.text).toContain("Dress length         112 cm")
    expect(content.text).toContain("the client was reading in")
    expect(content.text).toContain("sketch.png")
  })
})

describe("what the client is sent", () => {
  it("promises a person will read it, and no price", () => {
    const { content } = commissionReceivedEmail(brief)
    expect(content.text).toContain("A tailor reads every commission by hand")
    expect(content.text).not.toContain("2200")
  })

  it("gives the figure and a link that is theirs alone", () => {
    process.env.STOREFRONT_URL = "https://maisonayla.ch"
    const { content } = commissionQuotedEmail({
      ...brief,
      quote_amount: 2450,
      access_token: "tok_abc",
    })
    expect(content.subject).toBe("Your commission — CHF 2'450")
    expect(content.text).toContain("https://maisonayla.ch/commission/tok_abc")
    expect(content.text).toContain("do")
    expect(content.text).toContain("not forward it")
  })

  it("falls back to a reply when there is no link to give", () => {
    const { content } = commissionQuotedEmail({ ...brief, quote_amount: 2450 })
    expect(content.text).toContain("Reply to this email to accept.")
    expect(content.text).not.toContain("/commission/")
  })
})
