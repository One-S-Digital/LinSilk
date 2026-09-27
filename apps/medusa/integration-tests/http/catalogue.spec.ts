import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import {
  createDefaultsWorkflow,
  createRegionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createUserAccountWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
} from "@medusajs/medusa/core-flows"

jest.setTimeout(180 * 1000)

/* How the catalogue is added to, and the two rules that cost money if they
   are wrong: nothing an agent writes is public until a person publishes it,
   and a season's status moves one way.
 *
 * The archive gate is one field. `current` is the whole of it — the cart
 * refuses a piece from anything else — so a rollover that left two seasons
 * marked `current` would leave an archived season quietly orderable. That
 * invariant is what most of this file is about.
 */

const ECB_FEED = `<?xml version="1.0" encoding="UTF-8"?>
<gesmes:Envelope xmlns:gesmes="http://www.gesmes.org/xml/2002-08-01">
  <Cube><Cube time='2026-09-11'>
    <Cube currency='GBP' rate='0.85915'/>
    <Cube currency='CHF' rate='0.9432'/>
  </Cube></Cube>
</gesmes:Envelope>`

const season = (handle: string, number: number, extra: Record<string, unknown> = {}) => ({
  handle,
  title: `Season — Collection ${number}`,
  season: "Season",
  number,
  note: "Sand silk twill.",
  ...extra,
})

const piece = (handle: string, collection: string, extra: Record<string, unknown> = {}) => ({
  handle,
  title: `Piece ${handle}`,
  material: "19mm charmeuse, hand-rolled hem",
  collection,
  group: "women",
  price_chf: 1980,
  length_kinds: ["dress"],
  ...extra,
})

