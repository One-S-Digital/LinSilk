/* The measurement sheet every piece is cut from: fifteen body measurements,
   plus the one garment length a piece may ask for. This mirrors ZONES and
   LENGTH_ZONE in the storefront's lib/catalog.ts, and a storefront test
   (lib/backend-parity.test.ts) pins the two together.

   The sheet arrives on the line item as the storefront's toLineItemMetadata()
   writes it: `measure_<key>_cm`, always in centimetres.

   Only an incomplete or unusable sheet is refused. A value outside the usual
   range is not: the storefront warns about it and lets the client proceed,
   and the atelier confirms every sheet in writing before cutting. */

export const BODY_ZONES: { key: string; label: string }[] = [
  { key: "neck", label: "Neck" },
  { key: "shoulder", label: "Shoulder" },
  { key: "bust", label: "Bust / chest" },
  { key: "bustPoint", label: "Bust point" },
  { key: "frontWaist", label: "Front waist length" },
  { key: "backWaist", label: "Back waist length" },
  { key: "waist", label: "Waist" },
  { key: "hip", label: "Hip" },
  { key: "hipDepth", label: "Hip depth" },
  { key: "thigh", label: "Thigh" },
  { key: "knee", label: "Knee" },
  { key: "sleeve", label: "Sleeve length" },
  { key: "bicep", label: "Upper arm" },
  { key: "wrist", label: "Wrist" },
  { key: "rise", label: "Rise" },
]

/** Keyed by a piece's `metadata.length_kind`. */
export const LENGTH_LABELS: Record<string, string> = {
  dress: "Dress length",
  skirt: "Skirt length",
  trouser: "Trouser length",
  top: "Desired length",
}

const usable = (raw: unknown) =>
  (typeof raw === "string" || typeof raw === "number") &&
  Number.isFinite(Number(raw)) &&
  Number(raw) > 0

/** Labels of the measurements this piece needs that the sheet lacks. */
export function missingMeasurements(
  metadata: Record<string, unknown> | null | undefined,
  lengthKind?: string | null
): string[] {
  const zones = lengthKind
    ? [...BODY_ZONES, { key: "length", label: LENGTH_LABELS[lengthKind] ?? "Garment length" }]
    : BODY_ZONES
  return zones
    .filter((zone) => !usable(metadata?.[`measure_${zone.key}_cm`]))
    .map((zone) => zone.label)
}
