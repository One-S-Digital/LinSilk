import type { MetadataRoute } from 'next';
import { getPieces, pastCollections } from '@/lib/catalog';
import { LOCALES } from '@/lib/i18n';
import { languagesFor, ROUTES, translatedPath } from '@/lib/locale-routes';
import { pieceAlternates, piecePathIn } from '@/lib/piece-i18n';
import { SITE_URL, sitemapPaths } from '@/lib/sitemap-paths';

/* Pieces and seasons come from Medusa and change without a deploy, so the
   sitemap is rebuilt hourly instead of frozen at build time. */
export const revalidate = 3600;
const HOURLY = 3600;

type Languages = Record<string, string>;
const entry = (path: string, languages: Languages = {}) => ({
  url: `${SITE_URL}${path}`,
  ...(Object.keys(languages).length && { alternates: { languages } }),
});

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [past, pieces] = await Promise.all([pastCollections(HOURLY), getPieces(HOURLY)]);
  const open = pieces.filter((p) => !p.retired);
  const bySlug = new Map(open.map((p) => [`/piece/${p.slug}`, p]));

  /* A page with translations lists every language, itself included (plan §6.7). */
  const english = sitemapPaths(past, pieces).map((path) => {
    const piece = bySlug.get(path);
    return entry(path, piece ? pieceAlternates(piece) : languagesFor(path));
  });
  const translated = [
    ...Object.keys(ROUTES).flatMap((enPath) =>
      LOCALES.map((l) => entry(translatedPath(l, enPath)!, languagesFor(enPath))),
    ),
    ...open.flatMap((p) => LOCALES.map((l) => entry(piecePathIn(l, p), pieceAlternates(p)))),
  ];
  /* Two pieces whose translated names slug the same would list one address
     twice (and the page would resolve to the first); list it once. */
  const seen = new Set<string>();
  return [...english, ...translated].filter((e) => !seen.has(e.url) && seen.add(e.url));
}
