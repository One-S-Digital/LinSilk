/* The atelier's stock location, and the fulfilment set that ships from it.
 *
 * Neither names a place beyond the one the house dispatches from, Geneva (the
 * shipping page says so). A database seeded before that holds the earlier
 * names, so everything that looks the location up matches by prefix, and
 * `settleAtelierLocation` brings an older one into line in place. In place
 * matters: the location's id carries its stock levels, its sales-channel link
 * and its shipping zones, so it is renamed and re-addressed, never replaced,
 * and never deleted (deleting a location's address deletes the location).
 */

import { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

export const ATELIER_LOCATION = "Atelier"
export const ATELIER_SHIPPING = "Atelier — shipping"

/** Matches the location and its shipping set under any name that begins
 *  "Atelier", which is every name they have carried. There is one of each. */
export const ATELIER_NAME_FILTER = { $like: "Atelier%" }

export const ATELIER_ADDRESS = { address_1: "", city: "Geneva", country_code: "CH" }

/** Renames the location and its shipping set, and replaces its address.
 *  Returns what it changed; nothing, when there was nothing to change. */
export async function settleAtelierLocation(container: MedusaContainer): Promise<string[]> {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const stock = container.resolve(Modules.STOCK_LOCATION)
  const fulfillment = container.resolve(Modules.FULFILLMENT)
  const changed: string[] = []

  const { data: locations } = await query.graph({
    entity: "stock_location",
    fields: ["id", "name", "address.id", "address.city", "address.country_code"],
    filters: { name: ATELIER_NAME_FILTER },
  })
  const location = locations.find((l) => l.name === ATELIER_LOCATION) ?? locations[0]

  if (location) {
    const before = location.address
    const placed = before?.city === ATELIER_ADDRESS.city && before?.country_code === ATELIER_ADDRESS.country_code
    if (location.name !== ATELIER_LOCATION || !placed) {
      /* Giving an address on update writes a new one and points the location
         at it; the old row is left behind. */
      await stock.updateStockLocations(location.id, {
        name: ATELIER_LOCATION,
        address: ATELIER_ADDRESS,
      })
      changed.push("stock location renamed and re-addressed")
    }

    /* The old address row is now unreferenced. Remove it, but only once
       nothing points at it. */
    if (before?.id && !placed) {
      const { data: stillUsing } = await query.graph({
        entity: "stock_location",
        fields: ["id"],
        filters: { address_id: before.id },
      })
      if (!stillUsing.length) {
        await stock.deleteStockLocationAddresses(before.id)
        changed.push("earlier address removed")
      }
    }
  }

  const { data: [set] } = await query.graph({
    entity: "fulfillment_set",
    fields: ["id", "name"],
    filters: { name: ATELIER_NAME_FILTER },
  })
  if (set && set.name !== ATELIER_SHIPPING) {
    await fulfillment.updateFulfillmentSets({ id: set.id, name: ATELIER_SHIPPING })
    changed.push("shipping set renamed")
  }

  return changed
}
