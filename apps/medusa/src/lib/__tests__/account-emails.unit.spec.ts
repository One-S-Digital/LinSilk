import { passwordResetEmail, passwordResetUrl } from "../account-emails"

describe("passwordResetUrl", () => {
  const original = process.env.STOREFRONT_URL
  afterEach(() => {
    process.env.STOREFRONT_URL = original
  })

  it("carries the token and email off the storefront", () => {
    process.env.STOREFRONT_URL = "https://linsilk.ch"
    expect(passwordResetUrl("ada@example.com", "abc123")).toBe(
      "https://linsilk.ch/account/reset-password?token=abc123&email=ada%40example.com"
    )
  })

  it("does not double the slash when the setting has a trailing one", () => {
    process.env.STOREFRONT_URL = "https://linsilk.ch/"
    expect(passwordResetUrl("ada@example.com", "abc123")).toBe(
      "https://linsilk.ch/account/reset-password?token=abc123&email=ada%40example.com"
    )
  })
})

describe("passwordResetUrl for staff", () => {
  const original = process.env.ADMIN_URL
  afterEach(() => {
    process.env.ADMIN_URL = original
  })

  it("leads to the admin's own reset page, not the storefront", () => {
    process.env.ADMIN_URL = "https://api.bylinsilk.com/app/"
    expect(passwordResetUrl("staff@bylinsilk.com", "abc123", "user")).toBe(
      "https://api.bylinsilk.com/app/reset-password?token=abc123&email=staff%40bylinsilk.com"
    )
  })

  it("sends a staff email under its own template and subject", () => {
    process.env.ADMIN_URL = "https://api.bylinsilk.com/app"
    const email = passwordResetEmail("staff@bylinsilk.com", "abc123", "user")
    expect(email.template).toBe("admin-password-reset")
    expect(email.content.subject).toBe("Reset your admin password — LinSilk")
    expect(email.content.text).toContain("https://api.bylinsilk.com/app/reset-password?token=abc123")
  })
})

describe("passwordResetEmail", () => {
  it("addresses the client and carries the reset link", () => {
    process.env.STOREFRONT_URL = "https://linsilk.ch"
    const email = passwordResetEmail("ada@example.com", "abc123")
    expect(email.to).toBe("ada@example.com")
    expect(email.template).toBe("password-reset")
    expect(email.content.text).toContain(
      "https://linsilk.ch/account/reset-password?token=abc123&email=ada%40example.com"
    )
    expect(email.content.text).toContain("fifteen minutes")
  })
})
