'use client';

import { usePathname } from 'next/navigation';
import { useSyncExternalStore } from 'react';
import { langFromPath, type Lang } from './i18n';
import { useInitialLang } from './initial-lang';
import { isSharedRoute, readLangPref, subscribeLangPref } from './lang-pref';

/** The language of the page being shown. Translated pages carry it in their
    address, so the server render and the browser agree; the cart, checkout and
    account pages use the remembered choice instead. */
export function useLang(): Lang {
  const pathname = usePathname();
  const initial = useInitialLang();
  const stored = useSyncExternalStore(subscribeLangPref, readLangPref, (): Lang => initial);
  const fromPath = langFromPath(pathname);
  return fromPath !== 'en' ? fromPath : isSharedRoute(pathname) ? stored : 'en';
}
