import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { createApiKeysWorkflow, createUserAccountWorkflow } from "@medusajs/medusa/core-flows"
import { readdirSync, readFileSync, statSync } from "fs"
import { dirname, join, relative } from "path"

jest.setTimeout(600 * 1000)

/* Who may reach what, once roles are on (medusa-config.ts, src/policies,
   src/api/middlewares.ts).

 * The catalogue agent's secret key is the credential that lives outside the
 * house — in a Claude config file on someone's machine — so most of this is
 * about what that key cannot do: read an order, a customer or a commission,
 * or mint itself a better key. People are checked the ordinary way: what
 * their role grants, and nothing without one.
 */

type Headers = { headers: Record<string, string> }

/* Every admin route Medusa ships, as [method, path] — read from its own
   route files, so a route added in an upgrade is audited without anyone
   remembering to list it. Path parameters get a placeholder: the permission
   check runs before the handler would look anything up. */
const coreAdminRoutes = () => {
  const root = join(dirname(require.resolve("@medusajs/medusa/package.json")), "dist/api/admin")
  const routes: [string, string][] = []
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry)
      if (statSync(full).isDirectory()) {
        walk(full)
      } else if (entry === "route.js") {
        const path =
          "/admin/" +
          relative(root, dir)
            .split("/")
            .map((segment) => segment.replace(/^\[.*\]$/, "placeholder"))
            .join("/")
        const source = readFileSync(full, "utf8")
        for (const method of ["GET", "POST", "DELETE"]) {
          if (source.includes(`exports.${method} = `)) {
            routes.push([method, path])
          }
        }
      }
    }
  }
  walk(root)
  return routes
}

/* What a signed-in person with no role still reaches among Medusa's own
   routes, each with the status it answers. Pinned exactly, so an upgrade
   that opens another route — or a feature flag that brings one of the 404s
   to life — fails here and has to be looked at.

   Nothing on it returns anyone else's data: */
const OPEN_WITHOUT_A_ROLE = [
  /* The dashboard reads these to start at all, for anyone signed in. */
  "GET /admin/feature-flags → 200",
  /* The index module is not installed; the route waits on it and never answers. */
  "GET /admin/index/details → timeout",
  "POST /admin/index/sync → timeout",
  /* Accepting an invite needs the invite's own token; an empty body is refused. */
  "POST /admin/invites/accept → 400",
  /* The caller's own dashboard layout, stored against their own user id. */
  "GET /admin/layouts/placeholder/configuration → 200",
  "POST /admin/layouts/placeholder/configuration → 400",
  "DELETE /admin/layouts/placeholder/configuration → 200",
  "GET /admin/layouts/configurations → 200",
  /* Behind the translation feature flag, which is off. */
  "GET /admin/locales → 404",
  "GET /admin/plugins → 200",
  /* Option names such as a piece's cut, which the storefront shows anyway. */
  "GET /admin/product-options → 200",
  /* Behind the view-configuration feature flag, which is off. */
  "GET /admin/property-labels/placeholder → 404",
  "POST /admin/property-labels/placeholder → 404",
  "DELETE /admin/property-labels/placeholder → 404",
  "POST /admin/property-labels/batch → 404",
  "GET /admin/property-labels → 404",
  "POST /admin/property-labels → 404",
  /* The caller's own permissions — what the dashboard shows or hides by. */
  "GET /admin/rbac/me/permissions → 200",
  /* Refused by validation first; a well-formed one is refused by permission
     (see "with no role is refused" below). */
  "POST /admin/rbac/roles → 400",
  /* The search module is not installed: no indexes to list or rebuild. */
  "POST /admin/search-indexes/placeholder/reindex → 404",
  "GET /admin/search-indexes → 200",
  "GET /admin/translations → 404",
  /* The caller's own account. */
  "GET /admin/users/me → 200",
  "GET /admin/views/placeholder/columns → 404",
  "GET /admin/views/placeholder/configurations/placeholder → 404",
  "POST /admin/views/placeholder/configurations/placeholder → 404",
  "DELETE /admin/views/placeholder/configurations/placeholder → 404",
  "GET /admin/views/placeholder/configurations/active → 404",
  "POST /admin/views/placeholder/configurations/active → 404",
  "GET /admin/views/placeholder/configurations → 404",
  "POST /admin/views/placeholder/configurations → 404",
  "GET /admin/views/entities → 404",
]

