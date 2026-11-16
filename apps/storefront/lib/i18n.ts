/* Languages and their hreflang codes (docs/seo/SEO-GEO-PLAN.md §6.7). English
 * is the root and the x-default; German and French sit under /de/ and /fr/.
 * There is one German and one French, both written in the Swiss variants (German
 * with ss, never ß; French with Swiss usage). The separate /de-ch/ and /fr-ch/
 * URLs were removed on 2026-11-16 and redirect to /de/ and /fr/. */

export const LOCALES = ['de', 'fr'] as const;
export type Locale = (typeof LOCALES)[number];

export const isLocale = (s: string): s is Locale => (LOCALES as readonly string[]).includes(s);

/** One URL answers for each of these markets. */
export const HREFLANG: Record<Locale, string[]> = {
  de: ['de-DE', 'de-AT', 'de-CH', 'de-LI', 'de-LU'],
  fr: ['fr-FR', 'fr-CH', 'fr-LU'],
};

/** The `lang` attribute for content in each locale. */
export const LANG: Record<Locale, string> = {
  de: 'de',
  fr: 'fr',
};

export const OG_LOCALE: Record<Locale, string> = {
  de: 'de_DE',
  fr: 'fr_FR',
};

/** A page language: English at the root, or one of the locales. */
export type Lang = 'en' | Locale;

/** The locale a URL path belongs to, or 'en'. */
export function langFromPath(pathname: string): Lang {
  const first = pathname.split('/')[1] ?? '';
  return isLocale(first) ? first : 'en';
}

/** The spoken-language families, for choosing a suggestion from a browser. */
export function suggestLocale(browserLanguage: string): Locale | null {
  const l = browserLanguage.toLowerCase();
  if (l.startsWith('de')) return 'de';
  if (l.startsWith('fr')) return 'fr';
  return null;
}
