/* The measurement sheet every piece is cut from: fifteen body measurements,
   plus the garment lengths a piece asks for — one for a dress or a trouser,
   two for a set, which is two garments on one ticket. This mirrors ZONES and
   LENGTH_ZONE in the storefront's lib/catalog.ts, and a storefront test
   (lib/backend-parity.test.ts) pins the two together.

   The sheet arrives on the line item as the storefront's toLineItemMetadata()
   writes it: `measure_<key>_cm`, always in centimetres.

   Only an incomplete or unusable sheet is refused. A value outside the usual
   range is not: the storefront warns about it and lets the client proceed,
   and the atelier confirms every sheet in writing before cutting. */

/** A measurement as the bench knows it: our word, and the tailor's own. */
export type Zone = { key: string; label: string; vi: string }

export const BODY_ZONES: Zone[] = [
  { key: "neck", label: "Neck", vi: "Cổ" },
  { key: "shoulder", label: "Shoulder", vi: "Vai" },
  { key: "bust", label: "Bust / chest", vi: "Ngực" },
  { key: "bustPoint", label: "Bust point", vi: "Hạ đỉnh ngực" },
  { key: "frontWaist", label: "Front waist length", vi: "Hạ eo trước" },
  { key: "backWaist", label: "Back waist length", vi: "Hạ eo sau" },
  { key: "waist", label: "Waist", vi: "Eo" },
  { key: "hip", label: "Hip", vi: "Mông" },
  { key: "hipDepth", label: "Hip depth", vi: "Hạ đỉnh mông" },
  { key: "thigh", label: "Thigh", vi: "Đùi" },
  { key: "knee", label: "Knee", vi: "Gối" },
  { key: "sleeve", label: "Sleeve length", vi: "Dài tay" },
  { key: "bicep", label: "Upper arm", vi: "Bắp tay" },
  { key: "wrist", label: "Wrist", vi: "Cổ tay" },
  { key: "rise", label: "Rise", vi: "Đáy quần" },
]

/** Keyed by the kinds in a piece's `metadata.length_kinds`. */
export const LENGTH_ZONES: Record<string, Zone> = {
  dress: { key: "lengthDress", label: "Dress length", vi: "Chiều dài đầm" },
  skirt: { key: "lengthSkirt", label: "Skirt length", vi: "Dài váy" },
  trouser: { key: "lengthTrouser", label: "Trouser length", vi: "Dài quần" },
  top: { key: "lengthTop", label: "Desired length", vi: "Dài áo" },
  robe: { key: "lengthRobe", label: "Robe length", vi: "Dài áo choàng" },
}

/** The length kinds a piece declares, from its product metadata. */
export function lengthKindsOf(metadata: Record<string, unknown> | null | undefined): string[] {
  const kinds = metadata?.length_kinds
  return Array.isArray(kinds) ? kinds.filter((k): k is string => typeof k === "string") : []
}

const usable = (raw: unknown) =>
  (typeof raw === "string" || typeof raw === "number") &&
  Number.isFinite(Number(raw)) &&
  Number(raw) > 0

/** Labels of the measurements this piece needs that the sheet lacks. */
export function missingMeasurements(
  metadata: Record<string, unknown> | null | undefined,
  lengthKinds: string[] = []
): string[] {
  const zones = [
    ...BODY_ZONES,
    ...lengthKinds.map(
      (kind) =>
        LENGTH_ZONES[kind] ?? { key: `length_${kind}`, label: "Garment length", vi: "" }
    ),
  ]
  return zones
    .filter((zone) => !usable(metadata?.[`measure_${zone.key}_cm`]))
    .map((zone) => zone.label)
}
