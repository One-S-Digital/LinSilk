import type { CollectionConfig } from 'payload';

/** Payload's own admin login. Separate from Medusa's admin users — two
 * admins is the cost of not being on Shopify (docs/BACKEND-RENDER.md §5). */
export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: { useAsTitle: 'email' },
  fields: [],
};
