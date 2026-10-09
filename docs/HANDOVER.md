# LinSilk — Developer Handover

**Client:** LinSilk — made-to-measure house. Office in Geneva.
**Agency:** one S Digital
**Status as of 2026-09-13:** Storefront and backend both built. A client can reserve a piece or
commission one, pay for either, and manage all of it from an account — or do any of it as a
guest. Payload is installed and its `pages` collection (Atelier, Cloth, The house) is wired end to
end; `care`, `legal`, `seasons` and `media` exist as collections but nothing reads from them yet.
What is left is that remaining editorial work, a currency switcher for browsing, and configuration
rather than code otherwise. See §10.
**Repo:** pnpm monorepo. Work sits on the `backend` branch, unmerged with `master`.

---

## 1. What this is

A luxury made-to-measure clothing store. Nothing is sold in sizes: every garment is cut to a
client's own body from a fifteen-point measurement sheet, made in a capped seasonal run, and
never restocked.

Two ways to buy:

| Path | What it is |
|---|---|
| **Seasonal piece** | A design the house drew, cut to your measurements. Reserve → atelier confirms the sheet in writing → cut. |
| **Commission** | A garment that exists because the client described it. Silhouette + cloth + written note + reference images + measurements. **A request for a quote**: it never enters the cart, nothing is charged on the page, and a tailor writes back with the price. |

The design came from a Claude Design prototype, since removed from the repo (it is in the git
history). It was a **visual reference, not a spec** — treat the live site as the source of truth.

---

## 2. Stack, and why

| Layer | Choice | Reasoning |
|---|---|---|
| Storefront | **Next.js 16.3.4** (App Router), React 19.2 | Full design control over the checkout, which is where this design lives or dies |
| Styling | **CSS Modules + token layer** | The design is `clamp()` and exact hex throughout; Tailwind arbitrary values would be strictly worse |
| Motion | **motion 13** (Framer Motion) + **lenis** | Scroll-linked work needs interpolated scroll or it reads as jitter |
| Commerce | **Medusa v2**, self-hosted | Open source, TypeScript end to end, multi-currency regions in core, line-item metadata carries the measurement sheet |
| CMS | **Payload 3**, installed into the Next app | Open source, TypeScript, runs on the same Postgres — `pages` is wired; `care`/`legal`/`seasons`/`media` are schema only |
| Tests | **Vitest** | 38 tests on the measurement maths and catalogue translation |

**Shopify was rejected deliberately.** Two reasons, both sound: the client will not accept
per-feature paywalls, and more importantly Shopify's model is cart → checkout → paid, which
fights a house where the price of a commission is not known until a person has read the brief.

> The trade this makes: self-hosting moves the ops burden onto one S Digital permanently.
> That is priced into the retainer. Do not describe Medusa as both cheaper *and* easier — it is
> cheaper and **harder**.

---

## 3. Repo layout

```
Maison Ayla/                (repo folder name on disk — unchanged; brand is LinSilk)
├─ apps/storefront/          Next.js 16 · the whole storefront, and Payload
│  ├─ app/                   Routes (App Router), incl. app/(payload) — Payload's admin and API
│  ├─ components/            Design system, motion primitives, commerce widgets
│  ├─ lib/                   Catalogue, measurements, cart · the domain layer
│  ├─ payload/               Payload's collections and its seed script
│  ├─ payload.config.ts      Payload's own config — its Postgres db, secret, collections
│  └─ public/measure/        Measurement guide plates  ⚠ see §8
├─ docs/                     This file, and BACKEND-RENDER.md
├─ docker/init-db.sql        Creates the Payload database alongside Medusa's
└─ docker-compose.yml        Postgres 16 + Redis 7 for local dev
```

**76 source files, ~7,540 lines, 30 route files, 84 prerendered pages.**

---

## 4. Running it

```bash
pnpm install
pnpm --filter storefront dev     # http://localhost:3000
```

```bash
pnpm --filter storefront test    # 38 tests, measurement maths and catalogue translation
```

```bash
pnpm services                    # Postgres + Redis (needs Docker Desktop running)
```

