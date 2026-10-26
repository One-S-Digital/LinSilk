/* IndexNow: tells Bing (whose index feeds ChatGPT search and Copilot),
 * Yandex, Seznam and Naver the moment a page changes, instead of waiting for
 * the next crawl. Google ignores it and reads the sitemap.
 *
 * The key is public by design: the protocol proves the site owns it by
 * finding the same value at /{key}.txt (public/ce5bdf01….txt). */

/* Explicit .ts: payload's CLI can load this through the Pages hook (see
   lib/catalog.ts on why it needs the literal extension). */
import { SITE_URL } from './house.ts';

export const INDEXNOW_KEY = 'ce5bdf01381568fc0b160ad9dfe3e28f';

/** Submits paths on the live host. Anywhere else (local, preview) it is a
    no-op, so a test edit never reaches a search engine. */
export async function submitToIndexNow(paths: string[]): Promise<boolean> {
  if (process.env.NODE_ENV !== 'production' || process.env.INDEXNOW_DISABLED === '1') return false;
  const urlList = [...new Set(paths)].map((p) => `${SITE_URL}${p}`);
  if (urlList.length === 0) return false;
  try {
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'content-type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: new URL(SITE_URL).host,
        key: INDEXNOW_KEY,
        keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
        urlList,
      }),
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch {
    /* A missed ping only means the next crawl finds the change. */
    return false;
  }
}
