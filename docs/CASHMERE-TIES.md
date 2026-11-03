# Cashmere and ties — what was built, what was assumed, how to ship

Built 2026-11-01 on the `backend` branch, uncommitted at the time of writing. The pipeline's own spec for this is `WEBSITE_CHANGES_CASHMERE_TIES.md` in the catalogue folder; this file records what the code now does.

## What changed

**Cloth.** `Cloth` is `'silk' | 'linen' | 'cashmere'` (`lib/catalog.ts`). `readPiece` accepts it, so a cashmere piece is orderable. Twelve swatches `LS-C01…C12` live in `lib/swatches.ts` with 480×480 webp files in `public/swatches/cashmere/` (clean renders, not the watermarked finals). `COLOURS.cashmere` is 12 (`lib/house.ts`). Colour names are translated in `lib/i18n-order.ts`.

**The silk fall-through is gone.** Every `cloth === 'linen' ? … : silk` is a lookup now: Product schema (`lib/jsonld.ts`), both feeds (`lib/feed.ts`), the piece page metadata and body (`app/piece/[id]/page.tsx`, `components/piece-view.tsx`, `app/[locale]/[...path]/page.tsx`). Shared sentence helpers (`schemaDescription`, `feedDescription`, `madeToMeasureSuffix` in `lib/garments.ts`; `fibre`, `coloursOf` in `lib/house.ts`).

**Garment kinds.** `garmentType()` has two new kinds: `cashmere-pants` (men and women; its own question set, no "does linen crease") and `tie`. Women's pants no longer fall through to "dress".

**Per-piece colours.** A piece may carry `metadata.swatches` (swatch codes). `swatchesFor(cloth, only)` honours it, the picker, the dialog and the "N colours" line follow it, and a code from another cloth is ignored. Absent, the whole cloth is offered, so every existing piece is unchanged. Plain tie `LS-S01…S15`; patterned tie `LS-J01, J04, J05, J06, J12, J15, J16, J20`.

**Ties are ordered by colour alone.** `metadata.no_measurements: true` → `Piece.noMeasurements`. The order panel then has one step (colour) and goes straight to checkout; the cart row hides the sheet; the backend cart rule (`apps/medusa/src/lib/cart-rules.ts`, `needsNoMeasurements` in `measurements.ts`) does not demand a sheet. Still one per order and still gated by the season. A piece cannot carry both `no_measurements` and `length_kinds` (the ingestion route refuses it). Ties get their own page text (no "made to measure", no measuring steps), alt text (`imageAlt`: rolled tie, flat, close-up, back with the LINSILK label) and Product schema description.

**Ingestion and MCP.** `cloth` accepts `cashmere`; `swatches` and `no_measurements` are new fields on `POST /admin/catalogue/pieces`, `list_pieces` reports them, and `upsert_piece` sends them.

**Pages, SEO and GEO.**
- **No new collection pages (owner, 2026-11-01).** The cashmere pants and the ties are listed on the existing `/collection/women` and `/collection/men` pages like every other piece. (A first version had `/collection/cashmere` and `/collection/men/ties`; both were removed.)
- `/collection/men/trousers` stays a linen page; its URL is unchanged.
- Piece titles, glossary (`lib/piece-names.ts`) and category labels say **pants**. The glossary keys were renamed to the "pants" titles; a title still written "trousers" resolves to the same entry, and an old `/piece/…-trousers` link finds its piece and 301s to the new address (`findPiece`).
- **House claims say "silk, linen and high frequency fabrics"** (owner, 2026-11-01; German "hochfrequente Stoffe", French "tissus à haute fréquence"), and cashmere is named where the claim is about the cloth itself (the /cloth page, colour counts, care, the cashmere piece pages). It is in the home, About, `/made-to-measure`, `/cloth`, Questions, legal notice, footer, collection pages, `ENTITY`, `public/llms.txt` and the feed channel description. `llms.txt` lists the two new pages.
- Merchant feeds: cashmere is `g:material cashmere` and `Men > Cashmere > Cashmere pants`; ties are `Clothing Accessories > Neckties`, titled without "made to measure".

