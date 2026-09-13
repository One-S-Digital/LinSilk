import type { CollectionConfig } from 'payload';

/** Terms, Privacy. Schema only, same reasoning as Care — and there is nothing
 * real to put in it yet regardless: both pages are structural placeholders
 * awaiting a lawyer, deliberately not drafted (docs/HANDOVER.md §8). Not yet
 * read by any route. */
export const Legal: CollectionConfig = {
  slug: 'legal',
  admin: { useAsTitle: 'title' },
  fields: [
    {
      name: 'key',
      type: 'select',
      required: true,
      unique: true,
      options: ['terms', 'privacy'],
    },
    { name: 'title', type: 'text', required: true },
    { name: 'lead', type: 'textarea', required: true },
  ],
};
