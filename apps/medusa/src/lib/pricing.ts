/* The house prices in Swiss francs. Euro and sterling prices are derived from
   the franc at a fixed rate and rounded to the nearest ten, so a coat reads
   EUR 2'120 rather than EUR 2'113.47. Changing a rate re-prices everything
   derived from it.

   The rates below are placeholders until the client confirms the figures
   they want to hold. */
export const CHF_RATES = {
  eur: 1.07,
  gbp: 0.93,
} as const

export type Currency = "chf" | keyof typeof CHF_RATES

export const CURRENCIES: Currency[] = ["chf", "eur", "gbp"]

export function fromChf(chf: number, currency: Currency) {
  if (currency === "chf") {
    return chf
  }
  return Math.round((chf * CHF_RATES[currency]) / 10) * 10
}
