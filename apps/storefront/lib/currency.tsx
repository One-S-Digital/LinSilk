'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  APPROX_CURRENCIES,
  approximate,
  currencyForLocale,
  type ApproxCurrency,
  type Rates,
} from './exchange';
import { shopText } from './i18n-shop';
import { useHydrated } from './use-hydrated';
import { useLang } from './use-lang';

/* Which currency, if any, to show an approximate figure in beside a franc
   price. The visitor's choice is kept in this browser; without one, their
   browser's language suggests it (a German browser gets euros, a Swiss one
   nothing). The page is always correct without any of this: it only adds a
   guide, and says so. */

type CurrencyState = {
  /** Null means francs alone. */
  currency: ApproxCurrency | null;
  choose: (currency: ApproxCurrency | null) => void;
  rates: Rates | null;
  /** The ECB's publication date, for the note under a figure. */
  date: string | null;
};

const CurrencyContext = createContext<CurrencyState>({
  currency: null,
  choose: () => {},
  rates: null,
  date: null,
});

const KEY = 'linsilk.currency.v1';

const read = (): ApproxCurrency | null | undefined => {
  try {
    const stored = window.localStorage.getItem(KEY);
    if (stored === 'CHF') return null;
    return APPROX_CURRENCIES.find((c) => c === stored);
  } catch {
    return undefined;
  }
};

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<ApproxCurrency | null>(null);
  const [rates, setRates] = useState<Rates | null>(null);
  const [date, setDate] = useState<string | null>(null);

  /* Read once the page is hydrated, so the server markup and the first paint
     agree. Same pattern as the measurement sheet's restore. */
  const hydrated = useHydrated();
  const [restored, setRestored] = useState(false);
  if (hydrated && !restored) {
    setRestored(true);
    const stored = read();
    setCurrency(stored === undefined ? currencyForLocale(navigator.language) : stored);
  }

  useEffect(() => {
    let cancelled = false;
    fetch('/api/rates')
      .then((r) => r.json())
      .then((body: { rates: Rates | null; date?: string }) => {
        if (cancelled || !body.rates) return;
        setRates(body.rates);
        setDate(body.date ?? null);
      })
      .catch(() => {
        // No guide, then: francs alone are always right.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const choose = useCallback((next: ApproxCurrency | null) => {
    setCurrency(next);
    try {
      window.localStorage.setItem(KEY, next ?? 'CHF');
    } catch {
      // Private mode: the choice lasts for this visit.
    }
  }, []);

  const value = useMemo(() => ({ currency, choose, rates, date }), [currency, choose, rates, date]);
  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export const useCurrency = () => useContext(CurrencyContext);

/** "≈ €138" beside a franc price, when a currency is chosen and a rate is known. */
export function Approx({
  chf,
  currency = 'chf',
  className,
}: {
  chf: number;
  /** The currency the figure is actually in; anything but francs is not converted. */
  currency?: string;
  className?: string;
}) {
  const state = useCurrency();
  if (!state.currency || !state.rates || currency.toLowerCase() !== 'chf' || !(chf > 0)) {
    return null;
  }
  return <span className={className}>{approximate(chf, state.currency, state.rates)}</span>;
}

/** The sentence that goes under a total, so the figure is never mistaken for the charge. */
export function ApproxNote({ className }: { className?: string }) {
  const { currency, rates, date } = useCurrency();
  const lang = useLang();
  if (!currency || !rates) return null;
  return (
    <p className={className}>{shopText(lang).approx(currency, date ?? null)}</p>
  );
}
