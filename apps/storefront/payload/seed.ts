/* Seeds Payload's `pages` collection — Atelier, Cloth, The house — from the
 * storefront's own lib/catalog.ts. STORY is the same constant the pages
 * rendered from directly before the CMS existed; from here on it is the
 * seed's input only (lib/payload.ts reads the copy back from Payload).
 *
 *   pnpm --filter storefront exec payload run ./payload/seed.ts
 *
 * Safe to run again: a key that already exists is updated in place, brought
 * back in line with STORY, rather than duplicated.
 *
 * This directory is its own ESM package (payload/package.json) and every
 * value import below is dynamic, in that order, for one reason: `payload run`
 * only waits for a script that genuinely top-level-awaits (an open quirk —
 * without it the CLI exits 0 the instant getPayload() is called, before the
 * connection settles), and payload.config.ts reads DATABASE_URI /
 * PAYLOAD_SECRET the moment it's evaluated, so the env file has to load
 * before that import runs rather than at the top of this file in the usual
 * order. Next itself never takes this path — it loads .env.local before any
 * app code, this file included. */

import type { StoryKey } from '../lib/catalog.ts';

process.loadEnvFile('.env.local');

const { getPayload } = await import('payload');
const { default: config } = await import('../payload.config.ts');
const { STORY } = await import('../lib/catalog.ts');

async function seed() {
  const payload = await getPayload({ config });

  for (const key of Object.keys(STORY) as StoryKey[]) {
    const story = STORY[key];
    const data = { key, title: story.title, lead: story.lead, a: story.a, b: story.b };

    const { docs } = await payload.find({
      collection: 'pages',
      where: { key: { equals: key } },
      limit: 1,
    });

    if (docs[0]) {
      await payload.update({ collection: 'pages', id: docs[0].id, data });
      console.log(`pages: updated "${key}"`);
    } else {
      await payload.create({ collection: 'pages', data });
      console.log(`pages: created "${key}"`);
    }
  }
}

await seed();
process.exit(0);
