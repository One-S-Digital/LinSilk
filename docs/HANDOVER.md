# Maison Ayla — Developer Handover

**Client:** Maison Ayla — made-to-measure house. Atelier in Hội An, Việt Nam; office in Zürich.
**Agency:** one S Digital
**Status as of 2026-09-10:** Storefront complete and building. Backend not yet started.
**Repo:** pnpm monorepo, `master` branch, **no commits yet** — the tree is untracked by deliberate choice.

---

## 1. What this is

A luxury made-to-measure clothing store. Nothing is sold in sizes: every garment is cut to a
client's own body from a fifteen-point measurement sheet, made in a capped seasonal run, and
never restocked.

Two ways to buy:

| Path | What it is |
|---|---|
| **Seasonal piece** | A design the house drew, cut to your measurements. Reserve → atelier confirms the sheet in writing → cut. |
| **Commission** | A garment that exists because the client described it. Silhouette + cloth + written note + reference images + measurements. Priced as an **estimate** until the tailor has read the brief. |

The design came from a Claude Design prototype, kept for reference at
`Maison Ayla prototype with Framer Motion/`. It is a **visual reference, not a spec** — treat it
as art direction. `support.js` in that folder is the Claude Design runtime and was never ported.

---

## 2. Stack, and why

| Layer | Choice | Reasoning |
|---|---|---|
| Storefront | **Next.js 16.3.4** (App Router), React 19.2 | Full design control over the checkout, which is where this design lives or dies |
| Styling | **CSS Modules + token layer** | The design is `clamp()` and exact hex throughout; Tailwind arbitrary values would be strictly worse |
| Motion | **motion 13** (Framer Motion) + **lenis** | Scroll-linked work needs interpolated scroll or it reads as jitter |
| Commerce | **Medusa v2** *(not built yet)* | Open source, TypeScript end to end, multi-currency regions in core, line-item metadata carries the measurement sheet |
| CMS | **Payload 3** *(not built yet)* | Open source, TypeScript, runs on the same Postgres, installs into the Next app |
| Tests | **Vitest** | 19 tests on the measurement maths |

**Shopify was rejected deliberately.** Two reasons, both sound: the client will not accept
per-feature paywalls, and more importantly Shopify's model is cart → checkout → paid, which
fights a house where the price of a commission is not known until a person has read the brief.

> The trade this makes: self-hosting moves the ops burden onto one S Digital permanently.
> That is priced into the retainer. Do not describe Medusa as both cheaper *and* easier — it is
> cheaper and **harder**.

---

## 3. Repo layout

```
Maison Ayla/
├─ apps/storefront/          Next.js 16 · the whole storefront
│  ├─ app/                   Routes (App Router)
│  ├─ components/            Design system, motion primitives, commerce widgets
│  ├─ lib/                   Catalogue, measurements, cart · the domain layer
│  └─ public/measure/        Measurement guide plates  ⚠ see §8
├─ docs/                     This file, and BACKEND-RENDER.md
├─ docker/init-db.sql        Creates the Payload database alongside Medusa's
├─ docker-compose.yml        Postgres 16 + Redis 7 for local dev
└─ Maison Ayla prototype…/   Original Claude Design output · reference only
```

**57 source files, ~7,970 lines, 20 route files, 77 prerendered pages.**

---

## 4. Running it

```bash
pnpm install
pnpm --filter storefront dev     # http://localhost:3000
```

