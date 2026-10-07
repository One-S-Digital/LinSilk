import { MedusaError } from "@medusajs/framework/utils"
import type { ChfRates } from "./pricing"

const feedError = (message: string) =>
  new MedusaError(MedusaError.Types.UNEXPECTED_STATE, message)

/* The European Central Bank's daily reference rates: free, keyless, published
   around 16:00 CET on working days, and the source most other rate services
   repackage. Rates are quoted per euro, so the franc's rates are derived. */
export const ECB_DAILY_URL = "https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml"

export type DatedRates = ChfRates & { date: string }

export function parseEcbDaily(xml: string): DatedRates {
  const date = xml.match(/time=['"](\d{4}-\d{2}-\d{2})['"]/)?.[1]
  const perEuro = (code: string) => {
    const rate = Number(xml.match(new RegExp(`currency=['"]${code}['"]\\s+rate=['"]([\\d.]+)['"]`))?.[1])
    if (!Number.isFinite(rate) || rate <= 0) {
      throw feedError(`ECB feed has no usable ${code} rate`)
    }
    return rate
  }
  if (!date) {
    throw feedError("ECB feed has no reference date")
  }

  const chf = perEuro("CHF")
  return { date, eur: 1 / chf, gbp: perEuro("GBP") / chf }
}

export async function fetchChfRates(fetchFn: typeof fetch = fetch): Promise<DatedRates> {
  const response = await fetchFn(ECB_DAILY_URL, { signal: AbortSignal.timeout(10_000) })
  if (!response.ok) {
    throw feedError(`ECB feed returned ${response.status}`)
  }
  return parseEcbDaily(await response.text())
}

/* The rate a request is allowed to use.
 *
 * The ECB publishes once a working day, so asking it again inside the hour
 * buys nothing, and the feed being down is not a reason a tailor cannot put a
 * figure on a brief. The last good answer is kept and served: fresh within
 * the hour, stale and noted after that, and only a process that has never
 * reached the feed at all refuses.
 *
 * The refresh-exchange-rates job deliberately does not come through here —
 * it re-prices the whole house, so it wants today's rate or nothing, and it
 * already leaves prices alone when the feed is unavailable.
 */
const FRESH_FOR = 60 * 60 * 1000

let lastGood: { rates: DatedRates; at: number } | null = null

export async function chfRates(
  logger?: { warn: (message: string) => void },
  fetchFn: typeof fetch = fetch
): Promise<DatedRates> {
  if (lastGood && Date.now() - lastGood.at < FRESH_FOR) {
    return lastGood.rates
  }

  try {
    const rates = await fetchChfRates(fetchFn)
    lastGood = { rates, at: Date.now() }
    return rates
  } catch (error) {
    if (!lastGood) {
      throw error
    }
    logger?.warn(
      `ECB feed unavailable (${(error as Error).message}); pricing at the rates of ` +
        `${lastGood.rates.date}, which is the last the house has.`
    )
    return lastGood.rates
  }
}

/** Only for tests: forgets the last good rate. */
export const forgetChfRates = () => {
  lastGood = null
}