medusaIntegrationTestRunner({
  inApp: true,
  env: {},
  testSuite: ({ api, getContainer }) => {
    let owner: Headers
    let roleless: Headers
    let editor: Headers
    let agent: Headers

    const person = async (email: string, roles: string[]) => {
      const container = getContainer()
      const registered = await api.post("/auth/user/emailpass/register", {
        email,
        password: "supersecret",
      })
      const [, claims] = registered.data.token.split(".")
      const { auth_identity_id } = JSON.parse(Buffer.from(claims, "base64").toString())
      const { result: user } = await createUserAccountWorkflow(container).run({
        input: { authIdentityId: auth_identity_id, userData: { email } },
      })
      if (roles.length) {
        await container.resolve(ContainerRegistrationKeys.LINK).create(
          roles.map((role) => ({
            [Modules.USER]: { user_id: user.id },
            [Modules.RBAC]: { rbac_role_id: role },
          }))
        )
      }
      /* Roles are written into the token at sign-in, so sign in after. */
      const signedIn = await api.post("/auth/user/emailpass", { email, password: "supersecret" })
      return { headers: { authorization: `Bearer ${signedIn.data.token}` } }
    }

    beforeEach(async () => {
      const container = getContainer()
      const rbac = container.resolve(Modules.RBAC)

      owner = await person("owner@linsilk.test", ["role_super_admin"])
      roleless = await person("nobody@linsilk.test", [])

      /* A role granting reading the catalogue and nothing else. */
      const [role] = await rbac.createRbacRoles([{ name: "Catalogue reader" }])
      const [read] = await rbac.listRbacPolicies({ key: "catalogue:read" })
      await rbac.createRbacRolePolicies([{ role_id: role.id, policy_id: read.id }])
      editor = await person("reader@linsilk.test", [role.id])

      const { result: keys } = await createApiKeysWorkflow(container).run({
        input: { api_keys: [{ title: "Catalogue agent", type: "secret", created_by: "" }] },
      })
      const basic = Buffer.from(`${keys[0].token}:`).toString("base64")
      agent = { headers: { authorization: `Basic ${basic}` } }
    })

    const status = (method: string, path: string, who: Headers) =>
      api
        .request({
          method,
          url: path,
          data: method === "GET" ? undefined : {},
          /* A streaming route that let the caller in would hold the
             connection open; the timeout turns that into a failure here. */
          timeout: 10_000,
          ...who,
        })
        .then((r) => r.status)
        .catch((e) => e.response?.status ?? (e.code === "ECONNABORTED" ? "timeout" : 0))

    /* Every core admin route that did not answer 401 or 403. */
    const reachable = async (who: Headers) => {
      const open: string[] = []
      for (const [method, path] of coreAdminRoutes()) {
        const code = await status(method, path, who)
        if (code !== 401 && code !== 403) {
          open.push(`${method} ${path} → ${code}`)
        }
      }
      return open
    }

    describe("the catalogue agent's key", () => {
      it("reaches the catalogue", async () => {
        expect(await status("GET", "/admin/catalogue/seasons", agent)).toBe(200)
        expect(await status("GET", "/admin/catalogue/pieces", agent)).toBe(200)
      })

      it("reaches no client data, and cannot mint another key", async () => {
        for (const path of [
          "/admin/orders",
          "/admin/customers",
          "/admin/commissions",
          "/admin/users",
          "/admin/api-keys",
          "/admin/fabric-catalogues",
        ]) {
          expect([path, await status("GET", path, agent)]).toEqual([path, 403])
        }
        expect(await status("POST", "/admin/api-keys", agent)).toBe(403)
      })

      it("is refused on every admin route Medusa ships", async () => {
        expect(await reachable(agent)).toEqual([])
      })
    })

    describe("a person", () => {
      it("with no role reaches only what describes themselves, or nothing at all", async () => {
        expect(await reachable(roleless)).toEqual(OPEN_WITHOUT_A_ROLE)
      })

      it("with no role is refused the house's own routes", async () => {
        for (const path of [
          "/admin/catalogue/seasons",
          "/admin/commissions",
          "/admin/fabric-catalogues",
          "/admin/products",
        ]) {
          expect([path, await status("GET", path, roleless)]).toEqual([path, 403])
        }
      })

      it("with no role cannot search the house's clients or create a role", async () => {
        expect(await status("GET", "/admin/search?q=a", roleless)).toBe(403)
        const created = await api
          .post("/admin/rbac/roles", { name: "Self-appointed" }, roleless)
          .catch((e) => e.response)
        expect(created.status).toBe(403)
        expect(await status("GET", "/admin/search?q=a", owner)).toBe(200)
      })

      it("gets what their role grants, and no more", async () => {
        expect(await status("GET", "/admin/catalogue/seasons", editor)).toBe(200)
        expect(await status("POST", "/admin/catalogue/seasons", editor)).toBe(403)
        expect(await status("POST", "/admin/catalogue/seasons/autumn-iv/open", editor)).toBe(403)
        expect(await status("GET", "/admin/commissions", editor)).toBe(403)
      })

      it("as Super Admin reaches everything", async () => {
        for (const path of [
          "/admin/catalogue/seasons",
          "/admin/commissions",
          "/admin/fabric-catalogues",
          "/admin/orders",
          "/admin/api-keys",
        ]) {
          expect([path, await status("GET", path, owner)]).toEqual([path, 200])
        }
      })
    })
  },
})
