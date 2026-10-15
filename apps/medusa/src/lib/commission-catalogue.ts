/* A commission is quoted by a person, never bought from a page, so the
   silhouettes the house offers are kept as products in their own collection:
   the admin can edit a name, a note or an opening figure without a deploy.

   The collection's `metadata.status` is neither `current` nor `past`, so the
   archive gate refuses to put a silhouette in a cart. */
export const SILHOUETTE_COLLECTION = "commission-silhouettes"

/* A quoted commission becomes a product of its own: one variant, priced at
   the figure the tailor set, with a stock of exactly one — a capped run of
   one, which is what a commission is. That is what makes the payment an
   ordinary order the bench can fulfil, and what stops a link being paid
   twice.

   Its collection is marked `commission`, which the archive gate allows:
   buying one of these is paying the quote, at the price on it. */
export const COMMISSION_COLLECTION = "commissions"
