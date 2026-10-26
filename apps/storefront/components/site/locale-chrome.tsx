'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { CHROME } from '@/lib/chrome-i18n';
import { LANG, suggestLocale } from '@/lib/i18n';
import { switchPath } from '@/lib/locale-routes';
import { useLang } from '@/lib/use-lang';
import styles from './locale-chrome.module.css';

const SEEN = 'linsilk-language-suggestion';

/* Keeps <html lang> in step with the page, since the root layout is shared
   with the English pages. Then, on an English page, offers the reader's
   browser language once; it never redirects (docs/seo/SEO-GEO-PLAN.md §6.7). */
const noSubscription = () => () => {};
const seen = () => {
  try {
    return Boolean(localStorage.getItem(SEEN));
  } catch {
    return false; /* storage blocked: the offer shows on every page, which is harmless */
  }
};

export function LocaleChrome() {
  const lang = useLang();
  const pathname = usePathname();
  const [closed, setClosed] = useState(false);
  /* The browser's language is known only in the browser, so the server render
     and the first client render both show nothing. */
  const offer = useSyncExternalStore(
    noSubscription,
    () => (seen() ? null : suggestLocale(navigator.language)),
    () => null,
  );

  useEffect(() => {
    document.documentElement.lang = lang === 'en' ? 'en' : LANG[lang];
  }, [lang]);

  if (lang !== 'en' || !offer || closed) return null;
  const t = CHROME[offer];
  const dismiss = () => {
    try {
      localStorage.setItem(SEEN, '1');
    } catch {
      /* nothing to remember it in */
    }
    setClosed(true);
  };

  return (
    <div className={styles.bar} role="region" aria-label={t.language} lang={LANG[offer]}>
      <span>{t.suggestOwn}</span>
      <Link href={switchPath(pathname, 'en', offer)} hrefLang={offer} onClick={dismiss}>
        {t.suggestGo}
      </Link>
      <button type="button" onClick={dismiss}>
        {t.dismiss}
      </button>
    </div>
  );
}

export function SkipLink() {
  return (
    <a href="#main" className="sr-only">
      {CHROME[useLang()].skip}
    </a>
  );
}
