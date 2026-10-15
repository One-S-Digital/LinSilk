import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { createDefaultsWorkflow } from "@medusajs/medusa/core-flows"
import { createVerificationToken } from "../../src/lib/email-verification"
import { verificationSecret } from "../../src/lib/email-verification-state"

jest.setTimeout(120 * 1000)

/* A new account works, but what it holds waits for a confirmed email. */

medusaIntegrationTestRunner({
  inApp: true,
  env: {},
  testSuite: ({ api, getContainer }) => {
    let publishableKey: string

    beforeEach(async () => {
      const container = getContainer()
      const query = container.resolve(ContainerRegistrationKeys.QUERY)
      await createDefaultsWorkflow(container).run()
      const { data: [key] } = await query.graph({ entity: "api_key", fields: ["token"], filters: { type: "publishable" } })
      publishableKey = key.token
    })

    const headers = () => ({ headers: { "x-publishable-api-key": publishableKey } })
    const authHeaders = (token: string) => ({
      headers: { "x-publishable-api-key": publishableKey, authorization: `Bearer ${token}` },
    })

    const openAccount = async (email: string, password: string) => {
      const { data: registered } = await api.post("/auth/customer/emailpass/register", { email, password }, headers())
      const { data } = await api.post("/store/customers", { email, first_name: "Test" }, authHeaders(registered.token))
      const { data: session } = await api.post("/auth/customer/emailpass", { email, password }, headers())
      return { token: session.token as string, customerId: data.customer.id as string }
    }

    it("starts unverified, and refuses to change what the account holds", async () => {
      const { token } = await openAccount("verify-1@example.com", "Password1!")
      const status = await api.get("/store/customers/me/email-verification", authHeaders(token))
      expect(status.data.verified).toBe(false)

      const profile = await api
        .post("/store/customers/me", { first_name: "Ada" }, authHeaders(token))
        .catch((e) => e.response)
      expect(profile.status).toBe(403)
    })

    it("does not let a client mark themselves verified through metadata", async () => {
      const { token } = await openAccount("verify-2@example.com", "Password1!")
      await api.post("/store/customers/me", { metadata: { email_verified_at: "now" } }, authHeaders(token)).catch(() => null)
      const status = await api.get("/store/customers/me/email-verification", authHeaders(token))
      expect(status.data.verified).toBe(false)
    })

    it("verifies with the emailed link, then allows changes", async () => {
      const { token, customerId } = await openAccount("verify-3@example.com", "Password1!")
      const link = createVerificationToken(customerId, "verify-3@example.com", verificationSecret(getContainer()))

      await api.post("/store/email-verification", { token: link }, headers())

      const status = await api.get("/store/customers/me/email-verification", authHeaders(token))
      expect(status.data.verified).toBe(true)
      const profile = await api.post("/store/customers/me", { first_name: "Ada" }, authHeaders(token))
      expect(profile.status).toBe(200)
    })

    it("refuses a forged or expired link", async () => {
      const { customerId } = await openAccount("verify-4@example.com", "Password1!")
      const secret = verificationSecret(getContainer())
      const stale = createVerificationToken(customerId, "verify-4@example.com", secret, Date.now() - 2 * 86400000)
      for (const bad of ["garbage", stale, createVerificationToken(customerId, "verify-4@example.com", "wrong")]) {
        const response = await api.post("/store/email-verification", { token: bad }, headers()).catch((e) => e.response)
        expect(response.status).toBe(400)
      }
    })

  },
})
