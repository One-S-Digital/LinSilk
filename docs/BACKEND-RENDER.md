# LinSilk — Backend Build & Render Deployment

**Goal:** stand up Medusa v2 + Payload 3, wire the existing storefront to it, and host the whole
thing on Render.

**Prerequisite reading:** `docs/HANDOVER.md` §5 (the domain model). The storefront's `lib/` layer
was written for this handover — the backend should conform to it, not the reverse.

> **Version note.** Medusa v2 moves quickly. Config keys, module names and package versions below
> are the *shape* of the answer; check each against the Medusa docs at build time rather than
> pasting blind. Anything marked ⚠ is a decision, not a step.

---

## 1. Architecture on Render

| Render service | Type | What it is |
|---|---|---|
| `linsilk-medusa` | Web Service (Node) | Medusa server — Store API, Admin API, Admin UI |
| `linsilk-worker` | Background Worker | Medusa in worker mode — events, subscribers, scheduled jobs |
| `linsilk-postgres` | Postgres | Two databases: `linsilk_medusa`, `linsilk_payload` |
| `linsilk-redis` | Key Value | Event bus + workflow engine |
| `linsilk-storefront` | Web Service (Node) | The Next.js app, with Payload mounted at `/admin` |

**Why a separate worker.** Medusa runs `server` and `worker` as distinct modes. Running both in
one process means a long subscriber (an atelier notification, a file transcode) blocks HTTP
requests. Split them from day one; retrofitting is worse.

**Storefront hosting.** Vercel is the smoother path for Next.js, and moving it there later costs
nothing — it is a separate service either way. Render keeps the whole estate in one bill and one
private network. Either is defensible; pick one and note it here.

---

## 2. Phase 1 — Scaffold Medusa locally

```bash
cd apps
pnpm dlx create-medusa-app@latest medusa --skip-db --no-browser
```

If the interactive prompts get in the way, scaffold manually: `@medusajs/medusa`,
`@medusajs/framework`, `@medusajs/admin-sdk`, `@medusajs/cli`, a `medusa-config.ts`, and a
`src/` tree of `api/ modules/ subscribers/ workflows/ links/`.

Bring the local services up:

```bash
pnpm services        # docker-compose.yml already defines Postgres 16 + Redis 7
```

`docker/init-db.sql` already creates `linsilk_payload` alongside `linsilk_medusa`.

Local `apps/medusa/.env`:

```bash
DATABASE_URL=postgres://linsilk:linsilk@localhost:5432/linsilk_medusa
REDIS_URL=redis://localhost:6379
JWT_SECRET=<openssl rand -base64 32>
COOKIE_SECRET=<openssl rand -base64 32>
STORE_CORS=http://localhost:3000
ADMIN_CORS=http://localhost:9000
AUTH_CORS=http://localhost:3000,http://localhost:9000
```

```bash
pnpm --filter medusa exec medusa db:migrate
pnpm --filter medusa exec medusa user -e you@onesdigital.com -p <password>
pnpm --filter medusa dev
```

**Verify:** admin loads at `localhost:9000/app`, and `GET localhost:9000/health` returns OK.

---

## 3. Phase 2 — Model the domain

### 3.1 Regions and currencies

Three regions. This is the thing Shopify would have charged a plan tier for.

| Region | Currency | Countries | Notes |
|---|---|---|---|
| Switzerland | CHF | ch | Base. Duty included. |
| Europe | CHF | at, be, de, dk, es, fr, ie, it, lu, nl, pt, se | Duty included per house copy ⚠ |
| International | CHF | gb, us, sg, jp, au | Duty payable on arrival |

⚠ **The duty claim needs an accountant before go-live.** Switzerland is outside the EU customs
union and the goods are made outside both. See `HANDOVER.md` §8.

### 3.2 Collections

Map `lib/catalog.ts`'s `Collection` onto a Medusa **product collection**:

| Storefront field | Medusa |
|---|---|
| `slug` | `handle` |
| `title` | `title` |
| `status` | `metadata.status` — `current` \| `past` |
| `season`, `number`, `note`, `closes` | `metadata.*` |

