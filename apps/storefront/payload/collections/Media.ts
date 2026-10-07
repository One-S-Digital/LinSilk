import type { CollectionConfig } from 'payload';

/** Photography, once it exists — everything today is a placeholder woven
 * gradient (docs/HANDOVER.md §8). Empty until then. */
export const Media: CollectionConfig = {
  slug: 'media',
  upload: true,
  fields: [{ name: 'alt', type: 'text', required: true }],
};
