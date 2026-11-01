import {
  archiveRefusal,
  commissionRefusal,
  isCommissionPiece,
  type GatedCommission,
  type GatedVariant,
} from "./archive"
import { lengthKindsOf, missingMeasurements, needsNoMeasurements } from "./measurements"

/* What makes a cart line one the atelier can accept:
   - the piece belongs to the current collection (archive.ts), or is a
     commission that can still be paid for;
   - it is ordered one at a time, because every garment is cut for one
     person and holds one place in the season's capped run;
   - it carries a complete measurement sheet (measurements.ts), unless the
     piece is one that asks for none, such as a tie;
   - where a piece offers only some colours (a tie's `metadata.swatches`),
     the line names one of them.

   Lines without a variant are not seasonal pieces and are left alone. */

export type CartLine = {
  quantity?: number | null
  metadata?: Record<string, unknown> | null
  variant?: GatedVariant
  /** The commission behind a commission piece, when it could be found. */
  commission?: GatedCommission | null
}

const list = (labels: string[]) =>
  labels.length === 1
    ? labels[0]
    : `${labels.slice(0, -1).join(", ")} and ${labels[labels.length - 1]}`

/** The colours a piece offers, from its product metadata; empty when it
    offers its cloth's whole library. */
const swatchesOf = (metadata: Record<string, unknown> | null | undefined): string[] => {
  const swatches = metadata?.swatches
  return Array.isArray(swatches) ? swatches.filter((s): s is string => typeof s === "string") : []
}

export function lineRefusals({ quantity, metadata, variant, commission }: CartLine): string[] {
  if (!variant) {
    return []
  }
  const closed = archiveRefusal(variant)
  if (closed) {
    return [closed]
  }
  const unpayable = isCommissionPiece(variant) ? commissionRefusal(commission) : null
  if (unpayable) {
    return [unpayable]
  }

  const piece = variant.product?.title ?? "This piece"
  const refusals: string[] = []

  if (quantity !== 1) {
    refusals.push(`Each piece is cut for one person, so ${piece} is ordered one at a time.`)
  }

  const missing = needsNoMeasurements(variant.product?.metadata)
    ? []
    : missingMeasurements(metadata, lengthKindsOf(variant.product?.metadata))
  if (missing.length) {
    refusals.push(
      `The tailor cannot cut ${piece} from a partial sheet: ${list(missing)} ${
        missing.length === 1 ? "is" : "are"
      } missing.`
    )
  }

  const offered = swatchesOf(variant.product?.metadata)
  const colour = metadata?.fabric_key
  if (offered.length && !(typeof colour === "string" && offered.includes(colour))) {
    refusals.push(`${piece} is not offered in that colour. Choose one of the colours shown for it.`)
  }

  return refusals
}

/** Every refusal across the cart, or null when the tailor can accept it. */
export function cartRefusal(lines: CartLine[]): string | null {
  const refusals = lines.flatMap(lineRefusals)
  return refusals.length ? refusals.join(" ") : null
}
