/* Payload, as Server Components see it. The Cloth / house pages
   used to read their copy straight from lib/catalog.ts's STORY constant;
   that copy now lives in Payload's `pages` collection (seeded by
   payload/seed.ts) and is read from here instead. */

import { cache } from 'react';
import { getPayload } from 'payload';
import config from '@payload-config';
import type { StoryKey } from '@/lib/catalog';

const payloadFind = async (key: StoryKey) => {
  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: 'pages',
    where: { key: { equals: key } },
    limit: 1,
  });
  return docs;
};

/* Deduped per request: generateMetadata and the page body both ask for the
   same key, and this makes that one query rather than two. */
export const getStoryPage = cache(async (key: StoryKey) => {
  /* These pages are rendered at build time, so an unreachable Payload is a
     build failure rather than a bad request — and the two causes look the
     same from here unless the connection one says so itself. */
  let docs: Awaited<ReturnType<typeof payloadFind>>;
  try {
    docs = await payloadFind(key);
  } catch (error) {
    throw new Error(
      `Payload could not be read for "${key}": ${(error as Error).message}. ` +
        'Check DATABASE_URI points at a reachable linsilk_payload database.',
    );
  }

  const doc = docs[0];
  if (!doc) {
    throw new Error(
      `Payload has no "pages" document for "${key}" — run the seed script ` +
        '(pnpm --filter storefront exec payload run ./payload/seed.ts).',
    );
  }
  return doc;
});
