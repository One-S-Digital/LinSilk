/* Approximate figures in the visitor's own currency.
 *
 * The house prices in Swiss francs and charges in Swiss francs, always. What
 * is worked out here is only a guide shown beside the franc price — never
 * a price, never charged, and labelled as approximate wherever it appears.
 *
 * The rate is the European Central Bank's daily reference rate: free and
 * keyless, published once each working day against the euro. A franc rate
 * is worked out from it.
 */

export const APPROX_CURRENCIES = ['EUR', 'GBP', 'USD', 'AED'] as const;
export type ApproxCurrency = (typeof APPROX_CURRENCIES)[number];

/** How much of each currency one Swiss franc buys. */
export type Rates = Record<ApproxCurrency, number>;

export const ECB_URL = 'https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml';

/* The ECB does not publish the dirham. It has been pegged to the US dollar at
   3.6725 since 1997, so it is worked out from the dollar rate. */
const AED_PER_USD = 3.6725;

/** Reads the ECB's daily file. Null if it does not carry what is needed. */
export function parseEcb(xml: string): { date: string; rates: Rates } | null {
  const date = xml.match(/time=['"](\d{4}-\d{2}-\d{2})['"]/)?.[1];
  const perEuro: Record<string, number> = {};
  for (const [, code, rate] of xml.matchAll(/currency=['"]([A-Z]{3})['"]\s+rate=['"]([\d.]+)['"]/g)) {
    perEuro[code] = Number(rate);
  }
  const chf = perEuro.CHF;
  if (!date || !(chf > 0) || !(perEuro.GBP > 0) || !(perEuro.USD > 0)) return null;
  return {
    date,
    rates: {
      EUR: 1 / chf,
      GBP: perEuro.GBP / chf,
      USD: perEuro.USD / chf,
      AED: (perEuro.USD / chf) * AED_PER_USD,
    },
  };
}

/** "≈ €138" — whole units, because it is a guide and not a price. */
export function approximate(chf: number, currency: ApproxCurrency, rates: Rates) {
  const figure = new Intl.NumberFormat('en', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(chf * rates[currency]);
  return `≈ ${figure}`;
}

const EURO_AREA = new Set([
  'AT', 'BE', 'BG', 'CY', 'DE', 'EE', 'ES', 'FI', 'FR', 'GR', 'HR', 'IE', 'IT',
  'LT', 'LU', 'LV', 'MT', 'NL', 'PT', 'SI', 'SK',
]);

/** The currency a browser's language suggests, or null for francs alone. */
export function currencyForLocale(locale: string | undefined): ApproxCurrency | null {
  const region = locale?.split('-')[1]?.toUpperCase();
  if (!region) return null;
  if (region === 'GB') return 'GBP';
  if (region === 'US') return 'USD';
  if (region === 'AE') return 'AED';
  return EURO_AREA.has(region) ? 'EUR' : null;
}
