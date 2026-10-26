/* Languages and their hreflang codes (docs/seo/SEO-GEO-PLAN.md §6.7). English
 * is the root and the x-default; the others sit under /{locale}/. German is
 * split in two: Swiss spelling (Mass, no ß) for /de-ch/, and Maß for /de/,
 * which serves Austria, Germany and Luxembourg. */

export const LOCALES = ['de-ch', 'fr-ch', 'de', 'fr'] as const;
export type Locale = (typeof LOCALES)[number];

export const isLocale = (s: string): s is Locale => (LOCALES as readonly string[]).includes(s);

/** One URL answers for each of these markets. */
export const HREFLANG: Record<Locale, string[]> = {
  'de-ch': ['de-CH', 'de-LI'],
  'fr-ch': ['fr-CH'],
  de: ['de-AT', 'de-DE', 'de-LU'],
  fr: ['fr-FR', 'fr-LU'],
};

/** The `lang` attribute for content in each locale. */
export const LANG: Record<Locale, string> = {
  'de-ch': 'de-CH',
  'fr-ch': 'fr-CH',
  de: 'de-DE',
  fr: 'fr-FR',
};

export const OG_LOCALE: Record<Locale, string> = {
  'de-ch': 'de_CH',
  'fr-ch': 'fr_CH',
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

/* /de/ is the Swiss text with Maß, ß and the German "in" for "innert". The
   Swiss copy is the one written; this derives the German-market text. */
export const toDe = (s: string) =>
  s
    .replace(/Mass/g, 'Maß')
    .replace(/[Gg]ross/g, (m) => `${m[0]}roß`)
    .replace(/rösse/g, 'röße')
    .replace(/[Aa]ussen/g, (m) => `${m[0]}ußen`)
    .replace(/[Aa]usser/g, (m) => `${m[0]}ußer`)
    .replace(/heiss/g, 'heiß')
    .replace(/[Ss]chliess/g, (m) => `${m[0]}chließ`)
    .replace(/innert (?=\d)/g, 'in ')
    .replace(/innert /g, 'innerhalb ');

/** The spoken-language families, for choosing a suggestion from a browser. */
export function suggestLocale(browserLanguage: string): Locale | null {
  const l = browserLanguage.toLowerCase();
  if (l.startsWith('de')) return l === 'de-ch' || l === 'de-li' ? 'de-ch' : 'de';
  if (l.startsWith('fr')) return l === 'fr-ch' ? 'fr-ch' : 'fr';
  return null;
}

/** Applies `toDe` to every string in a structure, including the strings that
    functions return, to derive the German-market copy from the Swiss copy. */
export const deepDe = <T,>(v: T): T => {
  if (typeof v === 'string') return toDe(v) as T;
  if (typeof v === 'function')
    return ((...args: unknown[]) => deepDe((v as (...a: unknown[]) => unknown)(...args))) as T;
  if (Array.isArray(v)) return v.map(deepDe) as T;
  if (v && typeof v === 'object')
    return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, deepDe(x)])) as T;
  return v;
};