---

## 5. The domain model

Everything lives in `apps/storefront/lib/`. This is the part to read first — it is shaped for
the Medusa handover, so the backend should conform to it rather than the other way round.

### `catalog.ts`

**A collection is a first-class entity, not a label.**

```ts
type Collection = {
  slug: string;        // 'autumn-iv'
  season: string;      // 'Autumn'
  number: number;      // 4
  title: string;       // 'Autumn — Collection IV'
  status: 'current' | 'past';
  note: string;        // the cloth the season was built on
  closes?: string;     // current collection only
}
```

`status` is the whole gate. `current` is open and orderable; `past` is readable but never
orderable again. `isOrderable(piece)` derives from it, and an archived product page shows a
record rather than a form that could never be submitted.

**All counts are derived from the pieces, never written down.** The prototype hardcoded
"fourteen designs" and was already wrong against its own data.

4 collections, 53 pieces. Collection IV (17 pieces) is real; Collections I–III (36 pieces) are
**placeholder content** — see §8.

### `measurements.ts`

**Everything is stored canonically in centimetres.** The unit toggle is display only. This is
not a detail: the prototype swapped the `cm`/`in` label without converting the number, which
would have sent the atelier a 38-inch chest recorded as 38 cm.

Fifteen body measurements, taken from the atelier's own chart:

| | Measurement |
|---|---|
| 01 | Neck ◇ |
| 02 | Shoulder |
| 03 | Bust / chest |
| 04 | **Bust point** |
| 05 | **Front waist length** |
| 06 | **Back waist length** |
| 07 | Waist |
| 08 | Hip |
| 09 | **Hip depth** |
| 10 | Thigh |
| 11 | Knee |
| 12 | Sleeve length |
| 13 | Upper arm |
| 14 | Wrist ◇ |
| 15 | Rise |

◇ Not on the client's chart. Retained because a collared shirt needs both. Client has confirmed
these calls are correct.

**The four bold entries are drops, not girths** — measured down from a fixed point. They are
what let a flat pattern sit on a specific body, and no amount of chest-and-waist substitutes for
them. They were entirely absent from the prototype.

Plus the **garment lengths**, which vary by garment and are a decision rather than a body fact.
A piece names its own in `lengthKinds`, and a set names two — a sleep set is a top and a trouser
on one ticket:

| Kind | Label |
|---|---|
| `dress` | Dress length |
| `skirt` | Skirt length |
| `trouser` | Trouser length |
| `top` | Desired length |
| `robe` | Robe length |

Each writes to its own field (`lengthDress`, `lengthSkirt`, `lengthTrouser`, `lengthTop`, `lengthRobe`), so a
set can carry two lengths without one overwriting the other. A piece declares `lengthKinds`; the
scarf declares none and is complete at 15.

`RANGES` catches misplaced decimals and inches typed into a cm field — it does not reject a
body, and says so in the error text.

### `cart.tsx`

Quantity is always one — every line is a garment cut for one person. Seasonal pieces only: a
commission is quoted by a person and never enters the cart. The line carries the whole brief —
cloth, measurement sheet, unit, `zoneCount`. **That payload is what reaches the bench**, so it
lives on the line. The backend enforces all of this again in `cart-rules.ts`.

The cart itself is a Medusa cart; only its id is kept in the browser, which is what lets someone
close the tab and come back to it. A line carries the zones **its own garment** asked for — a
coat one length, a set two — because serialising a sheet with the fifteen body zones alone drops
the length and the backend rightly refuses the line.

---

## 6. Design system

`app/globals.css` holds the token layer, lifted verbatim from the prototype.

- **Ground** `--bone #EDE6D9` · **Ink** `--ink #2A2620` · **Accent** `--gold #9C7A44`
- **Fields** `--sand #D9CBB3` (The Cloth) · `--forest #37432E` (Design Your Own)
- **Type** Archivo (interface) · Newsreader (all display) · Caveat (**only** chalk annotations) · system mono (art-direction notes)
- **One easing curve everywhere**: `cubic-bezier(0.16, 1, 0.3, 1)`
- **Breakpoints**: 640 mobile→tablet · 900 tablet→desktop · 1200 wide
- Single committed light scheme. There is no dark mode, deliberately.

