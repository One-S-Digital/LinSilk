import { passwordResetEmail, passwordResetUrl } from "../account-emails"

describe("passwordResetUrl", () => {
  const original = process.env.STOREFRONT_URL
  afterEach(() => {
    process.env.STOREFRONT_URL = original
  })

  it("carries the token and email off the storefront", () => {
    process.env.STOREFRONT_URL = "https://maisonayla.ch"
    expect(passwordResetUrl("ada@example.com", "abc123")).toBe(
      "https://maisonayla.ch/account/reset-password?token=abc123&email=ada%40example.com"
    )
  })

  it("does not double the slash when the setting has a trailing one", () => {
    process.env.STOREFRONT_URL = "https://maisonayla.ch/"
    expect(passwordResetUrl("ada@example.com", "abc123")).toBe(
      "https://maisonayla.ch/account/reset-password?token=abc123&email=ada%40example.com"
    )
  })
})

describe("passwordResetEmail", () => {
  it("addresses the client and carries the reset link", () => {
    process.env.STOREFRONT_URL = "https://maisonayla.ch"
    const email = passwordResetEmail("ada@example.com", "abc123")
    expect(email.to).toBe("ada@example.com")
    expect(email.template).toBe("password-reset")
    expect(email.content.text).toContain(
      "https://maisonayla.ch/account/reset-password?token=abc123&email=ada%40example.com"
    )
    expect(email.content.text).toContain("fifteen minutes")
  })
})