```bash
pnpm --filter storefront test    # 19 tests, measurement maths
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

Fifteen body measurements, translated from the atelier's own Vietnamese chart. Each carries the
tailor's own term, because that is what is written on the ticket in Hội An:

| | English | Vietnamese |
|---|---|---|
| 01 | Neck | Cổ ◇ |
| 02 | Shoulder | Vai |
| 03 | Bust / chest | Ngực |
| 04 | **Bust point** | **Hạ đỉnh ngực** |
| 05 | **Front waist length** | **Hạ eo trước** |
| 06 | **Back waist length** | **Hạ eo sau** |
| 07 | Waist | Eo |
| 08 | Hip | Mông |
| 09 | **Hip depth** | **Hạ đỉnh mông** |
| 10 | Thigh | Đùi |
| 11 | Knee | Gối |
| 12 | Sleeve length | Dài tay |
| 13 | Upper arm | Bắp tay |
| 14 | Wrist | Cổ tay ◇ |
| 15 | Rise | Đáy quần |

◇ Not on the client's chart. Retained because a collared shirt needs both. Client has confirmed
these calls are correct.

**The four bold entries are drops, not girths** — measured down from a fixed point. They are
what let a flat pattern sit on a specific body, and no amount of chest-and-waist substitutes for
them. They were entirely absent from the prototype.

Plus **one garment length**, which varies by garment and is a decision rather than a body fact:

| Kind | Label | Vietnamese |
|---|---|---|
| `dress` | Dress length | Chiều dài đầm |
| `skirt` | Skirt length | Dài váy |
| `trouser` | Trouser length | Dài quần |
| `top` | Desired length | Dài áo |

All four write to the same `length` field; only one is ever asked for. A piece declares its
`lengthKind`; a piece without one (a tee) is complete at 15.

`RANGES` catches misplaced decimals and inches typed into a cm field — it does not reject a
body, and says so in the error text.

### `cart.tsx`

Quantity is always one — every line is a garment cut for one person. The line carries the whole
brief: cloth, measurement sheet, unit, `zoneCount`, and for a commission the silhouette and the
client's note. **That payload is what reaches the bench**, so it lives on the line.

State is React context mirrored to `localStorage`. **This module is the swap point**: replace
its internals with Medusa Store API calls against a real cart id and every consumer is unchanged.

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
> the chalk marks, the mono art-direction notes, momme weights, Roman numerals, the Vietnamese
> terms, mill-and-date logging. **Do not sand those off.** They are the design.

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
| **Measurement guide plates** | ⚠ `public/measure/{women,men}.png` are the **prototype's old plates and now contradict the list beneath them** — they show no drops and no rise. A new guide must be drawn from the client's Vietnamese chart, labelled in both languages. **Highest-priority content blocker.** |
| **Archive contents** | Collections I–III (36 pieces) are invented, written to match each season's stated cloth. The client must supply the real archive. Collection IV is real. |
| **Legal** | `/legal/terms` and `/legal/privacy` are structured placeholders listing what must be covered. **Not drafted, deliberately.** Privacy matters here: body measurements are personal data transferred to Việt Nam, which needs a stated GDPR transfer safeguard. |
| **Duty & VAT position** | The footer claims duty is included in Switzerland *and* the EU. Switzerland is outside the EU customs union and the goods originate in Việt Nam — a three-way customs problem. Needs an answer from the client's accountant before go-live. |
| **Instagram handle** | `@maisonayla` is assumed in the footer. |

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

## 10. Not built yet

- Medusa backend — **see `docs/BACKEND-RENDER.md`**
- Payload CMS for the editorial pages
- Accounts, order history, saved measurement profiles (`/account` is a placeholder explaining this)
- Stripe (`/checkout` has the Elements mount point marked and the section flow working; card
  fields are **deliberately** not built — they belong inside Stripe's iframe, never on our origin)
- Transactional email
- Currency switcher (CHF/EUR/GBP; regions exist in the plan, no UI yet)
- Real file upload for commission references — the flow validates type, size and count, but
  files are not yet persisted anywhere

---

## 11. Verified

- Build clean, 77 pages prerendered
- 19 Vitest tests on measurement maths
- **No horizontal overflow** on any route at 375 / 768 / 1440 — audited programmatically
- Rail wheel handling: 1:1 with the gesture, hands back at both ends
- Archived pieces show no reserve form; garment length appears only where it applies

**Not verified:** the Lenis handover at the end of a rail. Lenis animates on `requestAnimationFrame`,
which is suspended while a browser pane is hidden, so it could not be confirmed headlessly.
**Check this by hand in a real browser.**
