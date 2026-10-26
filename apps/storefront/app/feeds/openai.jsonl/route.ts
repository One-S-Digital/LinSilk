import { getPieces } from '@/lib/catalog';
import { openaiFeed } from '@/lib/feed';

/* The ChatGPT product feed, rebuilt hourly like the sitemap. */
export const revalidate = 3600;

export async function GET() {
  return new Response(openaiFeed(await getPieces()), {
    headers: { 'content-type': 'application/x-ndjson; charset=utf-8' },
  });
}
