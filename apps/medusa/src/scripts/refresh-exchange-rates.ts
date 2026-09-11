/* Runs the hourly exchange-rate job now, rather than waiting for the hour:
 *
 *   pnpm --filter medusa exec medusa exec ./src/scripts/refresh-exchange-rates.ts
 */

import { MedusaContainer } from "@medusajs/framework"
import refreshExchangeRates from "../jobs/refresh-exchange-rates"

export default async function run({ container }: { container: MedusaContainer }) {
  await refreshExchangeRates(container)
}
