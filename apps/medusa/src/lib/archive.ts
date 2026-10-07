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

/* The only statuses a quote is still open to being paid at: after a tailor
   has set a figure, before the client has settled it. Every other status —
   including one this list does not yet know about — is refused by default,
   `quote_amount` and `paid_at` notwithstanding, because a status can outlive
   the figure that was set when it was reached: a declined commission still
   carries whatever `quote_amount` it had before it was declined.

   apps/storefront/components/checkout/commission-payment.tsx carries the
   same list, for the same reason, on the page that never reaches the cart if
   it gets this right. */
export const PAYABLE_STATUSES = ["quoted", "approved"]

export type GatedCommission = { status: string; paid_at?: unknown }

export const isCommissionPiece = (variant: GatedVariant) =>
  variant.product?.collection?.metadata?.status === "commission"

/** The commission a commission piece was made for. It is read from the
    product, which only the house writes, and not from the cart line, which
    the client can send whatever it likes on. */
export const commissionIdOf = (variant: GatedVariant) => {
  const id = variant.product?.metadata?.commission_id
  return typeof id === "string" ? id : undefined
}

/** Why a commission cannot be paid for, or null when it can. The collection
    is `commission` for as long as the piece exists, so it says nothing of
    what has happened to the commission since — that is read from the
    commission itself. */
export function commissionRefusal(commission: GatedCommission | null | undefined): string | null {
  if (!commission) {
    return "No commission answers to this piece."
  }
  if (commission.paid_at) {
    return "This commission is already paid for."
  }
  return PAYABLE_STATUSES.includes(commission.status)
    ? null
    : `This commission is ${commission.status}; it is not one a payment can be made on.`
}

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