Only three global classes exist (`u-wrap`, `u-wrap-narrow`, `u-balance`) so there is nothing for
the modules to collide with.

> **A note on the palette.** Warm cream + serif display + tan accent is currently the single most
> generic "AI-designed" look there is. What keeps this off that pile is subject specificity —
> the chalk marks, the mono art-direction notes, Roman numerals.
> **Do not sand those off.** They are the design. (Momme weights, mill-and-date logging, the
> Kortrijk linen and the "ticket" were removed on 2026-10-07: the user said they are not real.)

---

## 7. Motion

`components/motion.tsx` — vocabulary drawn from the house's craft, not stock web effects:

| Primitive | What it does |
|---|---|
| `LineRise` | Masked line-by-line rise. The hero's signature; runs on load, not scroll |
| `ClothWipe` | `clip-path` reveal — an image unrolls rather than fades |
| `RuleDraw` | A hairline drawn across like a chalk line snapped along cloth |
| `ChalkMark` | Leader line strikes, then the handwriting settles beside it |
| `Parallax`, `HeroMedia`, `Reveal`, `Stagger`, `Count` | The supporting set |

`components/drag-rail.tsx` is a **native scroll container**, not an animated transform — see §9.

Every primitive degrades to static under `prefers-reduced-motion`, and carries `data-reveal` so
the `<noscript>` rule in `layout.tsx` restores the resting state if JS never arrives.

**Lenis** (`components/smooth-scroll.tsx`) interpolates page scroll. It does not mount at all
under reduced motion, where hijacking scroll would be hostile.

---

## 8. What needs the client

| Item | Status |
|---|---|
| **Photography** | All placeholder. Every frame renders a woven gradient carrying the art direction for the shot that belongs there — brief a photographer straight from those notes. |
| **Measurement guide plates** | ⚠ `public/measure/{women,men}.png` are the **prototype's old plates and now contradict the list beneath them** — they show no drops and no rise. A new guide must be drawn from the client's chart. **Highest-priority content blocker.** |
| **Archive contents** | Collections I–III (36 pieces) are invented, written to match each season's stated cloth. The client must supply the real archive. Collection IV is real. |
| **Legal** | `/legal/terms` and `/legal/privacy` are structured placeholders listing what must be covered. **Not drafted, deliberately.** Privacy matters here: body measurements are personal data transferred to the atelier abroad, which needs a stated GDPR transfer safeguard. |
| **Duty & VAT position** | The footer claims duty is included in Switzerland *and* the EU. Switzerland is outside the EU customs union and the goods are made outside both — a three-way customs problem. Needs an answer from the client's accountant before go-live. |
| **Instagram handle** | `@linsilk` is assumed in the footer. |

---

## 9. Two bugs fixed in the prototype

Worth knowing, because both were silent.

**The unit toggle never converted.** It changed the `cm`/`in` label and left the number alone.
Now stored canonically in cm; regression-guarded in `lib/measurements.test.ts`.

**The stagger animation never ran.** Each child was wrapped in a `display: contents` motion box.
That removes the element's box entirely, so `transform` and `opacity` had nothing to apply to.
The wrapper is now the actual grid item.

**And one of mine, fixed:** the first rail rewrite fired a new spring animation per wheel tick,
each fighting the last — that was the "sticky" feel. It is now a native scroll container. One
subtlety to preserve: Lenis's own stylesheet sets `overscroll-behavior: contain` on
`[data-lenis-prevent]`, which is **both axes** and traps the page at the end of a rail. Rails are
tagged `data-rail` and override it to `x: contain, y: auto` in `globals.css`. An exhausted
vertical gesture is handed to Lenis explicitly so the easing stays continuous.

---

## 10. Built since, and still to build

Built — **see `docs/BACKEND-RENDER.md`**:

