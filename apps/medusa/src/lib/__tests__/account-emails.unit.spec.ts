import { emailVerificationEmail, passwordResetEmail, passwordResetUrl } from "../account-emails"

describe("emailVerificationEmail", () => {
  it("offers the link as a button, and in the plain text for mail apps without HTML", () => {
    process.env.STOREFRONT_URL = "https://linsilk.ch"
    const email = emailVerificationEmail("ada@example.com", "tok en")
    const link = "https://linsilk.ch/account/verify-email?token=tok%20en"
    expect(email.to).toBe("ada@example.com")
    expect(email.template).toBe("email-verification")
    expect(email.content.subject).toBe("Confirm your email — LINSILK")
    expect(email.content.html).toContain(`<a href="${link}"`)
    expect(email.content.html).toContain(">Confirm my email</a>")
    expect(email.content.text).toContain(link)
    expect(email.content.text).toContain("If you did not open an account")
  })
})

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
    expect(email.content.subject).toBe("Reset your admin password — LINSILK")
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

  it("offers the reset as a button", () => {
    process.env.STOREFRONT_URL = "https://linsilk.ch"
    const { html } = passwordResetEmail("ada@example.com", "abc123").content
    expect(html).toContain(
      '<a href="https://linsilk.ch/account/reset-password?token=abc123&amp;email=ada%40example.com"'
    )
    expect(html).toContain(">Reset my password</a>")
  })
})