`metadata.status` is load-bearing. `isOrderable()` derives from it, and the storefront refuses
to render a reserve form for a piece in a `past` collection. **The backend must enforce the same
rule** — never trust the client for this. Reject any cart line whose product belongs to a `past`
collection.

### 3.3 Pieces

Each piece is a **product with exactly one variant**. There are no sizes anywhere in this
business, and modelling one is how you end up fighting the platform later.

| Storefront field | Medusa |
|---|---|
| `id` | `handle` (`w1`, `m3`, …) |
| `name` | `title` |
| `material` | `subtitle` |
| `price` | variant price per region |
| `shot` | `metadata.shot` — art direction, shown as the frame's caption |
| `group` | `metadata.group` — `women` \| `men` |
| `sleep` | `metadata.sleep` |
| `lengthKinds` | `metadata.length_kinds` — a list of `dress` \| `skirt` \| `trouser` \| `top`, absent if none |
| `collection` | collection relation |

`metadata.length_kinds` decides which garment lengths the sheet asks for. Get it wrong and the
atelier receives a dress with no length. It is a **list**, because a set is two garments on one
ticket: a sleep set asks for a top length and a trouser length, and each has its own field
(`measure_lengthTop_cm`, `measure_lengthTrouser_cm`).

### 3.4 Inventory — the capped run

Stock is a **per-season cap, not a count on a shelf**. Nothing is restocked, ever. Use Medusa's
inventory module with a fixed quantity per variant and no back-in-stock path. When a season
closes, flip `metadata.status` to `past` — that alone should make everything in it unorderable.

### 3.5 The measurement sheet

Fifteen body measurements plus at most one garment length, **stored in centimetres**, ride on
the line item. `lib/measurements.ts` already emits the exact payload:

```ts
toLineItemMetadata(values, unit, zones)
// → { measurement_unit: 'cm' | 'in', measure_bust_cm: '96.52', … }
```

The backend keeps its own copy of the zones in `apps/medusa/src/lib/measurements.ts`.
`apps/storefront/lib/backend-parity.test.ts` pins the two
together and runs the storefront's real payload through the backend's check, so they cannot
drift.

`measurement_unit` records what the client *saw*; every figure is metric regardless. Keep it that
way — it is the whole point of the conversion fix.

**Validate server-side too.** `RANGES` in `lib/measurements.ts` is the source of truth; port it
to a shared package or duplicate it with a test that pins the two copies together. A cart line
missing a required zone must be rejected — the storefront blocks it, but the storefront is not a
security boundary.

### 3.6 Commissions — built

**A commission is a request for a quote, not a purchase.** Its price is not known until a tailor
has read the brief, so it never enters the cart and nothing is charged on the page. Design Your
Own collects the brief; the house is emailed; a tailor sets a figure and sends it; the client
agrees before anything is cut.

The `atelier` module holds the record (`apps/medusa/src/modules/atelier`), with this lifecycle:

```
submitted → reviewed → quoted → approved → in_production → shipped
```

carrying the client's name and email, the silhouette, the cloth **in the client's own words**,
their note, the reference files, the measurement sheet, the opening figure they were shown, and
the figure the tailor set.

| Route | What it does |
|---|---|
| `POST /store/commissions` | Takes the brief as multipart. Refuses an unknown silhouette or a partial sheet; stores references privately. |
| `GET /store/silhouettes` | The shapes and their opening figures. |
| `GET /store/fabric-catalogues` | The published cloth catalogues. |
| `GET/POST /admin/commissions[/:id]` | The queue, and one brief: set a figure, and send it when ready. |
| `GET/POST/DELETE /admin/fabric-catalogues[/:id]` | Publish, hide and delete a catalogue. |

**The silhouettes are products** in a `commission-silhouettes` collection, so the house edits a
name, a note or an opening figure in the admin rather than in code. The collection's `metadata.status`
is neither `current` nor `past`, so the cart refuses them.

