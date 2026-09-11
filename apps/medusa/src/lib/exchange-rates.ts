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
