import type { CollectionConfig } from 'payload';

/** The Cloth, The house. Flat editorial — one lead line and two
 * paragraphs each — seeded from the storefront's STORY constant
 * (lib/catalog.ts) by payload/seed.ts, and read from here by
 * lib/payload.ts's getStoryPage from here on. */
export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: { useAsTitle: 'title' },
  fields: [
    {
      name: 'key',
      type: 'select',
      required: true,
      unique: true,
      options: ['cloth', 'contact'],
    },
    { name: 'title', type: 'text', required: true },
    { name: 'lead', type: 'textarea', required: true },
    { name: 'a', type: 'textarea', required: true },
    { name: 'b', type: 'textarea', required: true },
  ],
};