**Design Your Own** (`components/commission-flow.tsx`, cloth step): above the catalogues there is a "house cloths" picker, Silk / Linen / Cashmere, then that cloth's swatches. Choosing a colour writes its English name and code into the cloth box (for example "Camel cashmere (LS-C05)"), which stays editable; the backend still receives plain text, so nothing changed there. The page title, description and "every commission is made in…" line say silk, linen or cashmere in all three languages.

**Payload.** The English /cloth page and "The house" page are stored in Payload, seeded from `STORY` in `lib/catalog.ts`, which now says three cloths and mentions cashmere. To update them: `pnpm --filter storefront seed:pages` (script added to `package.json`; it runs `payload/seed.ts`, which updates the existing documents in place and is safe to re-run). It needs `DATABASE_URI` for the Payload database. It overwrites those two pages with the code's text, so run it before anyone edits them in the admin, or edit them in the admin instead. The German and French /cloth pages are in code and need no step.

**Adding the pieces to Medusa.** `tools/post_pieces.py` in the catalogue folder reads the current season from the backend and posts the six pieces as drafts to it (`--dry` shows the payloads). It needs `MEDUSA_ADMIN_API_KEY` and the backend deployed with this change first (the live route does not yet accept `cashmere`, `swatches` or `no_measurements`).

**Tests.** 113 storefront tests pass (new: `garments-cashmere.test.ts`, cashmere/tie cases in `catalog`, `feed`, `swatches`); backend `cart-rules` spec has the tie cases (run here through vitest, because `@medusajs/utils` is not installed in this checkout so jest cannot start). `tsc --noEmit` is clean on the storefront; `next build` compiles and type-checks but cannot prerender here without the Payload Postgres.

## Assumptions (1–4 confirmed by the owner on 2026-11-01; 5–6 still open)

1. **Ties: one standard length, colour only.** No length in cm is stated anywhere on the site; only "classic width, about 8 cm at the widest part of the broad blade" (from the label scale). The tie "making time" says "Made to order and dispatched from Geneva", not 2–4 weeks.
2. **Cashmere is not called "100% cashmere".** `PURE` in `lib/house.ts` is `{ silk: true, linen: true, cashmere: false }`; set `cashmere: true` once the composition is confirmed and every title, description, feed and schema line follows.
3. **Cashmere care** reuses the silk and linen line (cool hand-wash, dry flat out of direct sun, no tumble dryer). It is not the owner's wording.
4. **Material lines** (under the name on every tile) are proposals in `site_import/pieces.json` in the catalogue folder.
5. **German and French copy** for all of the above has had no native-speaker read, like the rest (SEO plan §13.7).
6. The piece description on a cashmere page still says hem, facings and lining are finished by hand, as on every made-to-measure piece.

## Deliberately not changed

- The measurement chart label "Trouser length" and the `trouser` length kind (the backend and a parity test pin them), and code identifiers such as `'trousers'`, `men/trousers`.
- `docs/seo/*` still describe silk and linen only.

## Shipping

1. Merge, deploy the storefront and Medusa (the backend change is the cart rule and the route fields).
2. Host the photographs on a host in `CATALOGUE_IMAGE_HOSTS`, then run `tools/post_pieces.py --images-base <that host/folder>` (or the MCP `upsert_piece` and `attach_images` with `site_import/pieces.json`): handles `071`–`076`, CHF 169 ×4 and 65 ×2, into the current season. A person publishes them in the Medusa admin.
3. The Payload pages update themselves: the storefront's `build` script runs the seed before `next build`, so the deploy in step 1 does it (`pnpm --filter storefront seed:pages` still runs it by hand).
4. After publishing: `/piece/silk-tie` etc. return 200, the sitemap lists the pieces and both new pages, `/feeds/google.xml` and `/feeds/openai.jsonl` carry them, and IndexNow fires from the product subscriber.
