# Going live — Render + Cloudflare R2, step by step (manual setup)

This is the "just do it" version, done entirely by hand in Render's dashboard — no Blueprint, no
`render.yaml`. Every resource is created with the **New** button, one at a time, and every
environment variable is typed in directly on the service that needs it. `BACKEND-RENDER.md`
explains *why* each piece exists; this is the order to click through it in.

Follow this top to bottom — later steps depend on earlier ones.

**Accounts you need before starting:** GitHub, [Render](https://render.com),
[Cloudflare](https://dash.cloudflare.com), [Stripe](https://dashboard.stripe.com),
[Resend](https://resend.com). All five have free tiers to start.

**Four things you'll create on Render, in this order:** two data stores
(`linsilk-postgres`, `linsilk-redis`), the Medusa process (`linsilk-medusa`, running its API and
its background jobs together), then the storefront (`linsilk-storefront`). A fifth,
`linsilk-worker`, is **optional** — step 7 explains when you'd want it and how to add it later;
skip it for now unless you already know you need it.

---

## 0. Push the repo to GitHub

Nothing here can happen until the code is somewhere Render can pull it from — there is currently
no remote configured.

1. Create an empty repo on GitHub (no README, no `.gitignore` — this repo already has both).
2. Point this checkout at it and push:

   ```bash
   git remote add origin https://github.com/<your-org>/<repo-name>.git
   git push -u origin backend
   ```

3. Decide whether `backend` becomes `main` now or later (`git branch -a` shows the branches this
   repo already has). Every service you create below picks its own branch to deploy from — it
   does not have to be `main`.

---

## 1. Generate the three secrets you'll need

Render's manual flow has no "generate and share a random value" button — that only exists for
Blueprints. Three values need to exist before you create anything:

```bash
openssl rand -hex 32   # run three times, or once and copy — either way, three separate values
```

Label them `JWT_SECRET`, `COOKIE_SECRET` and `PAYLOAD_SECRET`, and save all three somewhere safe
(a password manager). `JWT_SECRET` and `COOKIE_SECRET` go on `linsilk-medusa`; `PAYLOAD_SECRET`
goes on `linsilk-storefront`, once, in step 9. **If you add `linsilk-worker` later (step 7),
`JWT_SECRET` and `COOKIE_SECRET` must be byte-identical on both services** — they'd share an
event bus, a workflow engine and a lock, and disagreeing about either secret breaks that silently
rather than with a clear error. With no separate worker, this doesn't come up.

---

## 2. Create the two data stores

### `linsilk-postgres`

Render dashboard → **New** → **PostgreSQL**.

| Field | Value |
|---|---|
| Name | `linsilk-postgres` |
| Database | `linsilk_medusa` |
| User | `linsilk` (or leave Render's default — either works, just note whatever it ends up being) |
| Region | Frankfurt |
| PostgreSQL Version | 16 |
| Instance Type | Basic · 256 MB (or higher — this is the cheapest that works) |

Create it. Once it's up, open it → the **Info** (or **Connect**) tab → copy the **Internal
Database URL**. That's your `DATABASE_URL` — internal, not external: the compute services and
this database sit in the same Render private network, internal is faster, and it's what avoids
external bandwidth charges.

### `linsilk-redis`

Render dashboard → **New** → **Key Value**.

| Field | Value |
|---|---|
| Name | `linsilk-redis` |
| Region | Frankfurt — same region as everything else; cross-region traffic is slower and sometimes billed |
| Instance Type | Starter |
| IP Allow List | leave **empty** — that restricts it to Render's private network only, which is what you want. Nothing about Redis should ever be reachable from the public internet. |
| Maxmemory Policy | `noeviction`. Render's default, `allkeys-lru`, lets Redis throw away queued jobs, workflow state and locks when it runs short of memory, and Medusa logs `Eviction policy is allkeys-lru. It should be "noeviction"` at every start until it is changed. |

Create it, then copy its **Internal Connection String** — that's your `REDIS_URL`.

---

## 3. Cloudflare R2 — object storage (two buckets)

Photography, cloth catalogues and commission reference files all need somewhere durable to live.
Render's disks are wiped on every deploy, so this step is not optional.

**Why two buckets.** R2 has no per-file privacy: the moment a bucket gets a public address (its
`r2.dev` URL or a custom domain), *every* file in it can be opened by anyone who has its link,
whatever Medusa asked for at upload. Catalogue photos need a public address; commission references
— measurement sheets, photographs of the client — must never have one. So they live apart:

| Bucket | Holds | Public address? |
|---|---|---|
| `linsilk` | photography, cloth catalogues | **yes** — custom domain or `r2.dev` URL |
| `linsilk-private` | commission references | **never** — read only through the signed, expiring links the admin mints each time a brief is opened |

The backend routes each upload to the right bucket on its own (`apps/medusa/src/modules/split-s3`),
and refuses to boot if `S3_PRIVATE_BUCKET` is missing or is the same as `S3_BUCKET`.

1. Cloudflare dashboard → **R2** (left sidebar). Enable R2 if this is the account's first bucket.
2. **Create bucket** `linsilk` (the name only has to match `S3_BUCKET` below). **Location: EU
   jurisdiction.**
3. **Create bucket** `linsilk-private` (matches `S3_PRIVATE_BUCKET`). **Location: EU jurisdiction**
   as well — measurement sheets and reference photos are personal data about a named person, and
   keeping them in the EU is one less thing to explain in the privacy notice. (Both buckets must
   also share a jurisdiction for a second reason: the backend reaches them through one
   `S3_ENDPOINT`, and EU buckets answer on a different endpoint from the rest.)
   **Never** turn on its Public Development URL and **never** connect a custom domain to it — not
   now, not later, not "just to test". Its Settings → Public access should read *Disabled*
   forever.
4. **Give `linsilk` (and only `linsilk`) a public address.** R2 → `linsilk` → Settings →
   **Custom Domains** → connect e.g. `files.linsilk.ch`, on a domain you control in Cloudflare
   DNS. That becomes `S3_FILE_URL`. No domain yet? Either enable `linsilk`'s **Public Development
   URL** (`https://pub-<hash>.r2.dev`) and use that — safe now, because nothing private is in this
   bucket — or put the domain you *will* use in `S3_FILE_URL` ahead of time: uploads work either
   way, and catalogue photos just 404 in a browser until the domain is live.
5. **Create an API token**: R2 → **Manage R2 API Tokens** → **Create API Token**. Permissions:
   **Object Read & Write**, scoped to **both** buckets — `linsilk` and `linsilk-private` — and
   nothing else. Save the **Access Key ID** and **Secret Access Key** it shows you — the secret is
   shown once. (One token for both is deliberate: the backend is the only thing that holds it,
   and the privacy comes from the private bucket having no public address, not from the token.)
6. Find your **Account ID** (R2 home page, right-hand sidebar, or the Cloudflare dashboard URL) —
   you need it for the endpoint below.

Seven values, ready to paste onto `linsilk-medusa` in step 6:

| Variable | Value |
|---|---|
| `S3_BUCKET` | `linsilk` |
| `S3_PRIVATE_BUCKET` | `linsilk-private` — must differ from `S3_BUCKET` |
| `S3_ENDPOINT` | `https://<account-id>.eu.r2.cloudflarestorage.com` — the account's address, shared by both buckets, with the `.eu` because they're EU-jurisdiction. R2's bucket Settings page shows it as "S3 API" with the bucket name on the end (`…/linsilk`); leave that part off. |
| `S3_REGION` | `auto` |
| `S3_ACCESS_KEY_ID` | the Access Key ID from step 5 |
| `S3_SECRET_ACCESS_KEY` | the Secret Access Key from step 5 |
| `S3_FILE_URL` | `linsilk`'s public address from step 4, e.g. `https://files.linsilk.ch` — no trailing slash |

---

## 4. Resend — transactional email

Order confirmations, commission quotes, password resets — all of it goes through Resend.

1. [resend.com](https://resend.com) → sign up → **Add Domain**, e.g. `linsilk.ch`. Add the DNS
   records it gives you wherever that domain's DNS is hosted.
2. Once the domain shows **Verified**, create an API key: **API Keys** → **Create API Key**, full
   access is fine for a single-service setup. Copy it — shown once.
3. Pick a from-address on the verified domain, e.g. `hello@linsilk.ch`.

| Variable | Value |
|---|---|
| `RESEND_API_KEY` | the key from step 2 |
| `RESEND_FROM` | `LinSilk <hello@linsilk.ch>` |

---

## 5. Stripe — get your keys

1. [dashboard.stripe.com](https://dashboard.stripe.com) → make sure you're in **test mode** first
   (toggle, top right) — go live for real only once everything else checks out.
2. **Developers → API keys**: copy the **Secret key** and **Publishable key**.

| Variable | Value |
|---|---|
| `STRIPE_API_KEY` | the Secret key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | the Publishable key |

The webhook itself comes in step 8, once `linsilk-medusa` exists and you know its URL.

---

## 6. Create `linsilk-medusa`

Render dashboard → **New** → **Web Service**. Connect the GitHub repo, pick the branch from
step 0.

| Field | Value |
|---|---|
| Name | `linsilk-medusa` |
| Region | Frankfurt |
| Root Directory | leave **blank** (repo root) — the build command below uses pnpm's workspace filter, which needs to run from the root where `pnpm-workspace.yaml` lives, not from `apps/medusa` |
| Runtime | Node |
| Build Command | `corepack enable && pnpm install --frozen-lockfile && pnpm --filter medusa build && cp -r apps/medusa/.medusa/server/public apps/medusa/public` |
| Start Command | `pnpm --filter medusa start` |
| Instance Type | Starter |

After creating it (or on the creation form, if your Render UI shows these fields up front — they
move around; look under the service's **Settings** tab afterward if not):

- **Health Check Path**: `/health`
- **Pre-Deploy Command**: `pnpm --filter medusa exec medusa db:migrate` — this runs *before* the
  new version takes traffic, and never runs on a rollback the way a build-command migration
  would.

  **No Pre-Deploy Command field on your plan?** It's gated the same way Shell access is (see step
  11's note) — some instance types don't get either. Fold the migration into the Start Command
  instead, permanently: `pnpm --filter medusa exec medusa db:migrate && pnpm --filter medusa start`.
  Safe to leave in long-term — `db:migrate` is idempotent, so running it on every deploy costs
  nothing when there's nothing new to migrate.

**Why the Build Command ends in `cp -r …`:** `medusa build` writes the admin UI to
`apps/medusa/.medusa/server/public/admin`, but `medusa start` run from `apps/medusa` looks for it
at `apps/medusa/public/admin`. Without the copy the service crashes on boot with `Could not find
index.html in the admin build directory` and never opens a port.

**Node version:** the repo's `.node-version` pins Node 22. Leave it. Render resolves an unbounded
`engines` range such as `>=20` to the newest Node release, and on Node 26 `corepack enable` fails
with `EROFS: read-only file system` and the build never starts. `NODE_VERSION=22` as an
environment variable does the same thing and wins over the file.

**Note the URL Render assigns it** (shown at the top of the service page, normally
`https://linsilk-medusa.onrender.com` unless that exact name was taken) — you need it in steps 8
and 9.

Now add every environment variable you already have, under the service's **Environment** tab:

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `MEDUSA_WORKER_MODE` | `shared` — runs the API and the background jobs (scheduled tasks, subscribers) in this one process. `medusa start` defaults to `shared` when this is unset, but setting it explicitly means anyone reading the dashboard later can see that's deliberate, not an oversight. Change it to `server` only if you also create `linsilk-worker` (step 7) |
| `DATABASE_URL` | from step 2 |
| `REDIS_URL` | from step 2 |
| `JWT_SECRET` | from step 1 |
| `COOKIE_SECRET` | from step 1 |
| `STRIPE_API_KEY` | from step 5 |
| `RESEND_API_KEY`, `RESEND_FROM` | from step 4 |
| `S3_BUCKET`, `S3_PRIVATE_BUCKET`, `S3_ENDPOINT`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_FILE_URL` | from step 3 |
| `CATALOGUE_IMAGE_HOSTS` | the hostname(s) photographs are ever fetched from, comma-separated — at minimum your R2 domain from step 3 (e.g. `files.linsilk.ch`); add a photographer's delivery host too if reference shots come from one. Leave blank and the ingestion route refuses every image until you set it. |

**Leave these blank for now** — they come back in steps 8 and 10: `STORE_CORS`, `ADMIN_CORS`,
`AUTH_CORS`, `STOREFRONT_URL`, `ATELIER_EMAIL`, `STRIPE_WEBHOOK_SECRET`.

Don't trigger a deploy yet — it will fail without the CORS values, and that's expected. Keep going.

---

## 7. `linsilk-worker` — optional, skip unless you need it

`linsilk-medusa` in `shared` mode (step 6) already runs everything: the storefront's API calls
and the background jobs — the hourly exchange-rate refresh, the password-reset email subscriber,
any future long subscriber. One process, one Starter instance, no separate cost.

The reason to split them apart later: `shared` mode means a slow background task and a checkout
request are competing for the same process. At this stage that's very unlikely to matter. Split
it out once it demonstrably does — a subscriber that's grown heavy (image transcoding, a bulk
export), or checkout latency that traces back to something running in the background at the same
moment. Render also has no free tier for a Background Worker either way, so this isn't a way to
save money — it only exists to isolate load once there's enough of it to isolate.

**If and when you do want it**, come back here:

Render dashboard → **New** → **Background Worker**. Same repo, same branch.

| Field | Value |
|---|---|
| Name | `linsilk-worker` |
| Region | Frankfurt |
| Root Directory | blank, same reasoning as step 6 |
| Runtime | Node |
| Build Command | `corepack enable && pnpm install --frozen-lockfile && pnpm --filter medusa build && cp -r apps/medusa/.medusa/server/public apps/medusa/public` |
| Start Command | `pnpm --filter medusa start` — identical to `linsilk-medusa`; `MEDUSA_WORKER_MODE` is what makes it behave differently |
| Instance Type | Starter |

No Health Check Path (it isn't a web service) and no Pre-Deploy Command (migrations run once,
from `linsilk-medusa`, not twice).

**Also go back to `linsilk-medusa` and change its `MEDUSA_WORKER_MODE` from `shared` to
`server`** — with a dedicated worker running background jobs, `linsilk-medusa` should stop doing
that work itself, or both processes end up doing it. This redeploys `linsilk-medusa`.

Environment variables for `linsilk-worker` — **everything from `linsilk-medusa`'s table above,
with one change**:

| Variable | Value |
|---|---|
| `MEDUSA_WORKER_MODE` | `worker` |
| `JWT_SECRET` | the **exact same value** you put on `linsilk-medusa` |
| `COOKIE_SECRET` | the **exact same value** you put on `linsilk-medusa` |
| everything else | copy from `linsilk-medusa`'s table — `DATABASE_URL`, `REDIS_URL`, `STRIPE_API_KEY`, the Resend and S3 vars, `CATALOGUE_IMAGE_HOSTS` |

Same blanks for now: `STORE_CORS`, `ADMIN_CORS`, `AUTH_CORS`, `STOREFRONT_URL`, `ATELIER_EMAIL`,
`STRIPE_WEBHOOK_SECRET`.

---

## 8. Stripe's webhook, now that the URL is real

You know `linsilk-medusa`'s URL from step 6, so do this now rather than waiting for a deploy —
Stripe just needs a URL to point at, it doesn't need to already be answering.

Stripe dashboard → **Developers → Webhooks** → **Add endpoint** →
`https://linsilk-medusa.onrender.com/hooks/payment/stripe_stripe` — that exact path, derived
from `medusa-config.ts`'s `id: 'stripe'` on the `@medusajs/medusa/payment-stripe` provider
(Medusa builds the webhook route as `<provider-class>_<id>`, both `stripe` here). Events: at
minimum `payment_intent.succeeded` and `payment_intent.payment_failed`.

Copy the **Signing secret** it gives you into `STRIPE_WEBHOOK_SECRET` on `linsilk-medusa` (and on
`linsilk-worker` too, if you created it in step 7).

---

## 9. The second database, and `linsilk-storefront`

### `linsilk_payload`, on the same Postgres instance

1. `linsilk-postgres` → **Connect** → copy the **PSQL Command** it shows you.
2. Run it from your own terminal (needs `psql` installed locally), then at the prompt:

   ```sql
   CREATE DATABASE linsilk_payload;
   ```

   No explicit `OWNER` — leaving it out makes the new database owned by whichever user you just
   connected as, which is exactly the user you set (or Render generated) in step 2. Don't assume
   that user is literally named `linsilk`; the connection string already has the right name in
   it either way.

3. Build `DATABASE_URI`: take the same Internal Database URL from step 2, and swap the database
   name at the end from `linsilk_medusa` to `linsilk_payload` — host, user and password stay
   identical.

### Create `linsilk-storefront`

Render dashboard → **New** → **Web Service**. Same repo, same branch.

| Field | Value |
|---|---|
| Name | `linsilk-storefront` |
| Region | Frankfurt |
| Root Directory | blank |
| Runtime | Node |
| Build Command | `corepack enable && pnpm install --frozen-lockfile && pnpm --filter storefront build` |
| Start Command | `pnpm --filter storefront start` |
| Instance Type | Starter |

**Note its URL** (e.g. `https://linsilk-storefront.onrender.com`) — you need it in step 10.

Environment variables:

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `NEXT_PUBLIC_MEDUSA_BACKEND_URL` | `linsilk-medusa`'s URL, from step 6 |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | from step 5 |
| `PAYLOAD_SECRET` | from step 1 |
| `DATABASE_URI` | just built, above |

**Leave blank for now**: `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` — it doesn't exist until you've
signed into the Medusa admin, in step 11.

---

## 10. Go back and fill in the CORS and URL variables

Both service URLs are known now. On `linsilk-medusa` (and on `linsilk-worker` too, if you created
it in step 7 — it reads `medusa-config.ts`'s required-vars check same as `linsilk-medusa` does):

| Variable | Value |
|---|---|
| `STORE_CORS` | `https://linsilk-storefront.onrender.com` (and your real domain later, comma-separated) |
| `ADMIN_CORS` | `https://linsilk-medusa.onrender.com` |
| `AUTH_CORS` | both of the above, comma-separated |
| `STOREFRONT_URL` | `https://linsilk-storefront.onrender.com` |
| `ATELIER_EMAIL` | the inbox that should hear about new commissions, e.g. `atelier@linsilk.ch` |

Saving triggers a deploy on each. **This is the first deploy that should actually succeed** —
watch `linsilk-medusa`'s log for the `Pre-Deploy Command` running `medusa db:migrate` cleanly.

---

## 11. First admin user, and the storefront's publishable key

1. Once `linsilk-medusa` is live: dashboard → `linsilk-medusa` → **Shell**:

   ```bash
   medusa user -e you@linsilk.ch -p <a real password>
   ```

   The admin checks roles on every request (`BACKEND-RENDER.md` §8.6), and this command gives
   the user it creates the **Super Admin** role, which grants everything. People you invite later
   get whatever roles you pick on the invite. **Settings → Roles** is where you make narrower
   ones, e.g. someone who answers commissions but can't touch prices.

   **No Shell tab on your plan?** It's a paid-instance feature, same as Pre-Deploy Command (step
   6). Use the Start Command field instead — it's available on every plan:

   1. `linsilk-medusa` → Settings → Start Command. Put the user step in front of the final
      `start`:

      ```bash
      pnpm --filter medusa exec medusa user -e you@linsilk.ch -p <a throwaway password> && pnpm --filter medusa start
      ```

      If you folded the migration into the Start Command in step 6, keep it at the front, so the
      tables exist before the user is created (`medusa user` fails on an empty database):

      ```bash
      pnpm --filter medusa exec medusa db:migrate && pnpm --filter medusa exec medusa user -e you@linsilk.ch -p <a throwaway password> && pnpm --filter medusa start
      ```

      Use a throwaway password, not your real one — Render keeps this field in deploy-settings
      history and likely echoes it into the deploy log, so it isn't private the way a Shell
      session would be.
   2. Save (redeploys). Watch **Logs** for the "user created" confirmation.
   3. **Revert immediately** to what the field held before: plain `pnpm --filter medusa start`,
      or the `db:migrate && … start` form from step 6 (do not drop the migration when you
      revert). This matters more than
      it would for Pre-Deploy Command: because of `&&`, if `medusa user` is ever left in and runs
      again (e.g. you forget to revert), it fails since the user already exists, `medusa start`
      never runs, and the service won't boot at all.
   4. Log in (next step) with the throwaway password and change it immediately.

2. Visit `https://linsilk-medusa.onrender.com/app` and sign in. **Settings → API Key
   Management → Publishable API Keys** — create one. Open it and, under **Sales Channels**, add
   the default channel. A publishable key with no sales channel on it is refused by every
   `/store/*` route that needs one — `/store/products` included — so the storefront would build
   and deploy clean and then show no catalogue at all.
3. Paste it into `linsilk-storefront`'s `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` and save — this
   redeploys the storefront, the last deploy that needed an env var it didn't have yet.
4. **Only if you'll use the catalogue MCP server** (`CATALOGUE-INGESTION.md` §8): **Settings →
   Secret API Keys** → create one named e.g. `Catalogue agent`, and put it in the Claude config
   on the machine that runs the agent as `MEDUSA_ADMIN_API_KEY`, with `MEDUSA_URL` set to
   `linsilk-medusa`'s **https** URL. The key can reach only `/admin/catalogue/*`: the backend
   refuses it everywhere else, so it can't read an order, a customer or a commission, and it
   can't create another key. Give it to one machine, and revoke it from the same screen if it
   leaks.

---

## 12. Payload — the storefront's own admin

1. Once `linsilk-storefront` deploys clean, visit
   `https://linsilk-storefront.onrender.com/admin` — it asks you to create the first user.
2. Seed the `pages` collection (Atelier, Cloth, The house copy) from `linsilk-storefront`'s
   Render shell:

   ```bash
   pnpm --filter storefront exec payload run ./payload/seed.ts
   ```

---

## 13. Seed the Medusa catalogue

From `linsilk-medusa`'s Render shell:

```bash
pnpm --filter medusa exec medusa exec ./src/scripts/seed.ts
```

Safe to run again later — it only creates what's missing and corrects wording on what already
exists, never touches a price once set.

**⚠ Collections I–III (36 pieces) in the fixture are placeholder content**, not the client's real
catalogue (`docs/BACKEND-RENDER.md` §4). Seeding them gives you a working archive to test with,
but confirm with the client before this data is what a real visitor sees.

---

## 14. Verify, using `BACKEND-RENDER.md` §9

That section is the full post-deploy checklist — `/health` green, a `past`-season product
actually rejected by the cart API (not just hidden in the UI), a Stripe test payment completing
end to end, a commission reference file unreachable without a signed link, and so on. Work
through it once before telling anyone the site is live.

For the reference-file check specifically, submit a test commission with an attached image, then:

1. Open it in the admin (**Commissions** → the commission) — the reference should display. That link is
   signed and expires after an hour.
2. In the Cloudflare dashboard, R2 → `linsilk-private` → Objects: the file is there, under
   `private/`. R2 → `linsilk`: it is **not**.
3. `linsilk-private` → Settings → Public access: still *Disabled*, no custom domain.

If you made the catalogue agent's key (step 11), check that roles hold it back. From any
terminal:

```bash
curl -s -o /dev/null -w "%{http_code}\n" -u "<the sk_ key>:" https://linsilk-medusa.onrender.com/admin/orders
```

That should print `403`. The same call to `/admin/catalogue/seasons` should print `200`.

---

## Custom domains, and going from Stripe test → live mode

Not covered here since they're one-time clicks with no ordering dependencies: point
`linsilk.ch` at the storefront and `api.linsilk.ch` (or similar) at `linsilk-medusa` in each
service's **Settings → Custom Domains**, update `NEXT_PUBLIC_MEDUSA_BACKEND_URL` and the CORS
values (step 10) to match, then switch Stripe out of test mode and repeat step 5 with the live
keys (which also means registering the webhook again, step 8, against the live-mode account).

## If something won't connect

- **Medusa exits at start with `relation "…" does not exist`** (`region_country`, `tax_provider`,
  `rbac_role`…): the migrations never ran against this database. Put `db:migrate` in the Pre-Deploy
  Command or the Start Command (step 6).
- **Medusa exits at start with `Could not find index.html in the admin build directory`**: the
  Build Command is missing the `cp -r …` on the end (step 6).
- **Storefront build fails with `Failed to build /… because it took more than 60 seconds`**: the
  storefront could not get an answer from `linsilk-medusa`, which is usually down, not slow.
  Each read now gives up after 8 seconds, so the build renders what it has instead; fix Medusa
  first (check its log) and redeploy.
- **Medusa won't boot**: check the deploy log for which env var it says is missing —
  `medusa-config.ts` refuses to start without `DATABASE_URL`, `REDIS_URL`, both secrets and the
  three CORS values, and names the missing one rather than failing silently.
- **After splitting out `linsilk-worker` (step 7), it behaves as if it's a different install**
  (jobs silently not running, sessions from the web service not recognized): `JWT_SECRET` or
  `COOKIE_SECRET` don't match between the two services — go back to step 1's values and re-paste
  them onto both. Doesn't apply if you're still on `linsilk-medusa` alone in `shared` mode.
- **Medusa won't boot, error names `S3_PRIVATE_BUCKET`**: it's missing, or it's the same bucket
  as `S3_BUCKET`, on `linsilk-medusa` (and on `linsilk-worker` too, if you have one — set it to
  `linsilk-private` on both) (step 3).
- **Commission form fails when a file is attached** (catalogue uploads fine): the R2 token can't
  write to `linsilk-private` — edit the token in step 5 so it covers both buckets.
- **Every admin page says "Forbidden" or "Insufficient permissions"**: the signed-in user has no
  role. Sign in as a Super Admin, give them one under **Settings → Roles**, and have them sign
  out and back in, since roles are read at sign-in. If *nobody* can get in, the role module
  isn't loading: `medusa-config.ts` must list `@medusajs/medusa/rbac` in `modules` (see
  `BACKEND-RENDER.md` §8.6).
- **Images refused**: `CATALOGUE_IMAGE_HOSTS` is blank or doesn't include the host you're
  fetching from (step 6) — the refusal message names which host was rejected.
- **Storefront 500s on `/admin`**: `DATABASE_URI` is wrong or `linsilk_payload` doesn't exist yet
  — redo step 9.
