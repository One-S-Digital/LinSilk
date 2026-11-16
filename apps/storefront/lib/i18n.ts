/* Languages and their hreflang codes (docs/seo/SEO-GEO-PLAN.md §6.7). English
 * is the root and the x-default; German and French sit under /de/ and /fr/.
 * There is one German (standard German, with ß) and one French: the Swiss
 * variants (/de-ch/, /fr-ch/) were removed on 2026-11-16 and redirect. */

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

/* The German pages are the written German (kept in the DE_CH tables from
   before the Swiss variant was removed) put into standard spelling: Maß, ß, and
   "innerhalb" for "innert". New German copy is written directly in standard
   German and needs no conversion. */
export const toDe = (s: string) =>
  s
    .replace(/Mass/g, 'Maß')
    .replace(/[Gg]ross/g, (m) => `${m[0]}roß`)
    .replace(/rösse/g, 'röße')
    .replace(/[Aa]ussen/g, (m) => `${m[0]}ußen`)
    .replace(/[Aa]usser/g, (m) => `${m[0]}ußer`)
    .replace(/heiss/g, 'heiß')
    .replace(/[Ww]eiss/g, (m) => `${m[0]}eiß`)
    .replace(/[Ss]chliess/g, (m) => `${m[0]}chließ`)
    .replace(/innert (?=\d)/g, 'in ')
    .replace(/innert /g, 'innerhalb ');

/** The spoken-language families, for choosing a suggestion from a browser. */
export function suggestLocale(browserLanguage: string): Locale | null {
  const l = browserLanguage.toLowerCase();
  if (l.startsWith('de')) return 'de';
  if (l.startsWith('fr')) return 'fr';
  return null;
}

/** Applies `toDe` to every string in a structure, including the strings that
    functions return, to derive the German-market copy from the Swiss copy.
    Text handed to a function (an email address, a name, a code) is the
    reader's own and comes back exactly as it went in. */
export const deepDe = <T,>(v: T): T => {
  if (typeof v === 'string') return toDe(v) as T;
  if (typeof v === 'function') {
    const fn = v as (...a: unknown[]) => unknown;
    return ((...args: unknown[]) => {
      const kept: string[] = [];
      const guarded = args.map((a) => {
        if (typeof a !== 'string' || a === '') return a;
        kept.push(a);
        return `\uE000${kept.length - 1}\uE001`;
      });
      const out = deepDe(fn(...guarded));
      return typeof out === 'string'
        ? out.replace(/\uE000(\d+)\uE001/g, (_, i) => kept[Number(i)])
        : out;
    }) as T;
  }
  if (Array.isArray(v)) return v.map(deepDe) as T;
  if (v && typeof v === 'object')
    return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, deepDe(x)])) as T;
  return v;
};
