# Agent-driven catalogue updates

How a new piece, a new photograph or a new season reaches the site without a deploy.

Read `HANDOVER.md` §5 and `BACKEND-RENDER.md` first; this only covers what changes.

---

## 1. Why this needs building at all

The site cannot be updated by any API today, and the reason is not the missing API.

`apps/storefront/lib/catalog.ts` holds `COLLECTIONS` (4) and `PIECES` (71) as TypeScript
literals, and every shop page imports from it. `src/scripts/seed.ts` reads that same file and
pushes it *into* Medusa — so Medusa owns price, currency, stock and the archive gate, but its
titles, materials and metadata are downstream of a source file. The only thing the storefront
asks Medusa about a product at runtime is `getVariantId` (`lib/medusa.ts`), a handle→variant
lookup for the cart.

Adding a piece is therefore a commit and a deploy, and there is nowhere for a photograph to go:
`PieceCard` renders `<ShotFrame note={piece.shot}>`, a CSS woven gradient generated from an
art-direction *sentence*, and seed creates products with no `images` and no `thumbnail`.

So the order of work is fixed: **the storefront reads the catalogue from Medusa, then an
ingestion route, then the MCP server.** An endpoint built before the migration would write to a
database the site does not read.

## 2. Decisions taken

| | |
|---|---|
| **Source of truth** | Medusa. `catalog.ts` keeps types, lookups and the measurement chart; the piece and collection literals move into the seed as a fixture. |
| **Approval** | Agent writes `draft`. A human publishes in the Medusa admin. Nothing an agent writes is ever public unreviewed. |
| **Consumer** | An MCP server, for Claude. No public webhook and no unattended pipeline — if one is wanted later it is the same HTTP route with a second token. |
| **Images** | The agent sends URLs; the backend fetches the bytes and stores them. R2 is **not yet provisioned** — see §7. |

## 3. Shape

```
Claude ──MCP (stdio)──▶ apps/mcp ──HTTP + admin token──▶ /admin/catalogue/*
                                                              │
                                              uploadFilesWorkflow ──▶ R2
                                              createProductsWorkflow
                                                              │
                                                    Medusa (draft) ──▶ human publishes
                                                              │
                                                storefront /store/products
```

The MCP server holds no logic. Every rule lives in the route, because the route is also what a
future pipeline would call, and because the rules are exactly what an agent gets wrong.

## 4. The piece contract

`POST /admin/catalogue/pieces` — upsert, keyed on `handle`, idempotent. Re-posting the same
payload is a no-op update, which is what makes an agent safe to retry.

| Field | Required | Goes to | Notes |
|---|---|---|---|
| `handle` | ✓ | `product.handle` | The catalogue's piece id (`w1`, `m3`). |
| `title` | ✓ | `product.title` | Never a colour, and never "satin": the house sells silk and linen and nothing is sold by colour. |
| `material` | ✓ | `product.subtitle` | Shown under the name on every tile. |
| `cloth` | ✓ on create | `metadata.cloth` | `silk` \| `linen`. It decides which swatches the client chooses their colour from on the piece page (`lib/swatches.ts`). A piece without it cannot be reserved; the page says so. |
| `collection` | ✓ | `collection_id` | A collection handle that must already exist. |
| `group` | ✓ | `metadata.group` | `women` \| `men`. |
| `price_chf` | ✓ on create | variant price | The house prices in francs alone (§6). |
| `length_kinds` | | `metadata.length_kinds` | Which lengths the measurement sheet asks for. Empty is a real answer — a scarf asks for none. |
| `shot` | | `metadata.shot` | Art direction. Kept — it is the `ShotFrame` fallback until the piece is photographed. |
| `sleep` | | `metadata.sleep` | Splits the sleepwear rail. |
| `images[]` | | `product.images` | `{ url, alt }`, at most 8. Left out, photography is untouched — see `images_action` below. |
| `images_action` | | — | What `images[]` does to what the piece already carries: `replace` (default) — the fetched URLs become the whole set, dropping anything not listed; `add` — fetched and appended, refused past 8; `remove` — no fetch, the piece's own already-stored URLs (as `list_pieces` reports them back) are taken off it, refused if one is not actually on the piece. The first image left standing becomes `thumbnail`; none left, it has none. |
| `run_size` | | stock level | The season's capped run for this piece. Defaults to 10. |

The route supplies, so the agent cannot get them wrong: `status: draft`, the single
`Cut / Made to measure` option, the `LINSILK-<HANDLE>` SKU, `manage_inventory: true`,
the sales channel and the shipping profile. No country of origin is set.

It refuses, with the house's own wording: an unknown collection handle, a `length_kinds` value
outside the chart, a handle beginning `commission-` (or a product already filed under either
commission collection, whatever its handle), either commission collection as a target, a new
piece with no price, and any write at all to a piece a human has already published. **A piece is
the agent's to correct only while it is a draft.** Publishing is where ownership changes hands —
not just of the price, of the whole piece — because the route's own `collection_id` write is not
the gate that makes a piece orderable; opening a season is (§5). Once the house has published a
piece, re-posting it, even unchanged, is refused and told to use the admin instead; it is no
longer safe for an agent to retry a payload past that point. Photography is refused too:
`images_action: 'remove'` with no URLs, or with one the piece does not actually carry; `add` or
`replace` past the 8-image cap once fetched.

