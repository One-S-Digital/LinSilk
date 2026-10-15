'use client';

import { APPROX_CURRENCIES, type ApproxCurrency } from '@/lib/exchange';
import { useCurrency } from '@/lib/currency';
import styles from './site-footer.module.css';

const NAMES: Record<ApproxCurrency, string> = {
  EUR: 'Euro (EUR)',
  GBP: 'Pound (GBP)',
  USD: 'US dollar (USD)',
};

/* Prices are in francs and are charged in francs. This only chooses whether an
   approximate figure in another currency is shown beside them. */
export function CurrencyPicker() {
  const { currency, choose } = useCurrency();
  return (
    <label className={styles.currency}>
      <span>Also show approximately in</span>
      <select
        value={currency ?? 'CHF'}
        onChange={(e) =>
          choose(e.target.value === 'CHF' ? null : (e.target.value as ApproxCurrency))
        }
      >
        <option value="CHF">Francs only</option>
        {APPROX_CURRENCIES.map((c) => (
          <option key={c} value={c}>
            {NAMES[c]}
          </option>
        ))}
      </select>
    </label>
  );
}
