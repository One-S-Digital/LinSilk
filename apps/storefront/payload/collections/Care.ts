import type { CollectionConfig } from 'payload';

/** Shipping, Measurement guide, Returns and alterations, Questions.
 *
 * Schema only for now. The four /care pages still render their own hand-built
 * sections, lists and comparison rows (components/doc-page.tsx) — moving that
 * structure into Payload needs a content model for sections/lists/rows, which
 * is separate work from standing the CMS up. This collection is not yet read
 * by any route. */
export const Care: CollectionConfig = {
  slug: 'care',
  admin: { useAsTitle: 'title' },
  fields: [
    {
      name: 'key',
      type: 'select',
      required: true,
      unique: true,
      options: ['shipping', 'measuring', 'returns', 'questions'],
    },
    { name: 'title', type: 'text', required: true },
    { name: 'lead', type: 'textarea', required: true },
  ],
};
