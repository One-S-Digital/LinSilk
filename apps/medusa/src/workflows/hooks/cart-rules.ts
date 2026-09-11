import { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import {
  addToCartWorkflow,
  completeCartWorkflow,
  createCartWorkflow,
  updateLineItemInCartWorkflow,
} from "@medusajs/medusa/core-flows"
import type { GatedVariant } from "../../lib/archive"
import { cartRefusal } from "../../lib/cart-rules"

/* The storefront only offers what the atelier can make — an open piece, one
   at a time, with a complete sheet — but the storefront is not a security
   boundary, so the cart enforces the same rules (lib/cart-rules.ts).

   Medusa allows one handler per hook, so every rule runs from here: when a
   cart is created with items, when a piece is added, when a line is changed,
   and again at checkout — which also catches a season that closed while the
   piece sat in a cart.

   Medusa merges two lines with the same variant and identical metadata into
   one line of quantity two, which checkout then refuses. Two of the same
   piece on the same sheet are two garments, so the storefront must send a
   unique `line_id` in each line's metadata to keep them apart. */

type IncomingLine = {
  variant_id?: string | null
  /* Medusa types quantities as BigNumberInput: a number, a numeric string,
     or a BigNumber carrying `.numeric`. */
  quantity?: unknown
  metadata?: Record<string, unknown> | null
}

const toNumber = (quantity: unknown) =>
  typeof quantity === "object" && quantity !== null && "numeric" in quantity
    ? Number((quantity as { numeric: unknown }).numeric)
    : Number(quantity)

async function refuseWhatCannotBeMade(lines: IncomingLine[], container: MedusaContainer) {
  const ids = [...new Set(lines.map((l) => l.variant_id).filter((id): id is string => Boolean(id)))]
  if (!ids.length) {
    return
  }

  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "variant",
    fields: [
      "id",
      "product.title",
      "product.metadata",
      "product.collection.title",
      "product.collection.metadata",
    ],
    filters: { id: ids },
  })
  const variants = new Map((data as GatedVariant[]).map((v) => [v.id, v]))

  const refusal = cartRefusal(
    lines.map((line) => ({
      quantity: toNumber(line.quantity),
      metadata: line.metadata,
      variant: line.variant_id ? variants.get(line.variant_id) : undefined,
    }))
  )
  if (refusal) {
    throw new MedusaError(MedusaError.Types.NOT_ALLOWED, refusal)
  }
}

createCartWorkflow.hooks.validate(async ({ input }, { container }) => {
  await refuseWhatCannotBeMade(input.items ?? [], container)
})

addToCartWorkflow.hooks.validate(async ({ input }, { container }) => {
  await refuseWhatCannotBeMade(input.items, container)
})

updateLineItemInCartWorkflow.hooks.validate(async ({ input, cart }, { container }) => {
  /* A quantity of zero is how Medusa removes a line; let it through. */
  if (toNumber(input.update.quantity) === 0) {
    return
  }
  const item = cart.items?.find((i) => i?.id === input.item_id)
  if (!item) {
    return
  }
  await refuseWhatCannotBeMade(
    [
      {
        variant_id: item.variant_id,
        quantity: input.update.quantity ?? item.quantity,
        metadata: input.update.metadata ?? item.metadata,
      },
    ],
    container
  )
})

completeCartWorkflow.hooks.validate(async ({ cart }, { container }) => {
  await refuseWhatCannotBeMade(
    (cart.items ?? []).flatMap((item) =>
      item ? [{ variant_id: item.variant_id, quantity: item.quantity, metadata: item.metadata }] : []
    ),
    container
  )
})
