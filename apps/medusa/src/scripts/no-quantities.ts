/* Takes every product's quantity off: the house shows no stock.
 *
 *   pnpm --filter medusa exec medusa exec ./src/scripts/no-quantities.ts
 *
 * `start:render` runs this ahead of the server on every start, so a piece that
 * was cut or seeded with a run in the meantime is cleared again on the next
 * start.
 *
 *   1. Every variant stops managing inventory, so nothing is counted, nothing
 *      sells out and no cart is refused for want of stock.
 *   2. Every stock level (the quantity at the atelier) is deleted.
 *
 * A level holding a reservation for an order already placed is left alone and
 * reported: that quantity is owed to a client. The variant still stops
 * managing inventory, so the reservation no longer limits anything.
 *
 * Safe to run again: a database with no quantities reports nothing to do. */

import { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import {
  deleteInventoryLevelsWorkflow,
  updateProductVariantsWorkflow,
} from "@medusajs/medusa/core-flows"

export default async function noQuantities({ container }: { container: MedusaContainer }) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const { data: variants } = await query.graph({
    entity: "product_variant",
    fields: ["id", "manage_inventory"],
  })
  const managed = variants.filter((v) => v.manage_inventory)

  const { data: levels } = await query.graph({
    entity: "inventory_level",
    fields: ["id", "inventory_item_id", "reserved_quantity"],
  })
  const reserved = levels.filter((l) => Number(l.reserved_quantity) > 0)
  const deletable = levels.filter((l) => !(Number(l.reserved_quantity) > 0))

  if (managed.length) {
    await updateProductVariantsWorkflow(container).run({
      input: {
        product_variants: managed.map((v) => ({ id: v.id, manage_inventory: false })),
      },
    })
  }
  if (deletable.length) {
    await deleteInventoryLevelsWorkflow(container).run({
      input: { id: deletable.map((l) => l.id), force: true },
    })
  }
  for (const level of reserved) {
    logger.warn(
      `Inventory level ${level.id} (item ${level.inventory_item_id}) holds a reservation for an order and was kept.`
    )
  }

  logger.info(
    `${managed.length} variant(s) no longer manage inventory, ${deletable.length} stock level(s) removed` +
      (reserved.length ? `, ${reserved.length} kept for reservations.` : ".")
  )
}