An `x-medusa-idempotency-key` header is not needed: the handle is the key, and the write is an
upsert either way.

## 5. Seasons

Collections carry no draft status of their own, so `metadata.status` gains a third value:

- `pending` — created by the agent, invisible to the storefront
- `current` — open and orderable (exactly one)
- `past` — readable, never orderable again

`POST /admin/catalogue/seasons` creates a `pending` collection, and upserts an existing one's
wording. A season's **status is never taken from a caller** — sending a field cannot reopen an
archived season — so editorial can be corrected at any point in a season's life while the gate
moves one way.

`GET /admin/catalogue/seasons` lists them with their pieces counted, published and draft apart.
That count is what says whether a season is ready to open, and which pieces are still waiting
on someone.

Promoting is a separate, explicit call — `POST /admin/catalogue/seasons/:handle/open` — which
demotes the outgoing `current` to `past` in the same breath. Both writes go in one
`upsertProductCollections` call, which the product module settles in a single transaction, and
the step restores exactly what it found if anything after it fails
(`src/workflows/catalogue/seasons.ts`). Two opens are serialised behind one lock, which covers
the read of what is `current` as well as the write, so the second reads what the first left
rather than both closing the same season and each opening its own. It refuses to open a season with no *published* piece,
so a rollover cannot land on an empty page or a rail of drafts. Opening a season that is
already open changes nothing and says so, so a caller that lost its answer can ask again.

That call is the one action a human triggers deliberately ("open Autumn V"), rather than
something ingestion does as a side effect.

**Not built:** closing the current season without opening a replacement. The rollover only
happens on `open`. If a season closes before the next one is ready, someone changes its status
in the admin.

## 6. Prices

Set `price_chf`; the route writes it as the variant's one price, in francs. Every region is
priced in francs, so there is no other currency to derive. The agent never sends a
non-franc price.

## 7. Images, and the R2 gap

`medusa-config.ts` switches to `file-s3` only when `S3_BUCKET` is set, and otherwise writes to
`./static` — **which Render wipes on every deploy.** Object storage is a precondition here, not
a later refinement. Setup is in `BACKEND-RENDER.md` §8.5.

For `add` and `replace`, the route fetches each URL server-side and hands the bytes to
`uploadFilesWorkflow` with `access: "public"`, the same path `admin/fabric-catalogues/route.ts`
already uses for catalogues. A piece carries at most 8 images of 15 MB each, accepts `image/*`
only, and rejects a URL it cannot fetch rather than storing a broken reference. `remove` fetches
nothing — it matches the URLs sent against what the piece already carries and drops those.

Fetching by URL means the backend makes outbound requests on an agent's say-so, so the hosts it
will fetch from are named in **`CATALOGUE_IMAGE_HOSTS`**, a comma-separated list. Unset means no
host is allowed and every `add` or `replace` is refused, which is the safe default rather than an
oversight — the refusal names the variable. `remove` needs no host, since it fetches nothing.

Rendering: `ShotFrame` stays. A piece with images renders them; a piece without renders the
woven gradient from `metadata.shot` as it does today. That way the migration does not depend on
photography existing, and the archive's 36 invented pieces keep working.

## 8. MCP tools

`apps/mcp`, stdio, wrapping the routes above. It holds no logic: it carries a call across and
carries the house's own refusal back in the house's own words, because an agent told
*"winter-v has 1 piece(s), none of them published"* can act on it and one told *400* cannot.

| Tool | Calls |
|---|---|
| `list_seasons` | `GET /admin/catalogue/seasons` — status and piece counts |
| `list_pieces` | `GET /admin/catalogue/pieces` — optionally one season |
| `upsert_piece` | `POST /admin/catalogue/pieces` |
| `attach_images` | the same route — `handle`, `images`, and `action`: `add` (default), `replace` or `remove` |
| `create_season` | `POST /admin/catalogue/seasons` |
| `open_season` | the rollover of §5 |

**No publish tool.** Publishing is the human gate and happens in the Medusa admin. `open_season`
is the one tool that changes what the public sees, and its description tells the agent to
confirm with a person first.

### Its credential

A **secret** API key made for the agent in the Medusa admin (Settings → Secret API Keys) —
its own credential, not a person's, and revocable on its own. Medusa accepts secret keys over
HTTP Basic only; sent as a Bearer token they are refused.

The key reaches `/admin/catalogue/*` and nothing else (`BACKEND-RENDER.md` §8.6).
`src/api/middlewares.ts` refuses a secret key on every other admin path before any route runs,
so it can't read an order, a customer or a commission, or mint another key. It holds however
well Medusa's own routes are guarded, and some in 2.20 aren't. A *person* calling the catalogue
routes still needs `catalogue:read`, `catalogue:update` or `catalogue:open` from their role.
`integration-tests/http/roles.spec.ts` walks every admin route Medusa ships with an agent key
and fails if any of them lets it in.

