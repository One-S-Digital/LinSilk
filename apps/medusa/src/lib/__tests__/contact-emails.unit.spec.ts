import { CONTACT_EMAIL, contactEmail, contactSchema } from "../contact-emails"

describe("contact form", () => {
  it("writes to the house, with the sender as reply-to", () => {
    const mail = contactEmail({ name: "Ada Lovelace", email: "ada@example.com", message: "Hello\nthere" }, CONTACT_EMAIL)
    expect(mail.to).toBe("hello@bylinsilk.com")
    expect(mail.provider_data).toEqual({ reply_to: "ada@example.com" })
    expect(mail.content.subject).toContain("Ada Lovelace")
    expect(mail.content.text).toContain("Hello")
    expect(mail.content.text).toContain("there")
  })

  it("keeps markup in a message from becoming markup in the mail", () => {
    const mail = contactEmail({ name: "x", email: "x@example.com", message: "<script>alert(1)</script>" }, CONTACT_EMAIL)
    expect(mail.content.html).not.toContain("<script>")
  })

  it("needs a name, a valid email and a message", () => {
    expect(contactSchema.safeParse({ name: "A", email: "a@b.ch", message: "hi" }).success).toBe(true)
    expect(contactSchema.safeParse({ name: "", email: "a@b.ch", message: "hi" }).success).toBe(false)
    expect(contactSchema.safeParse({ name: "A", email: "nope", message: "hi" }).success).toBe(false)
    expect(contactSchema.safeParse({ name: "A", email: "a@b.ch", message: "  " }).success).toBe(false)
  })

  it("cannot be used to inject mail headers, through the name or the address", () => {
    const parsed = contactSchema.parse({
      name: "Ada\r\nBcc: victim@example.com",
      email: "ada@example.com",
      message: "hi",
    })
    expect(parsed.name).toBe("Ada Bcc: victim@example.com")
    expect(contactEmail(parsed, CONTACT_EMAIL).content.subject).not.toMatch(/[\r\n]/)
    for (const email of ["a@b.ch\r\nBcc: v@x.com", "a@b.ch,v@x.com", "<a@b.ch>", "a b@c.ch"]) {
      expect(contactSchema.safeParse({ name: "A", email, message: "hi" }).success).toBe(false)
    }
  })

  it("drops control and direction-override characters, and keeps the message's own lines", () => {
    const parsed = contactSchema.parse({ name: "A", email: "a@b.ch", message: "one\u0000\u202e\r\ntwo" })
    expect(parsed.message).toBe("one\ntwo")
  })

  it("refuses unknown fields and over-long input", () => {
    expect(contactSchema.safeParse({ name: "A", email: "a@b.ch", message: "hi", to: "x@y.com" }).success).toBe(false)
    expect(contactSchema.safeParse({ name: "A", email: "a@b.ch", message: "x".repeat(5001) }).success).toBe(false)
  })
})
