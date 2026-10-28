/* Where each translated page lives (docs/seo/SEO-GEO-PLAN.md §6.7). Data
 * only, so the browser can use it too (language switcher, suggestion banner).
 * The key is the English path; /de-ch/ and /de/ share a slug, /fr-ch/ and /fr/
 * share a slug. The copy itself is in lib/edits-i18n.ts and lib/pages-i18n.ts. */

import { absolute } from './house';
import { HREFLANG, LOCALES, type Lang, type Locale } from './i18n';
import { PIECE_NAMES } from './piece-names';
import { slugify } from './slug';

export const ROUTES: Record<string, { de: string; fr: string }> = {
  '/': { de: '', fr: '' },
  '/made-to-measure': { de: 'nach-mass', fr: 'sur-mesure' },
  '/about': { de: 'ueber-uns', fr: 'a-propos' },
  '/cloth': { de: 'stoff', fr: 'tissu' },
  '/care/questions': { de: 'fragen', fr: 'questions' },
  '/care/shipping': { de: 'versand', fr: 'livraison' },
  '/care/returns': { de: 'rueckgabe', fr: 'retours' },
  '/care/measuring': { de: 'masse-nehmen', fr: 'prendre-ses-mesures' },
  '/contact': { de: 'kontakt', fr: 'contact' },
  '/design': { de: 'selbst-entwerfen', fr: 'creer-sur-mesure' },
  '/collection': { de: 'kollektion', fr: 'collection' },
  '/collection/women': { de: 'kollektion/damen', fr: 'collection/femmes' },
  '/collection/men': { de: 'kollektion/herren', fr: 'collection/hommes' },
  '/collection/women/silk': { de: 'kleider/seide', fr: 'robes/soie' },
  '/collection/women/silk-separates': { de: 'seide/roecke-blusen', fr: 'soie/jupes-chemisiers' },
  '/collection/women/linen': { de: 'leinen/sets-damen', fr: 'lin/ensembles-femme' },
  '/collection/sleepwear': { de: 'schlafmode/seide', fr: 'pyjamas/soie' },
  '/collection/men/shirts': { de: 'herren/leinenhemden', fr: 'hommes/chemises-lin' },
  '/collection/men/trousers': { de: 'herren/leinenhosen', fr: 'hommes/pantalons-lin' },
  '/occasion/wedding-guest': { de: 'anlass/hochzeitsgast', fr: 'occasion/invitee-mariage' },
};

/** The first path segment for a piece: /de-ch/stueck/{slug}, /fr/piece/{slug}. */
export const PIECE_SEGMENT = { de: 'stueck', fr: 'piece' } as const;

export const familyOf = (locale: Locale) => (locale.startsWith('de') ? 'de' : 'fr');

export const localePath = (locale: Locale, slug: string) => `/${locale}${slug ? `/${slug}` : ''}`;

/** The page's address in a locale, or undefined when it has no translation. */
export const translatedPath = (locale: Locale, enPath: string) => {
  const r = ROUTES[enPath];
  return r ? localePath(locale, r[familyOf(locale)]) : undefined;
};

export const piecePath = (locale: Locale, slug: string) =>
  `/${locale}/${PIECE_SEGMENT[familyOf(locale)]}/${slug}`;

/** The English path a locale address translates, or undefined. */
export function enPathOf(locale: Locale, slug: string): string | undefined {
  const family = familyOf(locale);
  return Object.keys(ROUTES).find((p) => ROUTES[p][family] === slug);
}

/** Every language of a page keyed by hreflang, for `<link rel="alternate">`
    and the sitemap; empty when the page has no translation. */
export function languagesFor(enPath: string): Record<string, string> {
  if (!ROUTES[enPath]) return {};
  const out: Record<string, string> = {
    en: absolute(enPath),
    'x-default': absolute(enPath),
  };
  for (const locale of LOCALES) {
    for (const code of HREFLANG[locale]) out[code] = absolute(translatedPath(locale, enPath)!);
  }
  return out;
}

/** The same alternates for a piece, from its English slug and its translated
    slugs. */
export function pieceLanguages(enSlug: string, slugs: Record<Locale, string>) {
  const out: Record<string, string> = {
    en: absolute(`/piece/${enSlug}`),
    'x-default': absolute(`/piece/${enSlug}`),
  };
  for (const locale of LOCALES) {
    for (const code of HREFLANG[locale]) out[code] = absolute(piecePath(locale, slugs[locale]));
  }
  return out;
}

/* Every piece's slug in each language, from the name glossary. The English
   slug is the slug of the English title, which is what a piece gets unless its
   Medusa `metadata.slug` overrides it. */
const PIECE_SLUGS = Object.entries(PIECE_NAMES).map(([title, n]) => ({
  en: slugify(title),
  de: slugify(n.de),
  fr: slugify(n.fr),
}));

/** The same piece's address in `to`, or undefined when the path is not a piece. */
function switchPiece(clean: string, from: Lang, to: Lang): string | undefined {
  const parts = clean.split('/').filter(Boolean);
  let slug: string | undefined;
  if (from === 'en') {
    if (parts.length === 2 && parts[0] === 'piece') slug = parts[1];
  } else if (parts.length === 3 && parts[1] === PIECE_SEGMENT[familyOf(from)]) {
    slug = parts[2];
  }
  if (!slug) return undefined;
  const key = (l: Lang) => (l === 'en' ? 'en' : familyOf(l));
  const found = PIECE_SLUGS.find((p) => p[key(from)] === slug);
  if (!found) return to === 'en' ? '/collection' : `/${to}`;
  return to === 'en' ? `/piece/${found.en}` : piecePath(to, found[key(to)]);
}

/** Where the same page lives in `to`, from the current path in `from`. Used by
    the language switcher; falls back to the language's home. */
export function switchPath(pathname: string, from: Lang, to: Lang): string {
  const clean = pathname.replace(/\/$/, '') || '/';
  if (from === to) return clean;
  const piece = switchPiece(clean, from, to);
  if (piece) return piece;
  let en: string | undefined;
  if (from === 'en') en = clean;
  else {
    const slug = clean.slice(`/${from}`.length).replace(/^\//, '');
    en = enPathOf(from, slug);
  }
  if (to === 'en') return en ?? '/';
  return (en && translatedPath(to, en)) || `/${to}`;
}

/** A link to `enPath` in the reader's language: the translation when there is
    one, otherwise the English page. */
export const localHref = (lang: Lang, enPath: string) =>
  lang === 'en' ? enPath : (translatedPath(lang, enPath) ?? enPath);