- Medusa backend: catalogue, three regions, the capped run, the archive gate and the cart rules
- Euro and sterling prices derived hourly from the franc at the ECB's rate
- Commissions as quote requests, cloth catalogues, and the atelier's screens for both
- Reference files stored privately; catalogues public
- Transactional email through Resend (a key and `ATELIER_EMAIL` are needed, or nobody is told)

- Checkout on the backend: a Medusa cart, real shipping options, Stripe Elements, and an order
  at the end of it. A seasonal cart follows the client to their region, so a Swiss cart becomes a
  euro one at a German address; a commission cart cannot, and does not try.
- A quote becomes payable by itself: the figure a tailor sets makes the commission a product of
  its own — one variant, stock of one — and emails an unguessable link to pay for it. Paying it
  produces an ordinary order, moves the brief to `in_production` and retires the link.

- Accounts: register, sign in, and a password reset by email — Medusa's own auth, the storefront
  just asks for it now. Order history, a saved measurement profile (`toLineItemMetadata` and its
  inverse, `fromLineItemMetadata`, both in `lib/measurements.ts`), and settings to edit the name
  and phone on file, change the password, keep an address book, and close the account. The
  session is a Medusa JWT in an httpOnly cookie, never in reach of client JS the way the cart id
  is — which is why account pages are Server Components rather than the cart's client pattern.
  Email is not editable from the account; the customer-update endpoint doesn't accept it.

- Payload 3, installed into the Next app on its own `linsilk_payload` Postgres database (no fifth
  service). The `pages` collection — Atelier, Cloth, The house — is wired end to end: seeded from
  the old `STORY` constant in `lib/catalog.ts` (`payload/seed.ts`), read live from Payload by the
  three routes that used to read `STORY` directly (`lib/payload.ts`'s `getStoryPage`). `care`,
  `legal`, `seasons` and `media` exist as collections with a minimal schema but nothing reads from
  them yet — see `BACKEND-RENDER.md` §5 for why those four are scoped out of this pass.

Still to build:

- A content model for `care` and `legal` — sections, lists, comparison rows — so the four /care
  pages and two /legal pages can actually be edited in Payload rather than in code. `legal` has
  nothing real to put there yet regardless (awaiting a lawyer, §8).
- `seasons` and `media` need a consuming page before populating either one means anything —
  today's archive pages carry nothing beyond the one-line `collection.note` already in Medusa
- Currency switcher for browsing (checkout already switches; the shop pages read the Swiss
  region's prices)
- Production status screens for the bench
- Saved addresses are not yet offered as a picker at checkout, which still asks fresh

Configuration, not code, is what stands between this and taking money: a Stripe key (checkout
falls back to a provider that authorises without charging, and says so on the page), a Resend key
and a verified sender, and two R2 buckets (one public, one never). See `BACKEND-RENDER.md` §6 and §8.5.

---

## 11. Verified

- Build clean on both apps
- 38 Vitest tests on the storefront, 47 unit and 46 API tests on the backend
- Reserve, check out and pay end to end, by hand in a browser: a seasonal piece in Swiss francs,
  the same cart re-priced in euro at a German address, and a commission accepted from its link
- An account end to end, by hand: register, sign in, edit the profile, add and edit and remove a
  saved address, change the password, reset a forgotten one from a real emailed link, and close
  the account — each wrong-password and missing-field case refused, each successful change
  checked against Postgres directly rather than trusted from the response alone
- **No horizontal overflow** on any route at 375 / 768 / 1440 — audited programmatically
- Rail wheel handling: 1:1 with the gesture, hands back at both ends
- Archived pieces show no reserve form; garment length appears only where it applies
- Payload boots locally against Postgres (schema pushed, no migration written yet — dev only) and
  `/admin` reaches the first-user screen. The `pages` collection round-trips: seeded, then read
  back by the storefront — Atelier, Cloth and The house render byte-identical title, description
  and body copy to before, confirmed against the rendered HTML and against Postgres directly, and
  survive a full `next build` (still prerendered, not merely working in dev)

**Not verified:** the Lenis handover at the end of a rail. Lenis animates on `requestAnimationFrame`,
which is suspended while a browser pane is hidden, so it could not be confirmed headlessly.
**Check this by hand in a real browser.**
