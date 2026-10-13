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

/** A measurement as the bench knows it. */
export type Zone = { key: string; label: string }

export const BODY_ZONES: Zone[] = [
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

/* A shirt needs nothing from the leg, a trouser nothing from the upper body,
   and a skirt nothing from either, so each is not asked for them. Every other kind, and a set (which is
   both garments on one ticket), takes the whole sheet. Mirrors bodyZonesFor in
   the storefront's lib/catalog.ts. */
const LEG_KEYS = ["thigh", "knee", "rise"]
const UPPER_KEYS = [
  "neck", "shoulder", "bust", "bustPoint", "frontWaist", "backWaist", "sleeve", "bicep", "wrist",
]

export function bodyZonesFor(lengthKinds: string[] = []): Zone[] {
  const skip =
    lengthKinds.length === 1 && lengthKinds[0] === "top"
      ? LEG_KEYS
      : lengthKinds.length === 1 && lengthKinds[0] === "trouser"
        ? UPPER_KEYS
        : lengthKinds.length === 1 && lengthKinds[0] === "skirt"
          ? [...UPPER_KEYS, ...LEG_KEYS]
          : []
  return BODY_ZONES.filter((zone) => !skip.includes(zone.key))
}

/** Keyed by the kinds in a piece's `metadata.length_kinds`. */
export const LENGTH_ZONES: Record<string, Zone> = {
  dress: { key: "lengthDress", label: "Dress length" },
  skirt: { key: "lengthSkirt", label: "Skirt length" },
  trouser: { key: "lengthTrouser", label: "Trouser length" },
  top: { key: "lengthTop", label: "Desired length" },
  robe: { key: "lengthRobe", label: "Robe length" },
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
    ...bodyZonesFor(lengthKinds),
    ...lengthKinds.map(
      (kind) =>
        LENGTH_ZONES[kind] ?? { key: `length_${kind}`, label: "Garment length" }
    ),
  ]
  return zones
    .filter((zone) => !usable(metadata?.[`measure_${zone.key}_cm`]))
    .map((zone) => zone.label)
}
