import { getPieces } from '@/lib/catalog';
import { googleFeed } from '@/lib/feed';

/* Merchant Center fetches this on a schedule. Rebuilt hourly, like the
   sitemap, because pieces and prices change without a deploy. */
export const revalidate = 3600;

export async function GET() {
  return new Response(googleFeed(await getPieces()), {
    headers: { 'content-type': 'application/xml; charset=utf-8' },
  });
}
