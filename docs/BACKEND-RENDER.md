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
| `lengthKind` | `metadata.length_kind` — `dress` \| `skirt` \| `trouser` \| `top`, absent if none |
| `collection` | collection relation |

`metadata.length_kind` decides which garment length the measurement sheet asks for. Get it wrong
and the atelier receives a dress with no length.

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

`measurement_unit` records what the client *saw*; every figure is metric regardless. Keep it that
way — it is the whole point of the conversion fix.

**Validate server-side too.** `RANGES` in `lib/measurements.ts` is the source of truth; port it
to a shared package or duplicate it with a test that pins the two copies together. A cart line
missing a required zone must be rejected — the storefront blocks it, but the storefront is not a
security boundary.

### 3.6 Commissions ⚠

**This is the one piece that does not map onto a normal Medusa order, and the design decision
that matters most.**

A commission's price is an *estimate* until a person has read the brief. So a commission cannot
go through checkout with a seasonal piece.

**Recommended: a custom `commission` module** with its own lifecycle:

```
submitted → reviewed → quoted → approved → in_production → shipped
```

carrying: silhouette, cloth, the client's note, uploaded references, the measurement sheet, the
estimate, and the confirmed price once set.

**At checkout, a mixed cart splits:**
- Seasonal pieces → a normal Medusa order, paid immediately
- Commissions → `commission` records in `submitted`, invoiced separately once quoted

The storefront already models this: `CartLine.estimate` flags it, `hasEstimate` drives the notice
on both `/cart` and `/checkout`, and the copy already promises the client is not charged the
difference without agreeing first. **Honour that promise in the backend.**

Approval should produce a Stripe payment link against the confirmed figure — not a silent charge.

### 3.7 The atelier console

The bench needs somewhere to read a confirmed sheet and move a piece through production. Medusa
Admin is extensible; add a widget or a route rather than building a second app. Minimum viable:

- Queue of commissions awaiting a quote
- The full measurement sheet, **displayed in both English and Vietnamese** (the terms are in
  `lib/catalog.ts` — they are what is written on the ticket in Hội An)
- Set confirmed price → notify client
- Production status per order

---

## 4. Phase 3 — Seed

Write `apps/medusa/src/scripts/seed.ts` reading directly from
`apps/storefront/lib/catalog.ts`. It is already typed for this: 4 collections, 53 pieces, 4
fabrics, 4 silhouettes with estimates.

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

## 6. Phase 5 — Stripe

```bash
pnpm --filter medusa add @medusajs/payment-stripe
```

- Register the provider per region. **TWINT matters in Switzerland** — it is a large share of
  Swiss checkout and its absence will be noticed.
- Webhook → `POST /hooks/payment/stripe`
- The storefront already has the Elements mount point marked at
  `#stripe-payment-element` in `app/checkout/page.tsx`.

> **Card fields stay inside Stripe's iframe.** They were deliberately not built. Do not add a card
> number input to this codebase — it drags the whole application into PCI scope for no benefit.

**Tax.** Medusa's tax module handles rates but not EU VAT/OSS filing. Budget for Stripe Tax
(calculation) plus something like Quaderno or Lovat (filing). This is the most commonly
underestimated cost of leaving Shopify — flag it to the client in writing.

---

## 7. Phase 6 — Wire the storefront

**One file changes: `apps/storefront/lib/cart.tsx`.** It was written as the swap point. Replace
its internals with Store API calls against a real cart id; every consumer stays untouched.

Then:
- Replace `lib/catalog.ts` reads with Store API queries (products, collections, regions)
- Add a publishable API key to the storefront env
- Currency switcher backed by Medusa regions — CHF/EUR/GBP, no UI yet
- Persist commission reference uploads (S3 or Render disk) — the flow already validates type,
  size and count but does not store anything
- Accounts: register, login, password reset, order history, and the saved measurement profile
  that `/account` currently only describes

---

## 8. Phase 7 — Deploy to Render

### 8.1 `render.yaml`

Commit this at the repo root.

```yaml
services:
  - type: web
    name: ayla-medusa
    runtime: node
    plan: starter
    buildCommand: pnpm install --frozen-lockfile && pnpm --filter medusa build
    startCommand: pnpm --filter medusa start
    healthCheckPath: /health
    envVars:
      - key: MEDUSA_WORKER_MODE
        value: server
      - key: DATABASE_URL
        fromDatabase: { name: ayla-postgres, property: connectionString }
      - key: REDIS_URL
        fromService: { name: ayla-redis, type: keyvalue, property: connectionString }
      - key: JWT_SECRET
        generateValue: true
      - key: COOKIE_SECRET
        generateValue: true
      - key: STORE_CORS
        sync: false
      - key: ADMIN_CORS
        sync: false
      - key: AUTH_CORS
        sync: false
      - key: STRIPE_API_KEY
        sync: false
      - key: STRIPE_WEBHOOK_SECRET
        sync: false

  - type: worker
    name: ayla-worker
    runtime: node
    plan: starter
    buildCommand: pnpm install --frozen-lockfile && pnpm --filter medusa build
    startCommand: pnpm --filter medusa start
    envVars:
      - key: MEDUSA_WORKER_MODE
        value: worker
      - key: DATABASE_URL
        fromDatabase: { name: ayla-postgres, property: connectionString }
      - key: REDIS_URL
        fromService: { name: ayla-redis, type: keyvalue, property: connectionString }

  - type: web
    name: ayla-storefront
    runtime: node
    plan: starter
    buildCommand: pnpm install --frozen-lockfile && pnpm --filter storefront build
    startCommand: pnpm --filter storefront start
    envVars:
      - key: NEXT_PUBLIC_MEDUSA_BACKEND_URL
        fromService: { name: ayla-medusa, type: web, property: host }
      - key: NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
        sync: false
      - key: PAYLOAD_SECRET
        generateValue: true
      - key: DATABASE_URI
        sync: false          # ayla_payload on the same server

  - type: keyvalue
    name: ayla-redis
    plan: starter
    ipAllowList: []          # private network only

databases:
  - name: ayla-postgres
    plan: basic-256mb
    databaseName: ayla_medusa
```

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

### 8.5 File storage

Render's disks do not persist across deploys on all plans, and commission references are client
property. **Use S3 or Cloudflare R2**, not a local disk.

---

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
- [ ] Commission submits, appears in the atelier queue, can be quoted and approved
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

1. Scaffold Medusa, migrate, admin user — **prove it runs**
2. Regions and currencies
3. Collections + pieces + seed — **prove the archive gate works**
4. Wire `lib/cart.tsx` to the Store API — **the storefront goes live against real data**
5. Stripe, seasonal checkout end to end
6. Accounts + saved measurement profiles
7. Commission module + atelier console
8. Payload for editorial
9. Deploy to Render
10. Email, then the go-live checklist

Steps 1–5 are a working store. Everything after is what makes it Maison Ayla's store.
