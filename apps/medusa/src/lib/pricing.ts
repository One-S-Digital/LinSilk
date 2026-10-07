/* The house prices in Swiss francs. Euro and sterling prices are derived from
   the franc at the day's exchange rate and rounded to the nearest ten, so a
   coat reads EUR 2'120 rather than EUR 2'113.47. The rates come from the ECB
   (see exchange-rates.ts) and the refresh-exchange-rates job re-derives every
   price when they move. */

/** How many units of each currency one Swiss franc buys. */
export type ChfRates = { eur: number; gbp: number }

export type Currency = "chf" | keyof ChfRates

export const CURRENCIES: Currency[] = ["chf", "eur", "gbp"]

const isCurrency = (code: string): code is Currency =>
  (CURRENCIES as string[]).includes(code)

export function fromChf(chf: number, currency: Currency, rates: ChfRates) {
  if (currency === "chf") {
    return chf
  }
  return Math.round((chf * rates[currency]) / 10) * 10
}

export type Price = { id?: string; currency_code: string; amount: number }

/* Takes a price set and re-derives every euro and sterling price from its
   franc price. `ensure` adds any listed currency that is missing, so a piece
   created in the admin with only a franc price is priced everywhere.

   Returns the complete list, because Medusa replaces a price set's prices
   with whatever it is given — or null when nothing would change. */
export function rederive(
  prices: Price[],
  rates: ChfRates,
  ensure: Currency[] = []
): Price[] | null {
  const chf = prices.find((p) => p.currency_code === "chf")
  if (!chf) {
    return null
  }

  let changed = false
  const next = prices.map((p) => {
    if (p.currency_code === "chf" || !isCurrency(p.currency_code)) {
      return p
    }
    const amount = fromChf(chf.amount, p.currency_code, rates)
    if (amount !== p.amount) {
      changed = true
    }
    return { ...p, amount }
  })

  for (const currency of ensure) {
    if (!next.some((p) => p.currency_code === currency)) {
      next.push({ currency_code: currency, amount: fromChf(chf.amount, currency, rates) })
      changed = true
    }
  }

  return changed ? next : null
}
