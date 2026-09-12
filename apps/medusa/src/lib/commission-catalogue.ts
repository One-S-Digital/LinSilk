/* A commission is quoted by a person, never bought from a page, so the
   silhouettes the house offers are kept as products in their own collection:
   the admin can edit a name, a note or an opening figure without a deploy,
   and the exchange-rate job keeps their euro and sterling figures derived
   from the franc.

   The collection's `metadata.status` is neither `current` nor `past`, so the
   archive gate refuses to put a silhouette in a cart. */
export const SILHOUETTE_COLLECTION = "commission-silhouettes"
