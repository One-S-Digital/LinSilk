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
