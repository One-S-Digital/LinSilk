import type { MetadataRoute } from 'next';
import { getPieces, pastCollections } from '@/lib/catalog';
import { SITE_URL, sitemapPaths } from '@/lib/sitemap-paths';

/* Pieces and seasons come from Medusa and change without a deploy, so the
   sitemap is rebuilt hourly instead of frozen at build time. */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [past, pieces] = await Promise.all([pastCollections(), getPieces()]);
  return sitemapPaths(past, pieces).map((path) => ({ url: `${SITE_URL}${path}` }));
}
