import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import { createUserAccountWorkflow } from "@medusajs/medusa/core-flows"

jest.setTimeout(120 * 1000)

/* A signed-in person changing their own password, from the profile page
   (src/admin/widgets/change-password.tsx → src/api/admin/account/password). */

medusaIntegrationTestRunner({
  inApp: true,
  env: {},
  testSuite: ({ api, getContainer }) => {
    const email = "staff@linsilk.test"
    const original = "a-long-original-password"
    let headers: { authorization: string }

    const signIn = async (password: string) =>
      api.post("/auth/user/emailpass", { email, password }).then(
        (r) => ({ ok: true, token: r.data.token as string }),
        () => ({ ok: false, token: "" })
      )

    beforeEach(async () => {
      const registered = await api.post("/auth/user/emailpass/register", {
        email,
        password: original,
      })
      const [, claims] = registered.data.token.split(".")
      const { auth_identity_id } = JSON.parse(Buffer.from(claims, "base64").toString())
      await createUserAccountWorkflow(getContainer()).run({
        input: { authIdentityId: auth_identity_id, userData: { email } },
      })
      headers = { authorization: `Bearer ${(await signIn(original)).token}` }
    })

    const change = (body: Record<string, unknown>) =>
      api.post("/admin/account/password", body, { headers }).catch((e) => e.response)

    it("sets the new password and retires the old one", async () => {
      const changed = await change({
        current_password: original,
        new_password: "a-different-long-password",
      })
      expect(changed.status).toBe(200)
      expect((await signIn("a-different-long-password")).ok).toBe(true)
      expect((await signIn(original)).ok).toBe(false)
    })

    it("refuses a wrong current password and changes nothing", async () => {
      const refused = await change({
        current_password: "not-the-password",
        new_password: "a-different-long-password",
      })
      expect(refused.status).toBeGreaterThanOrEqual(400)
      expect((await signIn(original)).ok).toBe(true)
    })

    it("refuses a short or unchanged password", async () => {
      expect((await change({ current_password: original, new_password: "short" })).status).toBe(400)
      expect((await change({ current_password: original, new_password: original })).status).toBe(400)
      expect((await signIn(original)).ok).toBe(true)
    })

    it("pauses the account after five wrong passwords, even for the right one", async () => {
      for (let i = 0; i < 5; i++) {
        await change({ current_password: "wrong-wrong-wrong", new_password: "a-different-long-password" })
      }
      const paused = await change({
        current_password: original,
        new_password: "a-different-long-password",
      })
      expect(paused.status).toBe(429)
      expect((await signIn(original)).ok).toBe(true)
    })

    it("needs someone signed in", async () => {
      const anonymous = await api
        .post("/admin/account/password", { current_password: original, new_password: "x".repeat(14) })
        .catch((e) => e.response)
      expect(anonymous.status).toBe(401)
    })
  },
})
