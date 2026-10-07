import type { CollectionConfig } from 'payload';

/** Editorial per collection, keyed to the Medusa collection handle (e.g.
 * "autumn-iv") rather than a relation — Medusa and Payload keep separate
 * databases. Schema only: nothing renders this yet, and no page currently
 * carries more than the one-line `collection.note` already in Medusa
 * metadata. */
export const Seasons: CollectionConfig = {
  slug: 'seasons',
  admin: { useAsTitle: 'title' },
  fields: [
    { name: 'handle', type: 'text', required: true, unique: true },
    { name: 'title', type: 'text', required: true },
    { name: 'body', type: 'textarea', required: true },
  ],
};
