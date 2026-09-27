/* Payload 3, installed into the Next app rather than run as a fifth service
 * (docs/BACKEND-RENDER.md §5). Its own Postgres database, linsilk_payload, sits
 * alongside Medusa's linsilk_medusa on the same server (docker/init-db.sql).
 */

import path from 'path';
import { fileURLToPath } from 'url';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { buildConfig } from 'payload';
import sharp from 'sharp';

/* Explicit .ts extensions: payload's CLI (generate:importmap, generate:types,
   run) loads this config outside Next's own bundler and needs the literal
   extension to resolve a nested relative import — an open issue against
   Payload under Next 16 (github.com/payloadcms/payload/issues/16684).
   allowImportingTsExtensions in tsconfig.json permits the syntax. */
import { Users } from './payload/collections/Users.ts';
import { Media } from './payload/collections/Media.ts';
import { Pages } from './payload/collections/Pages.ts';
import { Care } from './payload/collections/Care.ts';
import { Legal } from './payload/collections/Legal.ts';
import { Seasons } from './payload/collections/Seasons.ts';

const dirname = path.dirname(fileURLToPath(import.meta.url));

/* Payload signs its admin sessions with this. An empty one signs nothing, so
   in production it is checked here rather than discovered by whoever notices
   the admin lets them in — the same stance medusa-config.ts takes. */
const secret = process.env.PAYLOAD_SECRET || '';
if (!secret && process.env.NODE_ENV === 'production') {
  throw new Error(
    'PAYLOAD_SECRET is not set. In production it comes from the host’s environment ' +
      '(on Render, the storefront service’s own variable), not from a file.',
  );
}

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: dirname },
  },
  collections: [Users, Media, Pages, Care, Legal, Seasons],
  secret,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI,
      /* `next build` renders these pages, so an unreachable database is a
         failed build. Ten seconds is long enough for a cold Postgres and
         short enough that it fails saying so, rather than sitting on a
         socket until the page builder gives up on it. */
      connectionTimeoutMillis: 10_000,
    },
  }),
  sharp,
});
