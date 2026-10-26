/* The house's facts, written once. Pages, structured data and the product
 * feed all quote from here, so a search engine or an answer engine reads the
 * same number everywhere (docs/seo/SEO-GEO-PLAN.md §3). Prices are never
 * written here: they come from the pieces themselves. */

import type { Piece } from './catalog';

export const SITE_URL = 'https://bylinsilk.com';

/** Said the same way on the site, in schema, on profiles and in press. */
export const ENTITY =
  'LINSILK is a made-to-measure silk and linen clothing house based in Geneva, Switzerland. ' +
  'Every piece is cut and sewn to the customer’s own measurements in 2–4 weeks, in 100% silk or 100% linen cloth.';

export const EMAIL = 'hello@bylinsilk.com';

/** Profiles that exist today. Each new one is added the day it goes live. */
export const SAME_AS = ['https://instagram.com/linsilk'];

export const COLOURS = { silk: 48, linen: 40 } as const;

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