medusaIntegrationTestRunner({
  inApp: true,
  env: {},
  testSuite: ({ api, getContainer }) => {
    let store: { headers: Record<string, string> }
    let admin: { headers: Record<string, string> }
    let realFetch: typeof fetch

    beforeAll(() => {
      realFetch = global.fetch
      global.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
        if (String(input).includes("ecb.europa.eu")) {
          return new Response(ECB_FEED, { status: 200 })
        }
        return realFetch(input, init)
      }) as typeof fetch
    })

    afterAll(() => {
      global.fetch = realFetch
    })

    beforeEach(async () => {
      const container = getContainer()
      const query = container.resolve(ContainerRegistrationKeys.QUERY)

      await createDefaultsWorkflow(container).run()
      const { data: [key] } = await query.graph({
        entity: "api_key",
        fields: ["token"],
        filters: { type: "publishable" },
      })
      store = { headers: { "x-publishable-api-key": key.token } }

      await createRegionsWorkflow(container).run({
        input: {
          regions: [
            {
              name: "Switzerland",
              currency_code: "chf",
              countries: ["ch"],
              payment_providers: ["pp_system_default"],
            },
          ],
        },
      })
      await createShippingProfilesWorkflow(container).run({
        input: { data: [{ name: "Default", type: "default" }] },
      })
      const { data: [defaults] } = await query.graph({
        entity: "store",
        fields: ["default_sales_channel_id"],
      })
      const { result: locations } = await createStockLocationsWorkflow(container).run({
        input: { locations: [{ name: "Atelier" }] },
      })
      await linkSalesChannelsToStockLocationWorkflow(container).run({
        input: { id: locations[0].id, add: [defaults.default_sales_channel_id!] },
      })

      /* The agent signs in as a person would; the routes are behind the
         admin's own auth and nothing here loosens that.

         Registering gives an auth identity but no user, and `POST /admin/users`
         needs an admin already — so the account is attached the same way the
         `medusa user` command does it, through the workflow. */
      const registered = await api.post("/auth/user/emailpass/register", {
        email: "agent@linsilk.test",
        password: "supersecret",
      })
      const [, claims] = registered.data.token.split(".")
      const { auth_identity_id } = JSON.parse(
        Buffer.from(claims, "base64").toString()
      ) as { auth_identity_id: string }

      await createUserAccountWorkflow(container).run({
        input: {
          authIdentityId: auth_identity_id,
          userData: { email: "agent@linsilk.test" },
        },
      })

      const signedIn = await api.post("/auth/user/emailpass", {
        email: "agent@linsilk.test",
        password: "supersecret",
      })
      admin = { headers: { authorization: `Bearer ${signedIn.data.token}` } }
    })

    const publish = async (handle: string) => {
      const { data } = await api.get(`/admin/products?handle=${handle}`, admin)
      return api.post(`/admin/products/${data.products[0].id}`, { status: "published" }, admin)
    }

    const seasons = async () => (await api.get("/admin/catalogue/seasons", admin)).data.seasons

    describe("a piece", () => {
      beforeEach(async () => {
        await api.post("/admin/catalogue/seasons", season("autumn-iv", 4), admin)
      })

      it("arrives as a draft, and the shop cannot see it", async () => {
        const created = await api.post("/admin/catalogue/pieces", piece("w1", "autumn-iv"), admin)
        expect(created.status).toBe(201)
        expect(created.data.piece.status).toBe("draft")

        const { data } = await api.get("/store/products?handle=w1", store)
        expect(data.products).toHaveLength(0)
      })

      it("is priced in francs, with the other currencies derived", async () => {
        await api.post("/admin/catalogue/pieces", piece("w1", "autumn-iv"), admin)
        const { data } = await api.get(
          "/admin/products?handle=w1&fields=*variants.prices",
          admin
        )
        const prices = data.products[0].variants[0].prices.map(
          (p: { currency_code: string; amount: number }) => [p.currency_code, p.amount]
        )
        expect(Object.fromEntries(prices)).toEqual({ chf: 1980, eur: 2100, gbp: 1800 })
      })

      it("can be sent again unchanged", async () => {
        await api.post("/admin/catalogue/pieces", piece("w1", "autumn-iv"), admin)
        const again = await api.post("/admin/catalogue/pieces", piece("w1", "autumn-iv"), admin)
        expect(again.status).toBe(200)
      })

      it("is refused a season that does not exist", async () => {
        const refused = await api
          .post("/admin/catalogue/pieces", piece("w1", "autumn-ix"), admin)
          .catch((e) => e.response)
        expect(refused.status).toBe(400)
        expect(refused.data.message).toContain("autumn-ix")
      })

      it("keeps its price once a person has published it", async () => {
        await api.post("/admin/catalogue/pieces", piece("w1", "autumn-iv"), admin)

        /* Still a draft: the route set the price, so it may correct it. */
        const corrected = await api.post(
          "/admin/catalogue/pieces",
          piece("w1", "autumn-iv", { price_chf: 1900 }),
          admin
        )
        expect(corrected.status).toBe(200)

        await publish("w1")

        const refused = await api
          .post("/admin/catalogue/pieces", piece("w1", "autumn-iv", { price_chf: 1500 }), admin)
          .catch((e) => e.response)
        expect(refused.status).toBe(400)
        expect(refused.data.message).toContain("published")

        /* The same figure is not a change, so a retry still works — and the
           wording is the agent's to correct either way. */
        const reworded = await api.post(
          "/admin/catalogue/pieces",
          piece("w1", "autumn-iv", { price_chf: 1900, title: "Piece w1, unlined" }),
          admin
        )
        expect(reworded.status).toBe(200)
      })
    })

    describe("a season", () => {
      it("is created pending, and the shop reads nothing into it", async () => {
        const created = await api.post("/admin/catalogue/seasons", season("autumn-iv", 4), admin)
        expect(created.status).toBe(201)
        expect(created.data.season.status).toBe("pending")
      })

      it("is not opened empty, nor on drafts alone", async () => {
        await api.post("/admin/catalogue/seasons", season("autumn-iv", 4), admin)

        const empty = await api
          .post("/admin/catalogue/seasons/autumn-iv/open", {}, admin)
          .catch((e) => e.response)
        expect(empty.status).toBe(400)
        expect(empty.data.message).toContain("no pieces")

        await api.post("/admin/catalogue/pieces", piece("w1", "autumn-iv"), admin)
        const drafts = await api
          .post("/admin/catalogue/seasons/autumn-iv/open", {}, admin)
          .catch((e) => e.response)
        expect(drafts.status).toBe(400)
        expect(drafts.data.message).toContain("none of them published")
      })

      it("opens onto the shop, and closes the one before it", async () => {
        await api.post("/admin/catalogue/seasons", season("autumn-iv", 4, { closes: "February" }), admin)
        await api.post("/admin/catalogue/pieces", piece("w1", "autumn-iv"), admin)
        await publish("w1")
        await api.post("/admin/catalogue/seasons/autumn-iv/open", {}, admin)

        await api.post("/admin/catalogue/seasons", season("winter-v", 5, { closes: "June" }), admin)
        await api.post("/admin/catalogue/pieces", piece("i1", "winter-v"), admin)
        await publish("i1")
        const opened = await api.post("/admin/catalogue/seasons/winter-v/open", {}, admin)

        expect(opened.data.season.status).toBe("current")
        expect(opened.data.archived).toEqual({ handle: "autumn-iv", status: "past" })

        const byHandle = Object.fromEntries(
          (await seasons()).map((s: { handle: string }) => [s.handle, s])
        )
        expect(byHandle["winter-v"].status).toBe("current")
        expect(byHandle["autumn-iv"].status).toBe("past")
        /* A season that has closed is not about to close: the closing date is
           retired, and the listing carries `closes` only when there is one. */
        expect(byHandle["autumn-iv"].closes).toBeUndefined()
        expect(byHandle["winter-v"].closes).toBe("June")
      })

      it("leaves exactly one season open, however many are rolled over", async () => {
        for (const [handle, number] of [["autumn-iv", 4], ["winter-v", 5], ["spring-vi", 6]] as const) {
          await api.post("/admin/catalogue/seasons", season(handle, number), admin)
          await api.post("/admin/catalogue/pieces", piece(`p${number}`, handle), admin)
          await publish(`p${number}`)
          await api.post(`/admin/catalogue/seasons/${handle}/open`, {}, admin)
        }

        const open = (await seasons()).filter(
          (s: { status: string }) => s.status === "current"
        )
        expect(open).toHaveLength(1)
        expect(open[0].handle).toBe("spring-vi")
      })

      it("is not opened twice, and not reopened once closed", async () => {
        await api.post("/admin/catalogue/seasons", season("autumn-iv", 4), admin)
        await api.post("/admin/catalogue/pieces", piece("w1", "autumn-iv"), admin)
        await publish("w1")
        await api.post("/admin/catalogue/seasons/autumn-iv/open", {}, admin)

        /* Asking again changes nothing, so a caller that lost its answer may
           simply ask again. */
        const again = await api.post("/admin/catalogue/seasons/autumn-iv/open", {}, admin)
        expect(again.data.season.status).toBe("current")
        expect(again.data.archived).toBeNull()

        await api.post("/admin/catalogue/seasons", season("winter-v", 5), admin)
        await api.post("/admin/catalogue/pieces", piece("i1", "winter-v"), admin)
        await publish("i1")
        await api.post("/admin/catalogue/seasons/winter-v/open", {}, admin)

        const reopened = await api
          .post("/admin/catalogue/seasons/autumn-iv/open", {}, admin)
          .catch((e) => e.response)
        expect(reopened.status).toBe(400)
        expect(reopened.data.message).toContain("archived")
      })

      it("can have its wording corrected without its status moving", async () => {
        await api.post("/admin/catalogue/seasons", season("autumn-iv", 4), admin)
        await api.post("/admin/catalogue/pieces", piece("w1", "autumn-iv"), admin)
        await publish("w1")
        await api.post("/admin/catalogue/seasons/autumn-iv/open", {}, admin)

        const corrected = await api.post(
          "/admin/catalogue/seasons",
          season("autumn-iv", 4, { note: "Sand silk twill and unpressed linen." }),
          admin
        )
        expect(corrected.data.season.status).toBe("current")
      })
    })
  },
})
