import { archiveRefusal, type GatedVariant } from "./archive"
import { missingMeasurements } from "./measurements"

/* What makes a cart line one the atelier can accept:
   - the piece belongs to the current collection (archive.ts);
   - it is ordered one at a time, because every garment is cut for one
     person and holds one place in the season's capped run;
   - it carries a complete measurement sheet (measurements.ts).

   Lines without a variant are not seasonal pieces and are left alone. */

export type CartLine = {
  quantity?: number | null
  metadata?: Record<string, unknown> | null
  variant?: GatedVariant
}

const list = (labels: string[]) =>
  labels.length === 1
    ? labels[0]
    : `${labels.slice(0, -1).join(", ")} and ${labels[labels.length - 1]}`

export function lineRefusals({ quantity, metadata, variant }: CartLine): string[] {
  if (!variant) {
    return []
  }
  const closed = archiveRefusal(variant)
  if (closed) {
    return [closed]
  }

  const piece = variant.product?.title ?? "This piece"
  const refusals: string[] = []

  if (quantity !== 1) {
    refusals.push(`Each piece is cut for one person, so ${piece} is ordered one at a time.`)
  }

  const lengthKind = variant.product?.metadata?.length_kind
  const missing = missingMeasurements(metadata, typeof lengthKind === "string" ? lengthKind : null)
  if (missing.length) {
    refusals.push(
      `The atelier cannot cut ${piece} from a partial sheet: ${list(missing)} ${
        missing.length === 1 ? "is" : "are"
      } missing.`
    )
  }

  return refusals
}

/** Every refusal across the cart, or null when the atelier can accept it. */
export function cartRefusal(lines: CartLine[]): string | null {
  const refusals = lines.flatMap(lineRefusals)
  return refusals.length ? refusals.join(" ") : null
}
