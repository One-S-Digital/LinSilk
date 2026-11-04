import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import { Modules } from "@medusajs/framework/utils"
import { POST } from "../../src/api/store/contact/route"

jest.setTimeout(120 * 1000)

/* The contact form's route, called as Medusa calls it, against the real
   notification module: a valid message is mailed to the house with the
   sender as reply-to; a bot's is answered but not mailed; bad input and
   floods are refused. */

medusaIntegrationTestRunner({
  inApp: true,
  env: {},
  testSuite: ({ getContainer }) => {
    const post = async (body: unknown, ip = "203.0.113.1") => {
      const sent: unknown[] = []
      const req = { body, ip, scope: getContainer() } as never
      const res = { json: (data: unknown) => sent.push(data) } as never
      const outcome = await POST(req, res).then(() => "ok", (e: Error) => e.message)
      return { outcome, sent }
    }
    const mails = () => getContainer().resolve(Modules.NOTIFICATION).listNotifications({ template: "contact-message" })

    it("mails a valid message to the house", async () => {
      const before = (await mails()).length
      const { outcome, sent } = await post({ name: "Ada", email: "ada@example.com", message: "A question" }, "198.51.100.1")
      expect(outcome).toBe("ok")
      expect(sent).toEqual([{ sent: true }])
      const after = await mails()
      expect(after).toHaveLength(before + 1)
      expect(after.at(-1)?.to).toBe("hello@bylinsilk.com")
    })

    it("answers a bot without mailing, and refuses bad input and floods", async () => {
      const before = (await mails()).length
      expect((await post({ name: "Bot", email: "b@example.com", message: "x", website: "http://spam" }, "198.51.100.2")).sent).toEqual([{ sent: true }])
      expect((await post({ name: "", email: "nope", message: "" }, "198.51.100.3")).outcome).toMatch(/valid email/)
      expect((await mails()).length).toBe(before)

      for (let i = 0; i < 5; i++) await post({ name: "F", email: `f${i}@example.com`, message: "x" }, "198.51.100.4")
      expect((await post({ name: "F", email: "f9@example.com", message: "x" }, "198.51.100.4")).outcome).toMatch(/Too many/)
    })
  },
})
