/* Measurements.
 *
 * Everything is stored canonically in centimetres. The unit toggle is a
 * display concern only — the prototype switched the label without converting
 * the number, which would have sent the atelier a 96 cm chest recorded as
 * 96 inches. The sheet is the order, so the conversion has to be real.
 */

import { ZONES, type Zone } from './catalog';

export type Unit = 'cm' | 'in';

/** Values in centimetres, keyed by zone. Missing means not yet taken. */
export type Measurements = Partial<Record<string, number>>;

export const CM_PER_INCH = 2.54;

export const toDisplay = (cm: number, unit: Unit) =>
  unit === 'cm' ? cm : cm / CM_PER_INCH;

export const toCm = (value: number, unit: Unit) =>
  unit === 'cm' ? value : value * CM_PER_INCH;

/** Centimetres to one decimal, inches to a quarter — how a tape is actually read. */
export function formatValue(cm: number, unit: Unit) {
  if (unit === 'cm') return String(Math.round(cm * 10) / 10);
  return String(Math.round((cm / CM_PER_INCH) * 4) / 4);
}

/* Plausible adult ranges in centimetres. These do not reject a body; they
   catch a decimal point in the wrong place or inches typed into a cm field,
   which is the actual failure mode. */
export const RANGES: Record<string, [number, number]> = {
  neck: [28, 55],
  shoulder: [33, 58],
  bust: [70, 140],
  bustPoint: [15, 40],
  frontWaist: [28, 58],
  backWaist: [30, 55],
  waist: [55, 135],
  hip: [75, 150],
  hipDepth: [14, 34],
  thigh: [40, 80],
  knee: [28, 58],
  sleeve: [45, 75],
  bicep: [20, 50],
  wrist: [13, 24],
  rise: [50, 95],
  /* Chosen garment lengths rather than body facts, so the range spans a
     cropped top through a full-length coat or an ankle-length dress. */
  lengthDress: [30, 180],
  lengthSkirt: [30, 180],
  lengthTrouser: [30, 180],
  lengthTop: [30, 180],
  lengthRobe: [30, 180],
};

/** The usual range for a measurement, in centimetres, or undefined. */
export const rangeOf = (key: string): [number, number] | undefined => RANGES[key];

export function validate(key: string, cm: number, unit: Unit): string | null {
  const range = RANGES[key];
  if (!range) return null;
  const [min, max] = range;
  if (cm >= min && cm <= max) return null;
  const lo = formatValue(min, unit);
  const hi = formatValue(max, unit);
  return `Usually between ${lo} and ${hi} ${unit}. Check the tape, or write to the tailor if this is right.`;
}

/* Both counts take the zone list the sheet is actually showing: a coat asks
   for a finished length on top of the fifteen body measurements, a trouser does
   not, and "complete" has to mean whatever that garment needs. */
export const takenCount = (m: Measurements, zones: Zone[] = ZONES) =>
  zones.filter((z) => typeof m[z.key] === 'number').length;

export const isComplete = (m: Measurements, zones: Zone[] = ZONES) =>
  takenCount(m, zones) === zones.length;

/* ---- Local persistence ----
   A convenience for guests. Signed-in clients get the sheet on their account,
   which is what "Save this profile" writes to. */

const KEY = 'linsilk.measurements.v1';

export function loadLocal(): { unit: Unit; values: Measurements } {
  if (typeof window === 'undefined') return { unit: 'cm', values: {} };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { unit: 'cm', values: {} };
    const parsed = JSON.parse(raw) as { unit?: Unit; values?: Measurements };
    return {
      unit: parsed.unit === 'in' ? 'in' : 'cm',
      values: parsed.values ?? {},
    };
  } catch {
    // Private mode, cleared storage, or a shape we no longer understand.
    return { unit: 'cm', values: {} };
  }
}

export function saveLocal(unit: Unit, values: Measurements) {
  if (typeof window === 'undefined') return false;
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ unit, values }));
    return true;
  } catch {
    return false;
  }
}

/** The line-item payload that travels with the order to the bench. */
export function toLineItemMetadata(
  m: Measurements,
  unit: Unit,
  zones: Zone[] = ZONES,
): Record<string, string> {
  return {
    measurement_unit: unit,
    ...Object.fromEntries(
      zones
        .filter((z) => typeof m[z.key] === 'number')
        .map((z) => [`measure_${z.key}_cm`, String(m[z.key])]),
    ),
  };
}

/** The inverse of `toLineItemMetadata` — reads a sheet back out of whatever
    carried it, a cart line or a saved account profile alike. Keys it does
    not recognise are ignored, so metadata carrying other fields besides the
    sheet is safe to pass in whole. */
export function fromLineItemMetadata(
  metadata: Record<string, unknown> | null | undefined,
): { unit: Unit; values: Measurements } {
  const values: Measurements = {};
  for (const [key, value] of Object.entries(metadata ?? {})) {
    const zone = key.match(/^measure_(.+)_cm$/)?.[1];
    if (zone) values[zone] = Number(value);
  }
  return { unit: metadata?.measurement_unit === 'in' ? 'in' : 'cm', values };
}
