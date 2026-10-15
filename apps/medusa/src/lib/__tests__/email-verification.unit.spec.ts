import {
  createVerificationToken,
  readVerificationToken,
  VERIFICATION_TTL_MS,
} from "../email-verification"

const secret = "test-secret"

describe("verification token", () => {
  it("reads back the customer and the lowercased address it was made for", () => {
    const token = createVerificationToken("cus_1", "Ada@Example.com", secret, 1000)
    expect(readVerificationToken(token, secret, 2000)).toEqual({ customerId: "cus_1", email: "ada@example.com" })
  })

  it("is refused after a day", () => {
    const token = createVerificationToken("cus_1", "a@example.com", secret, 1000)
    expect(readVerificationToken(token, secret, 1000 + VERIFICATION_TTL_MS)).toBeNull()
  })

  it("is refused under another secret", () => {
    const token = createVerificationToken("cus_1", "a@example.com", secret, 1000)
    expect(readVerificationToken(token, "other", 2000)).toBeNull()
  })

  it("is refused when the body is altered", () => {
    const token = createVerificationToken("cus_1", "a@example.com", secret, 1000)
    const [, signature] = token.split(".")
    const forged = Buffer.from(JSON.stringify({ c: "cus_2", e: "a@example.com", x: 9e15 })).toString("base64url")
    expect(readVerificationToken(`${forged}.${signature}`, secret, 2000)).toBeNull()
  })

  it("is refused when mangled", () => {
    for (const bad of ["", "abc", "a.b.c", "."]) expect(readVerificationToken(bad, secret, 2000)).toBeNull()
  })
})
