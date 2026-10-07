import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { createDefaultsWorkflow } from "@medusajs/medusa/core-flows"

jest.setTimeout(120 * 1000)

/* Changing a password while signed in, and closing an account — both behind
   a session, both confirmed again with the current password. */

medusaIntegrationTestRunner({
  inApp: true,
  env: {},
  testSuite: ({ api, getContainer }) => {
    let publishableKey: string

    beforeEach(async () => {
      const container = getContainer()
      const query = container.resolve(ContainerRegistrationKeys.QUERY)
      await createDefaultsWorkflow(container).run()
      const { data: [key] } = await query.graph({
        entity: "api_key",
        fields: ["token"],
        filters: { type: "publishable" },
      })
      publishableKey = key.token
    })

    const headers = () => ({ headers: { "x-publishable-api-key": publishableKey } })

    const authHeaders = (token: string) => ({
      headers: { "x-publishable-api-key": publishableKey, authorization: `Bearer ${token}` },
    })

    /** Registers a customer through the real two-step flow and returns a
        session token from a fresh login — the same path the storefront uses. */
    const openAccount = async (email: string, password: string) => {
      const { data: registered } = await api.post(
        "/auth/customer/emailpass/register",
        { email, password },
        headers()
      )
      await api.post(
        "/store/customers",
        { email, first_name: "Test" },
        authHeaders(registered.token)
      )
      const { data: session } = await api.post("/auth/customer/emailpass", { email, password }, headers())
      return session.token as string
    }

    describe("changing the password", () => {
      it("refuses a change without the current password", async () => {
        const token = await openAccount("change-1@example.com", "OldPassword1!")
        const response = await api
          .post("/store/customers/me/password", { current_password: "Wrong!", password: "NewPassword1!" }, authHeaders(token))
          .catch((e) => e.response)
        expect(response.status).toBe(401)
      })

      it("refuses a new password under eight characters", async () => {
        const token = await openAccount("change-2@example.com", "OldPassword1!")
        const response = await api
          .post("/store/customers/me/password", { current_password: "OldPassword1!", password: "short" }, authHeaders(token))
          .catch((e) => e.response)
        expect(response.status).toBe(400)
      })

      it("sets the new password, which then signs in", async () => {
        const email = "change-3@example.com"
        const token = await openAccount(email, "OldPassword1!")
        const response = await api.post(
          "/store/customers/me/password",
          { current_password: "OldPassword1!", password: "NewPassword1!" },
          authHeaders(token)
        )
        expect(response.status).toBe(200)

        const login = await api
          .post("/auth/customer/emailpass", { email, password: "NewPassword1!" }, headers())
          .catch((e) => e.response)
        expect(login.status).toBe(200)
      })
    })

    describe("closing the account", () => {
      it("refuses without the current password", async () => {
        const token = await openAccount("close-1@example.com", "OldPassword1!")
        const response = await api
          .post("/store/customers/me/account", { password: "Wrong!" }, authHeaders(token))
          .catch((e) => e.response)
        expect(response.status).toBe(401)
      })

      it("closes the account, which can no longer sign in", async () => {
        const email = "close-2@example.com"
        const token = await openAccount(email, "OldPassword1!")
        const response = await api.post(
          "/store/customers/me/account",
          { password: "OldPassword1!" },
          authHeaders(token)
        )
        expect(response.status).toBe(200)

        const login = await api
          .post("/auth/customer/emailpass", { email, password: "OldPassword1!" }, headers())
          .catch((e) => e.response)
        expect(login.status).toBe(401)
      })
    })
  },
})