**Accepting a quote is the link in the email.** Setting a figure makes the commission payable by
itself: it becomes a product of its own and the client is emailed an unguessable link to
`app/commission/[token]`, where they say where the piece is going and pay on the house's own
checkout. Paying moves the brief to `in_production` and retires the link. Nothing is sent by hand.

### 3.7 Cloth catalogues — built

The client does not pick cloth from a swatch list: the house publishes catalogues (PDFs or
plates) in the admin, the client reads them, and then **writes down the cloth they chose**. A
shelf is larger than any dropdown, and a client may want the fourth silk on page two.

### 3.8 The atelier console

The bench needs somewhere to read a confirmed sheet and move a piece through production. Medusa
Admin is extensible; add a widget or a route rather than building a second app. Minimum viable:

- Queue of commissions awaiting a quote — **built**
- The full measurement sheet — **built** (the zones live in
  `apps/medusa/src/lib/measurements.ts`, pinned to `lib/catalog.ts` by a storefront test)
- Set confirmed price → notify client — **built**
- Production status per order — not built; the status field exists, the screens do not

### 3.9 Accounts — built

Medusa's own customer and auth modules do almost all of it — register, sign in, order history
and profile storage are stock Store API routes, confirmed against a running server rather than
assumed. Two custom routes cover what Medusa doesn't:

| Route | What it does |
|---|---|
| `POST /store/customers/me/password` | Changes the password for a signed-in customer. The emailed reset link's own endpoint only accepts a token minted for that purpose, not an ordinary session, so this checks the current password and calls the same provider method the reset route does, wrapped in `changePasswordWorkflow` — a direct service mutation in the route handler fails the project's `@medusajs/no-service-mutations-in-api-route` lint rule. |
| `POST /store/customers/me/account` | Closes the account. Runs `removeCustomerAccountWorkflow` — the same workflow the admin's own delete-customer route runs — which detaches the auth identity and leaves past orders exactly as reachable as a guest's already are. A password confirms it first. |

The `auth.password_reset` event, fired by Medusa's own reset-token workflow, is handled by
`src/subscribers/password-reset-requested.ts`, which emails the link through the same Resend
setup the commission emails use.

⚠ **Email is not editable from the account.** `StoreUpdateCustomer` doesn't accept it, and
decoupling it from the login identity is a sharper edge than this pass reaches for.

---

## 4. Phase 3 — Seed

`apps/medusa/src/scripts/seed.ts` provisions the structure a piece needs to exist at all: the
store, the sales channel and publishable key, the regions and their prices, the atelier's stock
location and shipping, the single `Cut` option, the two collections that hold commissions rather
than a season, and the 4 commission silhouettes written down in
`apps/medusa/src/scripts/catalogue-fixture.ts`. It seeds no season and no piece.

**It is safe to run again.** Anything missing is created; anything present is brought back in
line. Prices are written once, at
creation, in francs — after that the house owns them in the admin. It is excluded from the compiled build, so it runs from source,
against whichever database `DATABASE_URL` points at.

```bash
pnpm --filter medusa exec medusa exec ./src/scripts/seed.ts
```

**A database seeded before the house priced in francs alone** (it still has a euro or sterling
region) is not fixed by re-running the seed: the seed leaves existing regions and shipping
options as they are, though it does set the store's currency to francs. Bring it across first,
with the dry run and then `apply`:

```bash
pnpm --filter medusa exec medusa exec ./src/scripts/chf-only.ts          # says what it would do
pnpm --filter medusa exec medusa exec ./src/scripts/chf-only.ts apply    # does it
```

The dry run stops with a list if any price cannot be moved safely (a shipping option or variant
with no franc price, a sale price with none beside it); nothing is changed until it is clean.

The house's pieces arrive through the admin or the ingestion route
(`CATALOGUE-INGESTION.md`). Until a season with status `current` has published pieces, the
storefront says no collection is open.

Seeding provisions an empty database and then stays out of the way: the storefront reads its
pieces and collections from the store API, so Medusa is the source of truth from the first run
onwards.

---

## 5. Phase 4 — Payload CMS — `pages` built, the rest is schema only

