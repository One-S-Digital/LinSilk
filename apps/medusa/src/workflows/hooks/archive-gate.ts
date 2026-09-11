import { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import {
  addToCartWorkflow,
  completeCartWorkflow,
  createCartWorkflow,
} from "@medusajs/medusa/core-flows"
import { archiveRefusal, type GatedVariant } from "../../lib/archive"

/* Nothing from a past collection can be bought. The storefront shows an
   archived piece as a record with no form, but the storefront is not a
   security boundary, so the cart refuses it too — when a cart is created
   with items, when a piece is added, and again at checkout, in case the
   season closed while the piece sat in a cart. */
async function refuseClosedPieces(
  variantIds: (string | null | undefined)[],
  container: MedusaContainer
) {
  const ids = [...new Set(variantIds.filter((id): id is string => Boolean(id)))]
  if (!ids.length) {
    return
  }

  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "variant",
    fields: ["id", "product.title", "product.collection.title", "product.collection.metadata"],
    filters: { id: ids },
  })

  const refusal = archiveRefusal(data as GatedVariant[])
  if (refusal) {
    throw new MedusaError(MedusaError.Types.NOT_ALLOWED, refusal)
  }
}

createCartWorkflow.hooks.validate(async ({ input }, { container }) => {
  await refuseClosedPieces((input.items ?? []).map((item) => item.variant_id), container)
})

addToCartWorkflow.hooks.validate(async ({ input }, { container }) => {
  await refuseClosedPieces(input.items.map((item) => item.variant_id), container)
})

completeCartWorkflow.hooks.validate(async ({ cart }, { container }) => {
  await refuseClosedPieces((cart.items ?? []).map((item) => item?.variant_id), container)
})
