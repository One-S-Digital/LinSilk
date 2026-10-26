import type { MetadataRoute } from 'next';
import { getPieces, pastCollections } from '@/lib/catalog';
import { languagesFor, LOCALE_PAGES } from '@/lib/edits-i18n';
import { SITE_URL, sitemapPaths } from '@/lib/sitemap-paths';

/* Pieces and seasons come from Medusa and change without a deploy, so the
   sitemap is rebuilt hourly instead of frozen at build time. */
export const revalidate = 3600;
const HOURLY = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [past, pieces] = await Promise.all([pastCollections(HOURLY), getPieces(HOURLY)]);
  /* A page with translations lists every language, itself included (plan §6.7). */
  const entry = (path: string, enPath: string) => {
    const languages = languagesFor(enPath);
    return { url: `${SITE_URL}${path}`, ...(Object.keys(languages).length && { alternates: { languages } }) };
  };
  return [
    ...sitemapPaths(past, pieces).map((path) => entry(path, path)),
    ...LOCALE_PAGES.map(({ path, enPath }) => entry(path, enPath)),
  ];
}
