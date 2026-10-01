import { definePolicies } from "@medusajs/framework/utils"

/* What the house's own admin routes need, alongside the permissions Medusa
   declares for its own. Each is granted to a role in the admin (Settings →
   Roles); the Super Admin role has all of them already.

   Commissions and cloth catalogues are split read from write because a
   commission holds a client's measurements and photographs: someone who
   prepares cloth need not see them. Opening a season is its own permission
   because it is the one catalogue act that changes what the public can buy. */
export const linsilkPolicies = definePolicies([
  {
    name: "ReadCatalogue",
    resource: "catalogue",
    operation: "read",
    description: "See seasons and pieces through the catalogue API",
  },
  {
    name: "UpdateCatalogue",
    resource: "catalogue",
    operation: "update",
    description: "Draft pieces, their photography and pending seasons",
  },
  {
    name: "OpenSeason",
    resource: "catalogue",
    operation: "open",
    description: "Open a season onto the site, archiving the one before it",
  },
  {
    name: "ReadCommission",
    resource: "commission",
    operation: "read",
    description: "See commissions, including the client's measurements and reference files",
  },
  {
    name: "UpdateCommission",
    resource: "commission",
    operation: "update",
    description: "Set a commission's status, quote and internal note, and send the quote",
  },
  {
    name: "ReadFabricCatalogue",
    resource: "fabric_catalogue",
    operation: "read",
    description: "See the cloth catalogues",
  },
  {
    name: "CreateFabricCatalogue",
    resource: "fabric_catalogue",
    operation: "create",
    description: "Upload a cloth catalogue",
  },
  {
    name: "UpdateFabricCatalogue",
    resource: "fabric_catalogue",
    operation: "update",
    description: "Edit a cloth catalogue's details",
  },
  {
    name: "DeleteFabricCatalogue",
    resource: "fabric_catalogue",
    operation: "delete",
    description: "Delete a cloth catalogue",
  },
])
