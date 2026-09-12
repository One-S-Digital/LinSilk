import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { SILHOUETTE_COLLECTION } from "../../../lib/commission-catalogue"

/* The shapes the house will cut to order, with the opening figure the client
   sees before a tailor has read the brief. They are products, so the house
   edits the wording and the figure in the admin; the storefront reads them
   from here. */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: products } = await query.graph({
    entity: "product",
    fields: [
      "handle",
      "title",
      "subtitle",
      "metadata",
      "variants.prices.amount",
      "variants.prices.currency_code",
    ],
    filters: { collection: { handle: SILHOUETTE_COLLECTION } },
  })

  const currency = ((req.query.currency_code as string) || "chf").toLowerCase()

  const silhouettes = products
    .map((product) => {
      /* `prices` is a link field: query resolves it, the entity types do not
         declare it. */
      const variant = product.variants?.[0] as unknown as
        | { prices?: { amount: number; currency_code: string }[] }
        | undefined
      const prices = variant?.prices ?? []
      const price = prices.find((p) => p.currency_code === currency)
      return {
        key: (product.metadata?.silhouette as string) ?? product.handle,
        name: product.title,
        note: product.subtitle,
        estimate: price ? Number(price.amount) : null,
        currency_code: currency,
        length_kinds: (product.metadata?.length_kinds as string[]) ?? [],
        rank: Number(product.metadata?.rank ?? 0),
      }
    })
    .sort((a, b) => a.rank - b.rank)

  res.json({ silhouettes })
}