Payload 3 installs **into the Next.js app**, so there is no fifth service. It was added by hand
rather than with `create-payload-app` — that generator defaults to Mongo and a `src/` layout this
storefront doesn't have. What's there instead: `payload`, `@payloadcms/next`,
`@payloadcms/db-postgres`, `graphql` and `sharp` as dependencies of `apps/storefront`;
`payload.config.ts` at its root; and the `app/(payload)/` route group copied from Payload's own
blank template. Those route files are generated and are not meant to be hand-edited — regenerate
`app/(payload)/admin/importMap.js` with `pnpm --filter storefront generate:importmap` if the
admin's own registered components ever change, and `payload-types.ts` (gitignored, like
`next-env.d.ts`) with `pnpm --filter storefront generate:types`.

Points at `linsilk_payload` via `DATABASE_URI` — `docker/init-db.sql` already creates that database
locally, alongside Medusa's. `PAYLOAD_SECRET` is Payload's own encryption/signing secret and must
never be the same value as Medusa's `JWT_SECRET` or `COOKIE_SECRET`.

All five collections from the original plan exist, but only one is wired to a page yet:

| Collection | Content | Status |
|---|---|---|
| `pages` | The Atelier, The Cloth, The house | **Built.** Seeded from `lib/catalog.ts`'s `STORY` constant by `payload/seed.ts`; read live by the three routes that used to read `STORY` directly (`lib/payload.ts`'s `getStoryPage`) |
| `care` | Shipping, Measurement guide, Returns, Questions | Schema only (`key`, `title`, `lead`). The four `/care` pages still render their own hand-built sections, lists and comparison rows (`components/doc-page.tsx`) — moving that into Payload needs a content model for sections/lists/rows, which is separate work from standing the CMS up |
| `legal` | Terms, Privacy ⚠ **awaiting a lawyer — do not draft these** | Schema only, same reasoning as `care` — and there is nothing real to put in it yet regardless |
| `seasons` | Editorial per collection, keyed to the Medusa collection handle | Schema only. Nothing renders this yet: the archive pages carry only the one-line `collection.note` already in Medusa metadata |
| `media` | Photography, once it exists | Schema only — upload-enabled, one `alt` text field. Empty: everything today is a placeholder woven gradient (`HANDOVER.md` §8) |

```bash
pnpm --filter storefront exec payload run ./payload/seed.ts
```

Safe to run again — a `pages` document that already exists is updated in place, brought back in
line with `STORY`, rather than duplicated. Like the Medusa seed, it reads straight from the
storefront's own source of truth; `STORY` is the seed's input only from here on.

In production the tables have to exist first, and Payload creates them by itself only outside production. The schema is therefore carried as a migration in `apps/storefront/migrations/`, and the storefront's Build Command runs `pnpm --filter storefront exec payload migrate` before `next build` (`GO-LIVE-SETUP.md` step 9).

⚠ **`payload run` needs two workarounds under this exact toolchain** — Next 16.3, no
`"type": "module"` in `apps/storefront/package.json`. First, every relative import inside
`payload.config.ts`, and inside any script run via `payload run`, needs an explicit `.ts`
extension (`allowImportingTsExtensions` in `tsconfig.json` permits the syntax) — an open issue
against Payload under Next 16 (github.com/payloadcms/payload/issues/16684). Second, a standalone
script needs genuine top-level `await`, not a `.then()/.catch()` chain, or the CLI exits 0 the
instant `getPayload()` is called, before the connection settles — which is why `payload/` is its
own ESM package (`payload/package.json`) and `payload/seed.ts` loads `.env.local` itself with
`process.loadEnvFile()`, wrapped in a `try`/`catch`, before dynamically importing anything that
reads `process.env`. The `catch` matters in production: `.env.local` is dev-only and never
deployed, and Node throws on an explicit path that does not exist, unlike its no-argument form —
without it, running the seed on Render (`GO-LIVE-SETUP.md` §8) would exit before `getPayload()`
is even called, on an environment that is already correctly set by the platform. Neither
workaround touches the normal path: Next loads `.env.local` and this config the ordinary way (via
`@payload-config` from `app/(payload)/layout.tsx`) for `dev`, `build` and `start` alike.

