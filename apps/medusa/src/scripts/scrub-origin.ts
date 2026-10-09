/* Brings what is already in the database into line with the house no longer
 * naming a country or a place of origin:
 *
 *   pnpm --filter medusa exec medusa exec ./src/scripts/scrub-origin.ts
 *
 *   - clears the country of origin from every product that carries one
 *     (pieces, commission products and silhouettes);
 *   - renames the atelier's stock location and its shipping set, and replaces
 *     the location's address (see lib/atelier-location.ts).
 *
 * New products are created without a country, and the seed and the commission
 * workflow already ask for the location by either name, so this can run before
 * or after a deploy. Safe to run again: it only changes what still needs it.
 */

import { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { settleAtelierLocation } from "../lib/atelier-location"

export default async function run({ container }: { container: MedusaContainer }) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const products = container.resolve(Modules.PRODUCT)

  const { data } = await query.graph({
    entity: "product",
    fields: ["id", "origin_country"],
  })
  const carrying = data.filter((p) => p.origin_country)
  for (const p of carrying) {
    await products.updateProducts(p.id, { origin_country: null })
  }
  console.log(`Cleared the country of origin on ${carrying.length} of ${data.length} products.`)

  const changed = await settleAtelierLocation(container)
  console.log(changed.length ? `The atelier: ${changed.join("; ")}.` : "The atelier needed no change.")
}
