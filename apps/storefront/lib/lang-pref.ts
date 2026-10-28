/* The reader's language on pages that have no language in their address: the
   cart, checkout, account and order pages are the same URL for everyone, so
   the language is remembered in a cookie (set when a translated page is shown
   or the language menu is used) and read on the server and in the browser. */

import { isLocale, type Lang } from './i18n';

export const LANG_COOKIE = 'ls_lang';

/** Routes with one address for every language. */
const SHARED = ['/cart', '/checkout', '/account', '/order', '/commission'];

export const isSharedRoute = (pathname: string) =>
  SHARED.some((r) => pathname === r || pathname.startsWith(`${r}/`));

export const asLang = (value: string | undefined | null): Lang =>
  value && isLocale(value) ? value : 'en';

export function readLangPref(): Lang {
  if (typeof document === 'undefined') return 'en';
  const m = document.cookie.match(new RegExp(`(?:^|; )${LANG_COOKIE}=([^;]*)`));
  return asLang(m?.[1]);
}

const EVENT = 'linsilk-lang';

export function setLangPref(lang: Lang) {
  if (readLangPref() === lang) return;
  document.cookie = `${LANG_COOKIE}=${lang}; path=/; max-age=31536000; samesite=lax`;
  window.dispatchEvent(new Event(EVENT));
}

export function subscribeLangPref(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  return () => window.removeEventListener(EVENT, onChange);
}
