import { hasPermission } from "@medusajs/framework"
import {
  authenticate,
  defineMiddlewares,
  type AuthenticatedMedusaRequest,
  type MedusaNextFunction,
  type MedusaRequest,
  type MedusaResponse,
  type MiddlewareRoute,
} from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import multer from "multer"
import { isSessionVerified } from "../lib/email-verification-state"

/* Reference images for a commission, and the cloth catalogues the house
   publishes, arrive as multipart. Files are held in memory and handed to the
   file module, which decides where they actually live.

   Because they are held in memory, the limit is set here as well as in the
   routes: a route can only weigh a file once multer has already read all of
   it, which is too late to be a limit. The figures match the ones the routes
   refuse on, so the wording a client sees is still the house's own. */
const commissionReferences = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024, files: 10 },
})

const fabricCatalogue = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024, files: 1 },
})

type Action = { resource: string; operation: string }

const forbidden = (message: string) => new MedusaError(MedusaError.Types.FORBIDDEN, message)

/* Secret API keys reach the catalogue and nothing else. The only key the
   house makes is the catalogue agent's, and it is the credential that lives
   outside — in a Claude config on someone's machine.

   Roles alone would not hold it: Medusa gives keys no roles, so every route
   that declares a permission refuses one, but 2.20 ships some admin routes
   that declare none — among them /admin/search, which returns customers' and
   orders' names and emails. So this is a wall of its own, independent of how
   well Medusa covers its routes, and roles.spec.ts walks every admin route to
   prove it. A Basic authorization header is how a secret key is sent, so it
   counts even before Medusa has read it. */
const keysOnlyReachTheCatalogue = (
  req: MedusaRequest,
  _res: MedusaResponse,
  next: MedusaNextFunction
) => {
  const isKey =
    (req as AuthenticatedMedusaRequest).auth_context?.actor_type === "api-key" ||
    /^basic\s/i.test(req.headers.authorization ?? "")
  const path = req.originalUrl.split("?")[0]
  if (isKey && !path.startsWith("/admin/catalogue/")) {
    return next(forbidden("A secret API key reaches the catalogue and nothing else."))
  }
  next()
}

/* The catalogue's own check. A person needs the permission from their role;
   a secret key passes, having got this far only on a catalogue path. The
   explicit empty-roles refusal matters — hasPermission answers true when it
   is given no roles to check. */
const catalogue =
  (action: Action) =>
  async (req: MedusaRequest, _res: MedusaResponse, next: MedusaNextFunction) => {
    const auth = (req as AuthenticatedMedusaRequest).auth_context
    if (auth?.actor_type === "api-key") {
      return next()
    }
    const roles = (auth?.app_metadata?.roles as string[] | undefined) ?? []
    if (roles.length && (await hasPermission({ roles, actions: action, container: req.scope }))) {
      return next()
    }
    const required = `${action.resource}:${action.operation}`
    next(forbidden(`Insufficient permissions. Required policies: ${required}`))
  }

/* What a client keeps on their account — name, phone, saved sheet, addresses —
   waits for a confirmed email. Browsing, ordering and the password stay open.
   The session is checked here, ahead of Medusa's own check, so this wall does
   not depend on which of the two runs first. */
const verifiedEmailOnly = async (req: MedusaRequest, _res: MedusaResponse, next: MedusaNextFunction) => {
  const identity = (req as AuthenticatedMedusaRequest).auth_context?.auth_identity_id
  if (await isSessionVerified(req.scope, identity)) return next()
  next(forbidden("Confirm your email to change what your account holds. A link was sent when you registered."))
}

const requireVerifiedCustomer = [authenticate("customer", ["session", "bearer"]), verifiedEmailOnly]

/* Typed as Medusa's own route shape: `policies` is what its core routes use,
   read by the same loader, but defineMiddlewares' input type leaves it out. */
const routes: MiddlewareRoute[] = [
  { matcher: "/admin/*", middlewares: [keysOnlyReachTheCatalogue] },

  /* Two of Medusa's own routes that 2.20 leaves without a permission, so
     that anyone signed in — whatever their role, or with none — could use
     them. Search returns customers', orders' and users' names and emails and
     promotion codes, so it needs read access to all of those. Creating a
     role needs the permission to create one. */
  {
    matcher: "/admin/search",
    method: "GET",
    policies: [
      { resource: "order", operation: "read" },
      { resource: "customer", operation: "read" },
      { resource: "user", operation: "read" },
      { resource: "promotion", operation: "read" },
    ],
  },
  {
    matcher: "/admin/rbac/roles",
    method: "POST",
    policies: [{ resource: "rbac_role", operation: "create" }],
  },

  { matcher: "/store/customers/me", method: "POST", middlewares: requireVerifiedCustomer },
  { matcher: "/store/customers/me/addresses", method: "POST", middlewares: requireVerifiedCustomer },
  { matcher: "/store/customers/me/addresses/:id", method: ["POST", "DELETE"], middlewares: requireVerifiedCustomer },

  {
    matcher: "/store/commissions",
    method: "POST",
    middlewares: [commissionReferences.array("references", 10)],
  },

  /* The catalogue — the agent's key, or a person with the permission. */
  {
    matcher: "/admin/catalogue/seasons",
    method: "GET",
    middlewares: [catalogue({ resource: "catalogue", operation: "read" })],
  },
  {
    matcher: "/admin/catalogue/seasons",
    method: "POST",
    middlewares: [catalogue({ resource: "catalogue", operation: "update" })],
  },
  {
    matcher: "/admin/catalogue/seasons/:handle/open",
    method: "POST",
    middlewares: [catalogue({ resource: "catalogue", operation: "open" })],
  },
  {
    matcher: "/admin/catalogue/pieces",
    method: "GET",
    middlewares: [catalogue({ resource: "catalogue", operation: "read" })],
  },
  {
    matcher: "/admin/catalogue/pieces",
    method: "POST",
    middlewares: [catalogue({ resource: "catalogue", operation: "update" })],
  },

  /* Confirming a client's measurement sheet changes the order, and tells the
     client so. */
  {
    matcher: "/admin/orders/:id/confirm-sheet",
    method: "POST",
    policies: [{ resource: "order", operation: "update" }],
  },

  /* Commissions — a person with the permission, never a key. */
  {
    matcher: "/admin/commissions",
    method: "GET",
    policies: [{ resource: "commission", operation: "read" }],
  },
  {
    matcher: "/admin/commissions/:id",
    method: "GET",
    policies: [{ resource: "commission", operation: "read" }],
  },
  {
    matcher: "/admin/commissions/:id",
    method: "POST",
    policies: [{ resource: "commission", operation: "update" }],
  },

  /* Cloth catalogues. The permission is checked before multer reads the
     upload, so a refused caller never gets 50 MB into memory. */
  {
    matcher: "/admin/fabric-catalogues",
    method: "GET",
    policies: [{ resource: "fabric_catalogue", operation: "read" }],
  },
  {
    matcher: "/admin/fabric-catalogues",
    method: "POST",
    middlewares: [fabricCatalogue.single("file")],
    policies: [{ resource: "fabric_catalogue", operation: "create" }],
  },
  {
    matcher: "/admin/fabric-catalogues/:id",
    method: "POST",
    policies: [{ resource: "fabric_catalogue", operation: "update" }],
  },
  {
    matcher: "/admin/fabric-catalogues/:id",
    method: "DELETE",
    policies: [{ resource: "fabric_catalogue", operation: "delete" }],
  },
]

export default defineMiddlewares({ routes })
