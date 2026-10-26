'use client';

import { APPROX_CURRENCIES, type ApproxCurrency } from '@/lib/exchange';
import { CHROME } from '@/lib/chrome-i18n';
import { useCurrency } from '@/lib/currency';
import { useLang } from '@/lib/use-lang';
import styles from './site-footer.module.css';

/* Prices are in francs and are charged in francs. This only chooses whether an
   approximate figure in another currency is shown beside them. */
export function CurrencyPicker() {
  const { currency, choose } = useCurrency();
  const t = CHROME[useLang()];
  return (
    <label className={styles.currency}>
      <span>{t.currencyLabel}</span>
      <select
        value={currency ?? 'CHF'}
        onChange={(e) =>
          choose(e.target.value === 'CHF' ? null : (e.target.value as ApproxCurrency))
        }
      >
        <option value="CHF">{t.francsOnly}</option>
        {APPROX_CURRENCIES.map((c) => (
          <option key={c} value={c}>
            {t.currencies[c]}
          </option>
        ))}
      </select>
    </label>
  );
}
