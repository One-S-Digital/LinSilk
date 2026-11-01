/* The house's facts, written once. Pages, structured data and the product
 * feed all quote from here, so a search engine or an answer engine reads the
 * same number everywhere (docs/seo/SEO-GEO-PLAN.md §3). Prices are never
 * written here: they come from the pieces themselves. */

import type { Cloth, Piece } from './catalog';

export const SITE_URL = 'https://bylinsilk.com';

/** Said the same way on the site, in schema, on profiles and in press. */
export const ENTITY =
  'LINSILK is a made-to-measure clothing house based in Geneva, Switzerland, working in silk, linen and high frequency fabrics. ' +
  'Every piece except the ties is cut and sewn to the customer’s own measurements in 2–4 weeks, in 100% silk, 100% linen or high frequency fabric.';

export const EMAIL = 'hello@bylinsilk.com';

/** Profiles that exist today. Each new one is added the day it goes live. */
export const SAME_AS = ['https://instagram.com/linsilk'];

export const COLOURS = { silk: 48, linen: 40, cashmere: 12 } as const;

/* How the cloth is described in a sentence. Silk and linen are claimed as
   "100%"; cashmere is not until the house confirms its composition, so it is
   named plainly. Flip `cashmere` here and every title, description, feed and
   schema line follows. */
export const PURE: Record<Cloth, boolean> = { silk: true, linen: true, cashmere: false };

/** 'silk' -> '100% silk', 'cashmere' -> 'cashmere'. */
export const fibre = (cloth: Cloth) => (PURE[cloth] ? `100% ${cloth}` : cloth);

/** The number of colours a piece is offered in: its own list, else its cloth's. */
export const coloursOf = (piece: Pick<Piece, 'cloth' | 'swatches'>) =>
  piece.swatches?.length ? piece.swatches.length : piece.cloth ? COLOURS[piece.cloth] : 0;

export const LEAD_TIME = '2–4 weeks from your confirmed measurement sheet';

/* Days at the bench, then days in transit once dispatched (care/shipping). */
export const HANDLING_DAYS = { min: 14, max: 28 };

export type ShippingZone = {
  key: 'CH' | 'EU' | 'ROW';
  countries: string[];
  transit: { min: number; max: number };
  /** CHF. Null until the house confirms it; schema and feed leave the rate
      out rather than publish a guess. */
  rate: number | null;
};

export const SHIPPING: ShippingZone[] = [
  { key: 'CH', countries: ['CH', 'LI'], transit: { min: 2, max: 3 }, rate: null },
  { key: 'EU', countries: ['AT', 'DE', 'FR', 'LU', 'NL', 'GB'], transit: { min: 3, max: 6 }, rate: null },
  { key: 'ROW', countries: ['AE'], transit: { min: 5, max: 10 }, rate: null },
];

/** Lowest and highest whole-franc price across a set of pieces. */
export function priceRange(pieces: Pick<Piece, 'price'>[]) {
  const prices = pieces.map((p) => p.price).filter((n) => n > 0);
  if (prices.length === 0) return null;
  return { from: Math.min(...prices), to: Math.max(...prices) };
}

/** Absolute URL on the canonical host. */
export const absolute = (path: string) => `${SITE_URL}${path}`;
