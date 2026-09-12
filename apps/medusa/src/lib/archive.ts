/* The archive gate. A piece can be ordered only while its collection is
   `current`; once a season closes it is `past`, readable in the archive and
   never made again. This mirrors isOrderable() in the storefront's
   lib/catalog.ts, and fails closed the same way: a piece without a current
   collection is not orderable. */

export type GatedVariant = {
  id: string
  product?: {
    title?: string | null
    metadata?: Record<string, unknown> | null
    collection?: {
      title?: string | null
      metadata?: Record<string, unknown> | null
    } | null
  } | null
}

/* `current` is the open season. `commission` is a garment a tailor has
   already priced for one person: it carries its own figure and a stock of
   one, so paying for it is accepting the quote. */
const ORDERABLE = ["current", "commission"]

export const isOrderable = (variant: GatedVariant) =>
  ORDERABLE.includes(String(variant.product?.collection?.metadata?.status))

/** Why this piece cannot be ordered, or null when it can. */
export function archiveRefusal(variant: GatedVariant): string | null {
  if (isOrderable(variant)) {
    return null
  }
  const piece = variant.product?.title ?? "This piece"
  const collection = variant.product?.collection

  /* A silhouette is not archived — it was never for sale. It is the shape a
     commission starts from, and a person sets its price. */
  if (collection?.metadata?.status === "silhouettes") {
    return `${piece} is a commission: a tailor reads the brief and writes back with a price, so it cannot be bought from the page.`
  }

  return collection?.title
    ? `${piece} closed with ${collection.title} and is not made again.`
    : `${piece} is not part of an open collection.`
}