Payload's admin lands at `/admin`; Medusa's is on its own service. Two admins is the cost of not
being on Shopify — worth stating to the client plainly.

---

## 6. Phase 5 — Stripe — built

`@medusajs/payment-stripe` ships with Medusa; `medusa-config.ts` registers it **only when
`STRIPE_API_KEY` is set**, and falls back to Medusa's system provider, which authorises without
charging. That is how checkout was built and tested before any keys existed.

The seed puts whatever providers exist onto every region, and prefers a real one: the moment
Stripe is configured, the system provider is dropped from every region, so a live store can never
offer "pay without paying".

**Which methods appear is the Stripe account's business, not the code's.** The provider runs with
`automatic_payment_methods`, so Stripe offers whatever that account has enabled for the currency
and the amount — card, **TWINT** (which matters in Switzerland and will be noticed if absent),
Apple and Google Pay, Klarna. Adding one later needs no deploy.

To switch it on:

1. Set `STRIPE_API_KEY` and `STRIPE_WEBHOOK_SECRET` on the host, and
   `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` on the storefront.
2. Point the Stripe webhook at `POST /hooks/payment/stripe_stripe`.
3. Re-run the seed so the regions pick Stripe up.
4. Enable TWINT, Klarna and the wallets in the Stripe dashboard. Wallets need domain
   verification.

> **Card fields stay inside Stripe's iframe.** The storefront mounts Stripe Elements at
> `#stripe-payment-element`; no card number touches this origin. Do not add a card input to this
> codebase — it drags the whole application into PCI scope for no benefit.

**Tax.** Medusa's tax module handles rates but not EU VAT/OSS filing. Budget for Stripe Tax
(calculation) plus something like Quaderno or Lovat (filing). This is the most commonly
underestimated cost of leaving Shopify — flag it to the client in writing.

---

## 7. Phase 6 — Wire the storefront — built

The cart is a Medusa cart; only its id is kept in the browser. Reserving a piece adds a real line,
so the house's rules (§3.2, §3.5) stand between a client and a garment, and a refusal is shown in
the words it was written in.

| Piece | Where |
|---|---|
| Cart, on the Store API | `lib/cart.tsx` |
| Calls and totals | `lib/checkout.ts`, `lib/medusa.ts` |
| Address, shipping, payment | `components/checkout/checkout-flow.tsx` |
| Stripe Elements, and the no-charge fallback | `components/checkout/payment-panel.tsx` |
| Accepting a quote | `app/commission/[token]`, `components/checkout/commission-payment.tsx` |
| Confirmation, readable by a guest holding the id | `app/order/[id]` |

Two things worth knowing before changing any of it:

- **A line carries the zones its own garment asked for.** Serialising a sheet with the fifteen
  body zones silently drops a garment length, and the backend then refuses the line as
  incomplete. A set asks for two lengths.
- **A seasonal cart may follow the client to another region** — its lines are rebuilt from their
  variants, keeping their metadata and taking that region's prices, so a Swiss cart takes
  the German region's shipping when the address is German, still in francs. **A commission cart may not:** its line is a run of one,
  and Medusa drops what it cannot rebuild. Hence `allowRegionChange`.

Still to do here:
- A currency switcher for browsing (regions and prices exist; only checkout switches today)
- `lib/catalog.ts` now reads its pieces and collections from the store API; what stays written
  down there is the measurement chart, the cloth, and the formatting
- Saved addresses (§3.9) are not yet offered as a picker here; checkout still asks fresh

---

## 8. Phase 7 — Deploy to Render

### 8.1 Setup — by hand, not a blueprint

