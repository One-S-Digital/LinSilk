/* The archive gate. A piece can be ordered only while its collection is
   `current`; once a season closes it is `past`, readable in the archive and
   never made again. This mirrors isOrderable() in the storefront's
   lib/catalog.ts, and fails closed the same way: a piece without a current
   collection is not orderable. */

export type GatedVariant = {
  id: string
  product?: {
    title?: string | null
    collection?: {
      title?: string | null
      metadata?: Record<string, unknown> | null
    } | null
  } | null
}

export const isOrderable = (variant: GatedVariant) =>
  variant.product?.collection?.metadata?.status === "current"

/** The refusal to show the client, or null when every piece is orderable. */
export function archiveRefusal(variants: GatedVariant[]): string | null {
  const closed = variants.filter((v) => !isOrderable(v))
  if (!closed.length) {
    return null
  }
  return closed
    .map((v) => {
      const piece = v.product?.title ?? "This piece"
      const season = v.product?.collection?.title
      return season
        ? `${piece} closed with ${season} and is not made again.`
        : `${piece} is not part of an open collection.`
    })
    .join(" ")
}