The key sits in plain text in the Claude config on the machine that runs the agent. Keep that
file out of git, point `MEDUSA_URL` at an `https://` address (Basic auth sends the key readably
over plain http), and leave `open_season` on "ask every time" in the client. That tool is the
one that changes what the public can buy, and its "confirm with a person" is only advice in
its description.

```json
{
  "mcpServers": {
    "linsilk": {
      "command": "node",
      "args": ["--experimental-strip-types", "apps/mcp/src/index.ts"],
      "env": {
        "MEDUSA_URL": "https://<the backend>",
        "MEDUSA_ADMIN_API_KEY": "sk_..."
      }
    }
  }
}
```

## 9. Build order

Each step has a check that proves it before the next begins.

1. **R2 bucket + `S3_*` env.** ✔ Upload a catalogue through the existing admin screen; the URL
   survives a redeploy.
2. **Storefront reads Medusa.** ✅ **Done.** `catalog.ts`'s lookups are async reads of
   `/store/products` and `/store/collections` under their old names; the literals moved to
   `apps/medusa/src/scripts/catalogue-fixture.ts`. The two client-side readers carry what they
   need instead of looking it up: the cart reads `shot` and `group` off the product Medusa
   already returns on the line, and the order panel reads `orderable` and `collectionTitle` off
   the piece. ✔ Verified: all 76 prerendered pages are byte-identical to the pre-migration
   build, and `lib/catalog.test.ts` pins the translation — seasons the house has not opened and
   commission silhouettes stay out of the shop, and an unreachable backend returns an empty
   catalogue rather than throwing.
3. **Images in `ShotFrame`.** ✅ **Done** — `ShotFrame` already took a `src` and fell back to the
   weave, so the piece card, the piece gallery and the season rail now pass `piece.images` and
   keep the art-direction note only while a piece has no photograph.
4. **`POST /admin/catalogue/pieces`.** ✅ **Done.** Verified against a live backend: a piece is
   created as a draft and is absent from `/store/products`; re-posting the same payload is a
   no-op; an unknown season, either commission collection, a `commission-` handle, a new piece
   with no price, a length outside the chart, an unlisted image host and an unfetchable URL are
   each refused in the house's own wording; a price move on a published piece is refused while
   a wording correction on the same piece is allowed. Prices are written in francs alone
   (CHF 1'980), the SKU, the `Cut` option, the
   and capped run are all supplied by the route. End to end: two photographs
   posted by URL were stored, the piece published by hand, and the storefront rendered it with
   the photograph while an unphotographed piece beside it kept the placeholder weave.
5. **Seasons + rollover.** ✅ **Done.** Verified against a live backend: a season is created
   `pending` and the storefront renders nothing of it — not in the shop, not in the archive, and
   its draft pieces get no page; opening is refused on an empty season and on one holding only
   drafts; opening promotes and demotes in one call, retires the outgoing season's closing date
   and leaves exactly one `current` across three consecutive rollovers; an archived season is
   not reopened; a holding collection is not a season; and correcting an archived season's
   wording leaves its status alone. The storefront then rendered the new season on `/collection`
   with its own name and numeral, and both closed seasons in the archive.

   `integration-tests/http/catalogue.spec.ts` pins all of the above — 11 cases across the draft
   gate, the price rule and the rollover invariant — and passes. Running it needed the test
   harness repaired first: `@medusajs/core-flows` calls `require("uuid")` without declaring
   uuid, so pnpm handed it the hoisted copy, which is Payload's ESM-only uuid v13. Node can
   `require()` an ESM graph and the server runs; jest's CJS loader cannot, and every spec in
   that directory failed at import. The medusa app now declares its own dual-build uuid and
   `jest.config.js` maps `^uuid$` at its CommonJS entry.
6. **MCP server.** ✅ **Done.** Driven over stdio by a real MCP client: all six tools listed,
   no publish tool among them; a season created, a piece cut for it, a photograph attached by
   URL, one field corrected on its own, the piece published by hand, the season opened — which
   archived the season before it — and the storefront rebuilt showing *Autumn VIII* with the
   photograph on it. Refusals arrive as readable text with `isError`, not as a bare status.

   `attach_images`'s `add`/`replace`/`remove` split was added after this pass, once the first
   version — one implicit action that always replaced the whole set — turned out to contradict
   its own name: a second call meant to add more photographs silently dropped the first batch.
   Pinned by `integration-tests/http/catalogue.spec.ts`'s "a piece's photography" cases rather
   than a live MCP client, since the three actions are the route's own logic and `attach_images`
   only carries the call across.

## 10. Not being built

- A public webhook or unattended pipeline (§2) — the route is ready for one, the token is not.
- An admin widget for the rollover; it is an MCP call plus the admin's metadata editor.
- Moving `care`, `legal` or `seasons` editorial into use — unchanged from `HANDOVER.md` §10.
- Anything that lets an agent publish, change a published price, or archive a season implicitly.