`docs/GO-LIVE-SETUP.md` is the deploy guide: every resource created by hand in Render's
dashboard, every environment variable typed in on the service that needs it, no `render.yaml`.
An earlier draft of this deploy path used a Render Blueprint; it is gone — `envVarGroups` in a
blueprint silently drops any `sync: false` entry (Render's own blueprint spec says so), which
left the two groups that draft relied on for shared secrets empty of anything a deploy could
actually use. Fixing that meant either duplicating every secret on both `linsilk-medusa` and
`linsilk-worker`, or asking for a manual dashboard step before the blueprint could even run — at
which point a blueprint was not saving the manual work it exists for. The points worth carrying
over from that draft:

- **Every secret comes from Render, never the repo.** `JWT_SECRET` and `COOKIE_SECRET` are
  generated once and typed in on both `linsilk-medusa` and `linsilk-worker` if you run one
  (`GO-LIVE-SETUP.md` step 1); every other secret is typed in once per service that needs it.
- Migrations run as a **Pre-Deploy Command**, so they happen before the new version takes
  traffic and never on a rollback the way a build step would.
- `medusa-config.ts` refuses to boot in production without `DATABASE_URL`, `REDIS_URL`, both
  secrets and the three CORS values, naming what is missing rather than failing at the first
  request.
- **Redis is not optional with a worker.** Server and worker share an event bus, a workflow
  engine, a cache and a lock; in memory each process would keep its own, and a job would run
  twice or not at all.

### 8.2 Migrations

Do **not** run migrations in `buildCommand` — it runs on every deploy including rollbacks. Use a
Render pre-deploy command, or a one-off job:

```bash
pnpm --filter medusa exec medusa db:migrate
```

### 8.3 Second database

Render provisions one database per instance. Create `linsilk_payload` manually on first deploy,
connected via the PSQL command Render's dashboard gives you for `linsilk-postgres`:

```sql
CREATE DATABASE linsilk_payload;
```

No explicit `OWNER` — leaving it out makes the new database owned by whichever user the PSQL
command connected as, which is exactly Render's own generated user for that instance. That
user is not named `linsilk`; that name is only real for the local Docker setup, where
`docker/init-db.sql` runs the same statement with an explicit owner because the local role
genuinely is called that.

Then set `DATABASE_URI` for the storefront to that same connection string with the database name
swapped from `linsilk_medusa` to `linsilk_payload`.

### 8.4 CORS

Set after the first deploy, once hostnames exist:

```
STORE_CORS = https://bylinsilk.com,https://linsilk-storefront.onrender.com
ADMIN_CORS = https://linsilk-medusa.onrender.com
AUTH_CORS  = <both of the above>
```

### 8.5 File storage — Cloudflare R2

Three kinds of file: **cloth catalogues**, which are public; **commission references**, which are
the client's property and are stored privately, read back through short-lived signed links; and
**photography**, which is public and arrives with a piece through the ingestion route
(`CATALOGUE-INGESTION.md`). That route fetches images by URL, so the hosts it may fetch from are
named in `CATALOGUE_IMAGE_HOSTS` — unset, every image is refused.

Render's disks do not survive a deploy and are not shared between the web service and the
worker, so object storage is not optional in production. **Cloudflare R2** is the default: it
speaks the S3 API, so Medusa's stock `file-s3` provider drives it unchanged, and it charges
nothing for egress — the difference that matters for a house serving photography and PDFs.
Nothing about the choice is one-way: any S3-compatible bucket works by changing four variables.

Development needs none of this. Without `S3_BUCKET` the file module writes to `apps/medusa/static`.

```bash
S3_BUCKET=linsilk
S3_PRIVATE_BUCKET=linsilk-private      # commission references; never given a public address
S3_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
S3_REGION=auto
S3_ACCESS_KEY_ID=<R2 API token>
S3_SECRET_ACCESS_KEY=<R2 API token secret>
S3_FILE_URL=https://files.bylinsilk.com   # a custom domain on the bucket, or the r2.dev URL
S3_PREFIX=
```

Two things to get right when the bucket is made:

- **Create it in the EU jurisdiction.** Measurement sheets and reference photographs are personal
  data about a named person; keeping the files in the EU is one less thing to explain in the
  privacy notice, which already has an international transfer to account for (`HANDOVER.md` §8).
- **Two buckets, and only one of them ever public.** R2 has no per-object ACL: once a bucket has
  a public address (`r2.dev` or a custom domain), every object in it is readable by anyone with
  its key, whatever the upload asked for. So catalogues and photography go to `S3_BUCKET`, which
  may be given a public address (`S3_FILE_URL`), and references go to `S3_PRIVATE_BUCKET`, which
  never is — they are fetched only with signed links the admin mints per view. The routing is
  `src/modules/split-s3`, a thin wrapper around the stock S3 provider (Medusa's file module takes
  exactly one provider); it refuses to boot without a separate private bucket. Both buckets share
  one endpoint and one API token, so create them in the same jurisdiction.

Roughly $0.015 per GB per month and no egress charge, against Render disk at $0.25 per GB and no
durability guarantee across deploys.

### 8.6 Roles — who may reach what in the admin

Medusa's role-based access control is on (`featureFlags: { rbac: true }` in `medusa-config.ts`).
Every admin route checks what the caller's role allows; being signed in is no longer enough.

**People.** Roles are managed in the admin, **Settings → Roles**. The built-in **Super Admin**
role grants everything. `medusa user` gives it to the user it creates, and an invite carries
whatever roles are chosen when it is sent. Any narrower role (someone who answers commissions, say,
but doesn't touch prices) is built from permissions. Medusa's own permissions cover its own screens;
the house's own permissions are declared in `src/policies/linsilk.ts`:

| Permission | Lets a person |
|---|---|
| `catalogue:read` / `catalogue:update` | see / draft pieces, photography and pending seasons through the catalogue API |
| `catalogue:open` | open a season onto the site — the one catalogue act that changes what the public can buy |
| `commission:read` / `commission:update` | see commissions (measurements, reference files) / quote and answer them |
| `fabric_catalogue:read` / `create` / `update` / `delete` | manage the cloth catalogues |

A role's permissions are read on every request, so a change to a role takes effect at once. The
roles a *person holds* are written into their sign-in, so adding or removing one takes effect the
next time they sign in.

**The catalogue agent's key.** A secret API key reaches `/admin/catalogue/*` and nothing else.
`src/api/middlewares.ts` refuses a key on every other admin path before any route runs. That
check is its own wall rather than a consequence of roles. Medusa gives keys no roles, so every
route that declares a permission would refuse one anyway, but 2.20 ships some admin routes that
declare none, `/admin/search` among them. On the catalogue routes a person still needs the
permission from their role. So a leaked agent key can draft pieces, and open a season that
already has a published piece, but it cannot read an order, a customer or a commission,
publish a piece, change a published price, or mint itself another key. Revoke it in
**Settings → Secret API Keys**.

**Medusa routes 2.20 leaves unguarded.** Walking every admin route as a signed-in person with *no*
role found two that mattered, and both now need a permission (`src/api/middlewares.ts`):

- `GET /admin/search` — the dashboard's search bar. With no check it returned customers',
  orders' and admin users' names and emails, and promotion codes, to anyone signed in. It now
  needs read access to orders, customers, users and promotions, so a narrow role won't get
  the search bar.
- `POST /admin/rbac/roles` — creating a role. It now needs `rbac_role:create`.

What a role-less person can still reach is pinned exactly in `roles.spec.ts`, with a reason for
each entry. It's their own account, permissions and dashboard layout, the dashboard's
start-up data, and routes for features that are switched off. If a Medusa upgrade opens another
route, or a feature flag switches one of those on, that test fails, and the route has to be
looked at before the upgrade ships. The same test walks all ~400 admin routes with an agent key
and expects every one to refuse it.

Two things to know:

- **The role module is named in `modules`, not left to the flag.** `defineConfig` builds its list
  of default modules while `medusa-config.ts` is still being evaluated, before the file's own
  `featureFlags` are registered. Left to the default, the module stays off while the routes still
  check roles, and every admin request is refused.
- **Users from before roles were on get Super Admin once, on `db:migrate`**
  (`src/migration-scripts/give-existing-users-super-admin.ts`). Medusa's own script for this
  skips itself for the reason above and is then recorded as done.

## 9. Post-deploy checklist

- [ ] `/health` green on `linsilk-medusa`
- [ ] Admin reachable, admin user created
- [ ] Worker log shows it started in `worker` mode, not `server`
- [ ] Seed run; 4 collections and 53 products present
- [ ] Every region returns prices in CHF (on a database that predates franc-only pricing:
      `chf-only.ts` dry run clean, then `apply` — see §4)
- [ ] **A `past` collection product is rejected by the cart API**, not just hidden by the UI
- [ ] **A cart line missing a required measurement is rejected server-side**
- [ ] `metadata.length_kind` present on every piece that needs a length
- [ ] Stripe test payment end to end; webhook received
- [ ] Commission submits, appears in the atelier queue, can be quoted and sent
- [ ] `RESEND_API_KEY`, `RESEND_FROM` and `ATELIER_EMAIL` set — without them briefs are saved
      but nobody is told
- [ ] `S3_*` set and a catalogue uploaded through the admin actually opens from the storefront
- [ ] A commission reference is **not** reachable without a signed link
- [ ] The first admin user holds **Super Admin** (Settings → Roles); the catalogue agent's secret
      key gets `403` from `/admin/orders` and `200` from `/admin/catalogue/seasons` (§8.6)
- [ ] Transactional email at every state change
- [ ] Automated Postgres backups on, and a restore actually tested
- [ ] `NEXT_PUBLIC_*` vars contain nothing secret
- [ ] `linsilk_payload` database created manually (§8.3); `DATABASE_URI` and `PAYLOAD_SECRET` set on
      `linsilk-storefront`
- [ ] Payload admin reachable at `/admin`, first user created, seed run
      (`pnpm --filter storefront exec payload run ./payload/seed.ts`)
- [ ] Storefront still passes `pnpm --filter storefront test`

---

## 10. Indicative running cost

Verify against current Render pricing — this is the shape, not a quote.

| | Monthly |
|---|---|
| Medusa web (starter) | ~$7 |
| Worker (starter) | ~$7 |
| Postgres (basic) | ~$7 |
| Key Value (starter) | ~$10 |
| Storefront (starter, or Vercel free) | ~$7 / $0 |
| Object storage (R2/S3) | ~$1–5 |
| **Infrastructure** | **~$40–45** |
| Stripe | 2.9% + fixed, per transaction |
| Stripe Tax (if used) | ~0.5% per transaction |
| VAT filing service | ~€30–100 |

Every line is **commodity infrastructure priced on resources** — ungated, and swappable in an
afternoon. That is the point of the whole architecture: no vendor can put a feature you already
use behind a higher tier. The trade is that maintenance, upgrades and uptime are one S Digital's,
permanently.

---

## 11. Suggested order of work

1. ~~Scaffold Medusa, migrate, admin user~~ — done
2. ~~Regions and currencies~~ — done; every region is priced in francs alone
3. ~~Collections + pieces + seed~~ — done; the archive gate is enforced in the cart and tested
4. ~~Commission module + cloth catalogues + atelier console~~ — done (§3.6–3.8)
5. ~~Wire the storefront to the Store API~~ — done (§7)
6. ~~Stripe, seasonal checkout end to end, and a payment link when a quote is accepted~~ — done;
   dormant until keys exist (§6)
7. ~~Accounts + saved measurement profiles~~ — done, with settings besides (§3.9)
8. ~~Payload, with its `pages` collection~~ — done (§5); `care`, `legal`, `seasons` and `media`
   still need a content model — and, for `legal`, a lawyer — before there is anything to wire them
   to
9. Deploy to Render, with R2 and Resend configured
10. The go-live checklist

The remaining editorial work aside (`care`/`legal`/`seasons`/`media`, §5) — none of it the commerce
path — what stands between this and go-live is configuration rather than code: Stripe keys, a
Resend key and a verified sender, an R2 bucket, and the client's own content (§8.5, and
`HANDOVER.md` §8).
