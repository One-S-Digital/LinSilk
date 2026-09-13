# Maison Ayla — Backend Build & Render Deployment

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
| `ayla-medusa` | Web Service (Node) | Medusa server — Store API, Admin API, Admin UI |
| `ayla-worker` | Background Worker | Medusa in worker mode — events, subscribers, scheduled jobs |
| `ayla-postgres` | Postgres | Two databases: `ayla_medusa`, `ayla_payload` |
| `ayla-redis` | Key Value | Event bus + workflow engine |
| `ayla-storefront` | Web Service (Node) | The Next.js app, with Payload mounted at `/admin` |

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

`docker/init-db.sql` already creates `ayla_payload` alongside `ayla_medusa`.

Local `apps/medusa/.env`:

```bash
DATABASE_URL=postgres://ayla:ayla@localhost:5432/ayla_medusa
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
| Europe | EUR | at, be, de, dk, es, fr, ie, it, lu, nl, pt, se | Duty included per house copy ⚠ |
| International | GBP + others | gb, us, sg, jp, au | Duty payable on arrival |

⚠ **The duty claim needs an accountant before go-live.** Switzerland is outside the EU customs
union and the goods originate in Việt Nam. See `HANDOVER.md` §8.

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

The backend keeps its own copy of the zones in `apps/medusa/src/lib/measurements.ts`, with the
Vietnamese terms the bench reads. `apps/storefront/lib/backend-parity.test.ts` pins the two
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
name, a note or an opening figure in the admin rather than in code, and the exchange-rate job
keeps their euro and sterling figures derived from the franc. The collection's `metadata.status`
is neither `current` nor `past`, so the cart refuses them.

⚠ **Accepting a quote is still by reply.** The email asks the client to reply, and the house
sends a payment link by hand. Wiring that link to Stripe automatically is the next step (§6).

### 3.7 Cloth catalogues — built

The client does not pick cloth from a swatch list: the house publishes catalogues (PDFs or
plates) in the admin, the client reads them, and then **writes down the cloth they chose**. A
shelf is larger than any dropdown, and a client may want the fourth silk on page two.

### 3.8 The atelier console

The bench needs somewhere to read a confirmed sheet and move a piece through production. Medusa
Admin is extensible; add a widget or a route rather than building a second app. Minimum viable:

- Queue of commissions awaiting a quote — **built**
- The full measurement sheet, displayed in both English and Vietnamese — **built** (the terms
  live in `apps/medusa/src/lib/measurements.ts`, pinned to `lib/catalog.ts` by a storefront test)
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

`apps/medusa/src/scripts/seed.ts` reads directly from `apps/storefront/lib/catalog.ts`:
4 collections, 53 pieces and 4 commission silhouettes.

**It is safe to run again.** Anything missing is created; anything present has its wording,
collection and metadata brought back in line with the catalogue. Prices are written once, at
creation — after that the house owns them in the admin, and the exchange-rate job keeps the
derived currencies current. It is excluded from the compiled build (it reads a file outside the
backend), so it runs from source, against whichever database `DATABASE_URL` points at.

```bash
pnpm --filter medusa exec medusa exec ./src/scripts/seed.ts
```

⚠ Collections I–III (36 pieces) are **placeholder content**. Seed them for a working archive, but
do not let them reach production without the client's real data.

Once seeding works, `lib/catalog.ts` stops being the storefront's data source and becomes the
seed script's input only.

---

## 5. Phase 4 — Payload CMS

Payload 3 installs **into the Next.js app**, so there is no fifth service.

```bash
cd apps/storefront
pnpm dlx create-payload-app@latest --db postgres
```

Point it at `ayla_payload`. Collections to model — copy is final, it is all in `lib/catalog.ts`
under `STORY`:

| Collection | Content |
|---|---|
| `pages` | The Atelier, The Cloth, The house |
| `care` | Shipping, Measurement guide, Returns and alterations, Questions |
| `legal` | Terms, Privacy ⚠ **awaiting a lawyer — do not draft these** |
| `seasons` | Editorial per collection, keyed to the Medusa collection handle |
| `media` | Photography, once it exists |

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
  variants, keeping their metadata and taking that region's prices, so a Swiss cart becomes a
  euro one when the address is German. **A commission cart may not:** its line is a run of one,
  and Medusa drops what it cannot rebuild. Hence `allowRegionChange`.

Still to do here:
- A currency switcher for browsing (regions and prices exist; only checkout switches today)
- `lib/catalog.ts` still supplies the storefront's copy and art direction; products, prices and
  collections now come from the backend
- Saved addresses (§3.9) are not yet offered as a picker here; checkout still asks fresh

---

## 8. Phase 7 — Deploy to Render

### 8.1 `render.yaml` — committed

The blueprint is `render.yaml` at the repo root; read it rather than this section. In outline:

- `ayla-medusa` (web), `ayla-worker` (worker), `ayla-storefront` (web), `ayla-postgres`,
  `ayla-redis`, all in Frankfurt.
- **Every secret comes from Render, never the repo.** `generateValue` mints `JWT_SECRET` and
  `COOKIE_SECRET`; `sync: false` values are typed into the dashboard once; the database and key
  value store hand out their own connection strings. Two environment groups — `ayla-secrets` and
  `ayla-urls` — are shared by the server and the worker, which must agree about all of it.
- Migrations run as `preDeployCommand`, so they happen before the new version takes traffic and
  never on a rollback the way a build step would.
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

Render provisions one database per instance. Create `ayla_payload` manually on first deploy:

```sql
CREATE DATABASE ayla_payload OWNER ayla;
```

Then set `DATABASE_URI` for the storefront to that connection string. (Locally,
`docker/init-db.sql` already does this.)

### 8.4 CORS

Set after the first deploy, once hostnames exist:

```
STORE_CORS = https://maisonayla.ch,https://ayla-storefront.onrender.com
ADMIN_CORS = https://ayla-medusa.onrender.com
AUTH_CORS  = <both of the above>
```

### 8.5 File storage — Cloudflare R2

Two kinds of file: **cloth catalogues**, which are public, and **commission references**, which
are the client's property and are stored privately, read back through short-lived signed links.

Render's disks do not survive a deploy and are not shared between the web service and the
worker, so object storage is not optional in production. **Cloudflare R2** is the default: it
speaks the S3 API, so Medusa's stock `file-s3` provider drives it unchanged, and it charges
nothing for egress — the difference that matters for a house serving photography and PDFs.
Nothing about the choice is one-way: any S3-compatible bucket works by changing four variables.

Development needs none of this. Without `S3_BUCKET` the file module writes to `apps/medusa/static`.

```bash
S3_BUCKET=maison-ayla
S3_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
S3_REGION=auto
S3_ACCESS_KEY_ID=<R2 API token>
S3_SECRET_ACCESS_KEY=<R2 API token secret>
S3_FILE_URL=https://files.maisonayla.ch   # a custom domain on the bucket, or the r2.dev URL
S3_PREFIX=
```

Two things to get right when the bucket is made:

- **Create it in the EU jurisdiction.** Measurement sheets and reference photographs are personal
  data about a named person; keeping the files in the EU is one less thing to explain in the
  privacy notice, which already has a Việt Nam transfer to account for (`HANDOVER.md` §8).
- **Do not make the bucket public.** Only the catalogues are public, and they are served through
  `S3_FILE_URL`; references are fetched with signed links the admin mints per view.

Roughly $0.015 per GB per month and no egress charge, against Render disk at $0.25 per GB and no
durability guarantee across deploys.

## 9. Post-deploy checklist

- [ ] `/health` green on `ayla-medusa`
- [ ] Admin reachable, admin user created
- [ ] Worker log shows it started in `worker` mode, not `server`
- [ ] Seed run; 4 collections and 53 products present
- [ ] Regions return correct prices in CHF / EUR / GBP
- [ ] **A `past` collection product is rejected by the cart API**, not just hidden by the UI
- [ ] **A cart line missing a required measurement is rejected server-side**
- [ ] `metadata.length_kind` present on every piece that needs a length
- [ ] Stripe test payment end to end; webhook received
- [ ] Commission submits, appears in the atelier queue, can be quoted and sent
- [ ] `RESEND_API_KEY`, `RESEND_FROM` and `ATELIER_EMAIL` set — without them briefs are saved
      but nobody is told
- [ ] `S3_*` set and a catalogue uploaded through the admin actually opens from the storefront
- [ ] A commission reference is **not** reachable without a signed link
- [ ] Transactional email at every state change
- [ ] Automated Postgres backups on, and a restore actually tested
- [ ] `NEXT_PUBLIC_*` vars contain nothing secret
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
2. ~~Regions and currencies~~ — done, with euro and sterling derived from the franc hourly
3. ~~Collections + pieces + seed~~ — done; the archive gate is enforced in the cart and tested
4. ~~Commission module + cloth catalogues + atelier console~~ — done (§3.6–3.8)
5. ~~Wire the storefront to the Store API~~ — done (§7)
6. ~~Stripe, seasonal checkout end to end, and a payment link when a quote is accepted~~ — done;
   dormant until keys exist (§6)
7. ~~Accounts + saved measurement profiles~~ — done, with settings besides (§3.9)
8. Payload for editorial
9. Deploy to Render, with R2 and Resend configured
10. The go-live checklist

Payload aside — editorial content, not the commerce path — what remains before go-live is
configuration rather than code: Stripe keys, a Resend key and a verified sender, an R2 bucket,
and the client's own content (§8.5, and `HANDOVER.md` §8).
