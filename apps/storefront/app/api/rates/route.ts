import { ECB_URL, parseEcb } from '@/lib/exchange';

/* The ECB's daily rates, as francs-to-currency figures, for the approximate
   prices shown beside a franc price. The ECB's file is fetched at most once an
   hour for everyone. If it cannot be read the answer is "no rates" and the
   page simply shows francs, which is always correct. */

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const response = await fetch(ECB_URL, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(5000),
    });
    const parsed = response.ok ? parseEcb(await response.text()) : null;
    return Response.json(parsed ?? { rates: null }, {
      headers: { 'cache-control': parsed ? 'public, max-age=600' : 'no-store' },
    });
  } catch {
    return Response.json({ rates: null }, { headers: { 'cache-control': 'no-store' } });
  }
}
