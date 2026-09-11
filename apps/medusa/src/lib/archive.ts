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

export const isOrderable = (variant: GatedVariant) =>
  variant.product?.collection?.metadata?.status === "current"

/** Why this piece cannot be ordered, or null when it can. */
export function archiveRefusal(variant: GatedVariant): string | null {
  if (isOrderable(variant)) {
    return null
  }
  const piece = variant.product?.title ?? "This piece"
  const season = variant.product?.collection?.title
  return season
    ? `${piece} closed with ${season} and is not made again.`
    : `${piece} is not part of an open collection.`
}
