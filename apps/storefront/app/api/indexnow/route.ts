import { findPiece } from '@/lib/catalog';
import { submitToIndexNow } from '@/lib/indexnow';

/* Called by the Medusa backend when a product is created or edited
   (apps/medusa/src/subscribers/product-changed.ts), with the product's
   handle. The storefront owns the address a piece is published at, so the
   URL is worked out here rather than in the backend. Guarded by a shared
   secret: without it anyone could make the site ping search engines. */
export async function POST(request: Request) {
  const secret = process.env.INDEXNOW_SECRET;
  if (!secret) return Response.json({ error: 'not configured' }, { status: 503 });
  if (request.headers.get('x-indexnow-secret') !== secret) {
    return Response.json({ error: 'forbidden' }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as { handles?: unknown } | null;
  const handles = Array.isArray(body?.handles)
    ? body.handles.filter((h): h is string => typeof h === 'string')
    : [];

  const paths: string[] = [];
  for (const handle of handles) {
    const piece = await findPiece(handle);
    if (piece) paths.push(`/piece/${piece.slug}`, `/collection/${piece.group}`);
  }
  const sent = await submitToIndexNow(paths);
  return Response.json({ submitted: sent ? paths : [] });
}
