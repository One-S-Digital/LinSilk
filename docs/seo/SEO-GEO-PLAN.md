# LINSILK — SEO & GEO Plan (v3, ready for implementation)

**v3, 2026-10-22:** client decisions of 22 Oct applied (brand spelling, hand-work wording, held pages, high-frequency wording; §13), implementation status added (§0), schedule re-dated from the missed Sprint 0 (§11). Every remaining open item now has a placeholder, so no task in §11 is blocked from being built; the items in §13 block only *publishing* the specific line they name.

Prepared 2026-10-19, revised the same day after the client review. Built on `LINSILK_SEO_GEO_Brief.md` (market targeting), the storefront code in `apps/storefront`, the **live site** (bylinsilk.com, checked 19 Oct) and searches in German and French. Copy lives in [`COPY-PAGES.md`](COPY-PAGES.md) (pages, templates, schema) and [`COPY-GUIDES-FAQ.md`](COPY-GUIDES-FAQ.md) (guides, market pages, answer bank).

**What changed in v2:** origin wording now matches the live site (§3.1); fabric claims cover the cloth only (§3.2); every price comes from the live site in whole francs (§3.3); piece pages are treated as long-lived because designs carry over between collections (§7); new sections for product feeds (§8), entity and off-site work (§9), slugs, canonicals, FAQ markup, Product schema, IndexNow, analytics and AI-referral tracking (§6); the full scope is scheduled to completion (§11).

---

## 0. Implementation status (checked 22 Oct 2026)

**Most of the English Sprint 1 work is built but not live.** It sits uncommitted on the `backend` branch (41 tracked files changed, plus new files). `tsc --noEmit` passes and `vitest run` passes (12 files, 80 tests). bylinsilk.com still returns 404 for `/robots.txt`, `/sitemap.xml`, `/made-to-measure`, `/uae`, `/occasion/wedding-guest` and `/llms.txt`.

| Area (plan §) | In the code | Still to do |
| --- | --- | --- |
| Deploy (§6.1) | — | Commit, merge `backend` → `master`, deploy, confirm the six URLs above return 200 |
| Brand, titles, H1 (§6.2) | LINSILK in titles and copy; home has one `<h1>` | Two code comments still say LinSilk (harmless); `og:locale` per locale comes with §6.7 |
| Slugs + 301 (§6.3) | Piece route resolves slug or legacy id and 301s to the slug; retired designs 301 to successor or category (§7) | Locale slugs (`slug_de`, `slug_fr`) with §6.7 |
| Canonicals (§6.4) | Set on 18 files | Crawl check after deploy |
| Structured data (§6.5) | `organizationLd`, `websiteLd`, `productLd` (MadeToOrder), `breadcrumbLd`, `faqLd` in `lib/jsonld.ts` | `shippingRate` waits for `[SHIPPING_COST]`; `hasMerchantReturnPolicy` waits for §13.3; Article schema with the guides |
| IndexNow (§6.9) | `lib/indexnow.ts`, `app/api/indexnow`, key file in `public/`, Medusa `product-changed` subscriber | Payload `afterChange` hook and deploy hook; Bing Webmaster setup |
| `llms.txt` (§6.9) | `public/llms.txt` | Keep links in step as pages ship |
| Feeds (§8) | `app/feeds/google.xml`; `app/feeds/openai.jsonl` (stable spec read 22 Oct: JSONL, search only, delivered by upload not URL pull) | Merchant Center test feed and `color`/`size` diagnostics; OpenAI merchant sign-up and upload |
| Currency (§6.8) | AED added to `lib/exchange.ts` | — |
| Analytics (§6.10) | Umami script in `app/layout.tsx` `<head>` (website id b072ba84…); events `piece_view`, `select_colour`, `sheet_started`, `sheet_confirmed`, `order_placed` (with revenue); privacy line added | After deploy: test visit with `?utm_source=chatgpt.com`, save the "AI assistants" filter in Umami, exclude localhost/preview visits |
| Live-text fixes (§6.12) | "Woven by hand", "shell to thread", pocket-bag and linen-jacket lines are gone | "Not made again" remains on archive pages, which is correct for archived seasons; check the piece page and footer against §7 |
| New EN pages (§5) | `/about`, `/made-to-measure`, `/uae`, `/occasion/wedding-guest`, `/collection/sleepwear`, category edits under `/collection/[group]/[edit]` | Guides, Luxembourg, seasonal edits. Built 22 Oct: `/de/ballkleid-seide` (German, `lang="de-AT"`, in the sitemap; needs native-speaker read, §13.7) and `/legal/notice` with placeholders (noindex, not yet linked from the footer) |
| Languages (§6.7) | None | Sprint 2 |

## 1. The strategy in seven lines

1. **Own "made-to-measure + silk/linen + Geneva".** Searches for a Swiss or Geneva made-to-measure silk dress ordered online found no direct competitor (shirt and suit ateliers, Vienna rental shops, US ateliers quoting about 60 days with fittings). 2–4 weeks, no fittings, CHF 119–359 is a position nobody holds.
2. **Answer first, then prove it.** Every page opens with the sentence a searcher or an AI engine would lift, names LINSILK in it, then gives the facts (cloth, lead time, price, colours, delivery, duty).
3. **One page per query cluster, per language** (§5 is the ownership map). German and French are written for the market (Swiss spelling, Austrian ball season), not machine copies.
4. **Only claims the live site already makes, stated as checkable facts.** No "made in Geneva", no "shell to thread", no adjectives an engine can't quote. Wrong facts are the fastest way to lose AI citations (§3).
5. **Fix the technical floor first** (§6): robots and sitemap live, keyword slugs, canonicals, structured data, one brand spelling, analytics.
6. **Feeds are half of GEO for a shop.** Google Merchant Center, Microsoft Merchant Center and the ChatGPT merchant feed put the catalogue into Shopping, AI Mode and ChatGPT shopping answers (§8).
7. **Win the long tail the giants ignore**: occasion (wedding guest, Ball), cloth (is silk worth it, linen for heat), process (how to measure, made-to-measure vs bespoke) and each of the eight markets.

---

## 2. Status of the live site (checked 19 Oct 2026)

| Area | Live finding | Impact | Fix |
| --- | --- | --- | --- |
| **robots.txt / sitemap.xml** | **Both return 404 on bylinsilk.com.** The code exists (`app/robots.ts`, `app/sitemap.ts`, commit `a8d5596`) but only on the `backend` branch | Crawlers get no sitemap; Search Console and Bing can't be fed | Merge `backend` → `master` and deploy (§6.1, day 1) |
| Host | `www` and `http` 301 to `https://bylinsilk.com` | Good | Keep; canonicals use the apex (§6.4) |
| AI crawler access | GPTBot, PerplexityBot, ClaudeBot all get 200 through Cloudflare | Good for GEO | Monitor monthly; Cloudflare's AI-bot blocking must stay off (§6.9) |
| Analytics | **None installed** | Nothing in §12 can be measured | Install before any page ships (§6.10) |
| Language | `lang="en"`, `og:locale en_CH`, no locale folders, no hreflang | Invisible in DE/FR/AT/LU searches | §6.7 |
| Brand name | Titles, logo alt, © line say "LinSilk"; brand copy says "LINSILK" | Two entities for engines | **LINSILK** (closed §13.1) |
| Home | No `<h1>` (hero lines are `<span>`s); title "LinSilk — made to measure in pure natural fibre" | Weak signal on the most-linked page | COPY-PAGES §2 |
| Hero claim | "Woven by hand" | Inaccurate (LINSILK does not weave) | Replace (COPY-PAGES §2) |
| Fibre claims | Home: "Nothing synthetic enters the shell, the lining or the thread", stat "100% natural fibre, shell to thread"; `/cloth` and `lib/catalog.ts`: "no polyester in the… pocket bag or the thread" | Over-claim: buttons, zips and similar trims are not silk or linen | Reword to the cloth only (§3.2) |
| Piece URLs | `/piece/001` … `/piece/070` | No keywords in the URL | Keyword slugs + 301 (§6.3) |
| Piece pages | Title = piece name only; no price or lead time in description; no facts block, no structured data; no canonical | Can't match "made to measure silk dress"; no price in results | COPY-PAGES §6, §6.5 here |
| Piece prices | Whole francs on the live site (e.g. CHF 119, 279, 359). `prices.json` in the pipeline folder is stale (`.99` values) | Copy must quote the live figures | §3.3 |
| Image alt | `alt={piece.name}` on the hero only | Image search, accessibility | Alt per view (COPY-PAGES §6.3) |
| Categories | `/collection/women` H1 "Women", two generic sentences; no cloth or occasion pages | Misses "silk dress", "linen set" | COPY-PAGES §3 |
| `/collection` | H1 is `sr-only`, title "Collection" | Thin | Visible H1 + 80-word intro |
| About (`/contact`) | Title "The house", ~90 words | Weak entity page | Expanded About (COPY-PAGES §4) at `/about`, `/contact` stays as contact |
| `/cloth` | ~100 words, 3 photos; mentions "a linen jacket" (none are sold) | Thin for the cloth cluster | COPY-PAGES §5 |
| `/design` | The Design Your Own commission flow; no crawlable body copy | The commission cluster has no text; the made-to-measure process has no page of its own | New `/made-to-measure` page + `/design` copy (§5, COPY-PAGES §7) |
| `/care/questions` | 4 questions | Answer engines want 20–30 | Answer bank (COPY-GUIDES-FAQ §3) |
| Structured data | None | No price/availability in results, weak entity | §6.5 |
| Canonicals | None anywhere | Duplicates once locale folders and slugs exist | §6.4 |
| Footer | "Four small collections a year, each made once"; "Geneva, Switzerland" | Good; keep. "Each made once" needs a new wording now designs carry over (§7) | COPY-PAGES §1 |

**Copy conflicts** (each affects what AI engines will repeat):

1. **Hand-work wording. Closed 22 Oct:** keep the live piece-page wording, "cut flat by hand… hem, facings and lining by hand". "Hand-sewn" as a general claim is still not used.
2. **Duty.** The live shipping page says prices include duty within Switzerland and the EU; the UK and rest of world pay on arrival. Copy uses that wording. Client to confirm it is operationally true for every EU country before it is put in schema (§13.2).
3. **Returns.** Live: no change-of-mind returns on made-to-measure work; faults repaired or replaced; cancellable before cutting. Copy uses exactly that; the EU exemption wording needs a legal check (§13.3).
4. **"Frequency" language. Closed 22 Oct (client decision):** the high-frequency idea is written as plain fact, in the client's own brand-pillar wording, with no "we believe" framing and no legal-review gate. The guide ships on the §11 schedule.

---

## 3. Fact rules (every page, every language, schema and feeds)

### 3.1 Origin: match the live site

The live site says where orders are **handled and dispatched**, never where garments are **made**. All copy does the same.

| Use (live-site wording) | Never use |
| --- | --- |
| "from Geneva", "a Geneva house", "based in Geneva, Switzerland" | "made in Geneva", "cut and sewn in Geneva", "sewn in Geneva" |
| "dispatched from Geneva", "orders and client care are handled from Geneva", "the office in Geneva" | "before it leaves Geneva", a facts-block line "Made in: …" |
| "inspected twice, then dispatched from Geneva" (shipping page) | "Swiss made", "Swiss-made", "Schweizer Fertigung", "fabriqué en Suisse / à Genève" |
| DE: «aus Genf», «ein Genfer Modehaus», «Versand aus Genf» | DE: «in Genf gefertigt / genäht / zugeschnitten» |
| FR: «de Genève», «une maison genevoise», «expédié depuis Genève» | FR: «fabriqué / cousu / coupé à Genève», «créé à Genève» |

"Swiss", "Geneva", "Genf", "Genève" stay in titles and the Organization schema as the house's location. Swiss origin law (the "Swissness" rules) and UWG treat a false place of manufacture as misleading, so this rule beats any keyword.

### 3.2 Fabric: the cloth only

Buttons, zips, hooks and similar trims are not silk or linen. Copy speaks about the **cloth** and nothing else.

- **Use:** "made in 100% silk" / "100% linen", "pure silk cloth", "the cloth is pure silk or pure linen, never a blend or a synthetic", "no polyester or blended cloth".
- **Never:** "shell to thread", "from shell to lining to thread", "no synthetics anywhere in the garment", "not in the pocket bag or the thread", "100% natural fibre, shell to thread".
- The schema `material` field is "Silk" or "Linen" (the cloth). It makes no claim about trims.
- The same fix applies to the live site: the home pillar, the home stat label, the `/cloth` prose and the `lib/catalog.ts` cloth lead (listed in §6.12).

### 3.3 Prices: whole francs, from live data

- The live site already shows and charges whole francs (CHF 119, CHF 279…). Copy quotes those figures exactly: **"from CHF 119"**, never a rounded-up "from CHF 120" or a `.99` figure.
- On the site every price in copy is **rendered from Medusa at build or request time**, never typed into a page. If a price changes, titles, descriptions, facts blocks, schema and feeds change with it. The figures in the copy files are the 19 Oct live values, for review only.
- Ranges on 19 Oct 2026 (66 pieces, live):

| Group | From | To |
| --- | --- | --- |
| Whole range | CHF 119 | CHF 359 |
| Silk, all | CHF 159 | CHF 359 |
| Silk dresses and gowns (001–012, 063, 064, 066) | CHF 239 | CHF 359 |
| Floor-length silk gowns (001, 003, 004, 010, 011) | CHF 279 | CHF 359 |
| Wedding-guest wrap, midi and flutter-sleeve dresses (002, 005, 007, 008, 009, 012, 063, 064, 066) | CHF 239 | CHF 339 |
| Silk skirts (013, 014) | CHF 179 | CHF 179 |
| Silk blouses (069, 070) | CHF 159 | CHF 159 |
| Silk sleepwear (030–039) | CHF 159 | CHF 359 |
| Women's linen sets (015–029) | CHF 269 | CHF 299 |
| Men's linen shirts | CHF 119 | CHF 179 |
| Men's linen trousers | CHF 149 | CHF 174 |
| Men's 2-piece set (040) | CHF 299 | CHF 299 |

### 3.4 Other fixed facts (verified on the live site)

48 silk colours (15 plain LS-S, 20 jacquard LS-J, 13 brocade LS-B) · 40 linen colours (LS-L) · 15 measurements · 2–4 weeks from the confirmed measurement sheet · delivery once dispatched: Switzerland 2–3 days, EU and UK 3–6, rest of world 5–10 · tracking, plus an email when the pattern is cut and when the piece passes its second check · hello@bylinsilk.com, answered by a person, usually within a day. Shipping cost is not stated on the live site: `[SHIPPING_COST]` placeholder until the client confirms (§13.2).

---

## 4. Keyword and question strategy

### 4.1 Principles

- Cluster map = the brief's keyword map. This plan adds the **questions** people ask Google's People-also-ask box and AI engines, and gives each one a page and a pre-written answer.
- Primary phrase in every commercial title: **made-to-measure** (*nach Mass* CH, *nach Maß* AT/DE, *sur mesure* FR). Synonyms (tailor-made, custom-made, have it made, made to order) go in H2s and body text. **Bespoke** appears only in the explainer guide.
- Cloth word first in every product title. No colour words and no "satin" in any label (title, H1, alt text, schema, feed). **Approved 22 Oct:** the silk-vs-satin guide, and example colour names in body copy and on `/cloth` (§13.5).
- Volumes: the brief's tracker is filled from a keyword tool before Sprint 3 (§11). Any page whose head term shows no measurable volume in its locale is merged into its parent page, not built on its own.

### 4.2 Question families (all answered in COPY-GUIDES-FAQ §3)

| Family | Phrasings to mirror | Page that owns the answer |
| --- | --- | --- |
| What is it | "What is made to measure clothing?" · "Was bedeutet Massanfertigung?" · "Qu'est-ce que le sur mesure ?" | `/made-to-measure` |
| Difference | "Made to measure vs bespoke vs tailor made" · "made to measure vs off the rack" | Guide 1.1 |
| Time | "How long does made to measure take?" · "Wie lange dauert Massanfertigung?" | `/made-to-measure`; repeated short on piece pages |
| Fit risk | "What if I measure wrong?" · "Can I order made to measure without a fitting?" · "Kann man Kleider online nach Mass bestellen?" | `/made-to-measure`, `/care/measuring` |
| Price | "How much does a made to measure dress cost?" | `/made-to-measure`, category pages |
| Design | "Design your own dress online" · "Kleid selbst entwerfen" · "créer sa robe sur mesure" | `/design` |
| Cloth | "Is silk worth it?" · "Is linen good for hot weather?" · "How to wash silk" | Guides, `/cloth` |
| Occasion | "What to wear to a wedding as a guest" · "Was zieht man zur Hochzeit als Gast an?" | Occasion pages |
| Trust | "Is LINSILK legit?" · "Where is LINSILK based?" · "Does LINSILK ship to Germany/Dubai?" | About, FAQ, shipping |
| Values | "Why avoid polyester?" · "Natural fibre clothing brands" | Guides, About |
| Gifting | "Silk pyjamas as a gift" · "What to give for Mother's Day" | Sleepwear page |

### 4.3 Expansions to test in the keyword tool (not volume-verified)

- DE-CH/DE/AT: *Seidenkleid Hochzeitsgast*, *Abendkleid nach Maß*, *Leinen Zweiteiler Damen Set*, *Hemd nach Maß online*, *Kleid nähen lassen online*, *Ballkleid Seide lang*, *Seidenpyjama Geschenk*, *Kleid selbst entwerfen*.
- FR: *robe soie sur mesure en ligne*, *tenue invitée mariage soie*, *ensemble lin femme*, *pyjama soie cadeau*, *créateur robe sur mesure Suisse*.
- EN/UAE: *tailor made dress Dubai*, *made to measure evening dress UAE*, *long sleeve silk maxi dress*, *linen shirt men Dubai*, *Eid outfit women silk*.
- Entity: *LINSILK*, *LINSILK Geneva*, *bylinsilk*.

---

## 5. Page inventory and cluster ownership

Each cluster has exactly one owner page per language. Other pages may mention the topic but link to the owner and do not use its head term in their title or H1.

**Fix for the home vs `/design` overlap:** v1 pointed the made-to-measure head term at both. Now:
- **Home** owns the brand + category query: *LINSILK*, *made-to-measure silk and linen clothing*, *Geneva*. Title leads with the brand.
- **`/made-to-measure`** (new page, nav label "Made to measure") owns *made-to-measure clothing online*, *how made-to-measure works*, *have a dress made online*, *without a fitting*, *how long / how much*.
- **`/design`** keeps the commission flow and owns *design your own dress / custom design* only.
- **Guide 1.1** owns the definitions (*made-to-measure vs bespoke*).
- Search Console check, monthly: if two pages show impressions for the same query, the non-owner's title and H1 are tightened.

| # | Page | Owns the cluster | Languages | Sprint |
| --- | --- | --- | --- | --- |
| 1 | Home | Brand + made-to-measure silk/linen | EN, de-ch, fr-ch, de, fr | 1 (EN), 2 (rest) |
| 2 | `/made-to-measure` | Made-to-measure process, order online | all | 1 / 2 |
| 3 | `/design` | Design your own / commission | all | 2 |
| 4 | Women: silk dresses and gowns | Silk dress | all | 1 / 2 |
| 5 | Occasion: wedding guest in silk | Wedding guest | all | 3 (fullest build by 1 Feb) |
| 6 | Women: silk skirts and blouses | Silk separates | all | 3 |
| 7 | Women: linen sets | Linen set | all | 3 |
| 8 | Men: linen shirts | Men's linen shirt | all | 3 |
| 9 | Men: linen trousers and full looks | Men's linen trousers | all | 3 |
| 10 | Sleepwear and gifts | Silk pyjamas, gift | all | **1 (EN), 2 (rest)** |
| 11 | Piece pages (66, template) | Each design | EN, then all | 1 (EN template), 2 (rest) |
| 12 | About + "LINSILK at a glance" | Entity | all | 1 / 2 |
| 13 | `/cloth` | Cloth, colours | all | 1 / 2 |
| 14 | `/care/measuring` | How to measure | all | 2 |
| 15 | `/care/questions` (answer bank) | Questions | all | 1 / 2 |
| 16 | Guide: made-to-measure vs bespoke | Definitions | all | 3 |
| 17 | Guide: is silk worth it | Research | all | 3 |
| 18 | Austria: Ballkleid Seide | Ball | de (AT) | **1** |
| 19 | UAE: silk gowns and linen | UAE | EN | **1** |
| 20 | Guide: linen for hot weather | Comfort | EN, de, fr | 4 |
| 21 | Guide: how to wash silk and linen | Care | EN, de, fr | 4 |
| 22 | Luxembourg landing | Local | fr, de | 4 |
| 23 | Guide: high-frequency fabrics | Positioning | all | 4 |
| 24 | Guide: silk vs satin | Satin | EN, de, fr | 4 |
| 25 | Valentine's, Eid, Mother's Day edits | Seasonal | per market | 5 |
| 26 | Dutch `/nl/` | NL | nl | 6 (after volumes) |

Slugs (translated): `/de-ch/` → `kleider/seide`, `anlass/hochzeitsgast`, `leinen/sets-damen`, `herren/leinenhemden`, `nach-mass`, `ratgeber/…`; `/fr-ch/` → `robes/soie`, `occasion/invitee-mariage`, `lin/ensembles-femme`, `hommes/chemises-lin`, `sur-mesure`, `guides/…`. Pieces: §6.3.

---

## 6. Technical implementation spec (`apps/storefront`)

Ordered by value. Each item has a check that proves it is done.

### 6.1 Deploy what is already built (day 1)
Merge `backend` → `master` and deploy. **Check:** `curl -I https://bylinsilk.com/robots.txt` and `/sitemap.xml` return 200; sitemap lists every piece and static page.

### 6.2 Brand, titles and H1 (`app/layout.tsx`, page metadata)
- **LINSILK** everywhere: title template `%s | LINSILK`, `siteName`, logo `alt`, © line.
- Home title: `LINSILK | Made-to-measure silk and linen clothing from Geneva`. Home gets one `<h1>` (the animated hero lines become a visually split heading inside it).
- `og:locale` per locale (`en_CH`, `de_CH`, `fr_CH`, `de_AT`, `fr_FR`).
- **Check:** no "LinSilk" left in rendered HTML (`curl … | grep -c LinSilk` = 0); every indexable page has exactly one H1.

### 6.3 Keyword slugs for pieces (fix for `/piece/001`)
- Slug = the piece's public `title` (from `meta.json`, cloth first, no colour), lower-case and hyphenated: `/piece/silk-cowl-halter-gown`. Titles are unique by house rule, so slugs are too; a build check fails on any duplicate.
- Store it as Medusa product `metadata.slug` (and `slug_de`, `slug_fr` for locales). **The Medusa `handle` and the internal id (`001`) stay unchanged**, so orders, measurement sheets, the pipeline and the MCP tools keep working.
- Route `app/piece/[id]` resolves a slug or a legacy id. A legacy id answers with a **301 to the slug URL** (in `middleware.ts` or the page's `permanentRedirect`).
- Sitemap, internal links, schema `url`, feeds and canonicals all use the slug URL.
- Locale URLs: `/de-ch/stueck/seiden-wickelkleid`, `/fr-ch/piece/robe-portefeuille-soie`, built from the name glossary (COPY-PAGES §6.1).
- **Check:** `curl -I /piece/004` → 301 to `/piece/silk-cowl-halter-gown`; no `/piece/0` URL in the sitemap.

### 6.4 Canonicals
- Every indexable page sets `alternates.canonical` to its own absolute URL on `https://bylinsilk.com` (apex, https, no trailing slash, no query string).
- Locale pages are **self-canonical** (the `/de-ch/` page points to itself, not to English); the language relationship is expressed by hreflang (§6.7), never by a cross-language canonical.
- Query parameters (UTM, feed tracking, any filter or sort) never change the canonical.
- Archived or phased-out designs: §7.
- Pages with `noindex` (legal, commission, account, cart, checkout, order, season-letter if it is only a sign-up) carry no canonical and stay out of the sitemap.
- **Check:** a crawl (Screaming Frog or `next build` + a small script) shows 0 missing canonicals, 0 canonicals to non-200 pages, 0 canonicals with parameters.

### 6.5 Structured data (`lib/jsonld.ts`)
- **Organization** (layout, every page): name, url, logo, the entity sentence, email, `address` = Geneva, CH (street added later, §9), `sameAs` from the list in §9.
- **WebSite** (home): name LINSILK, url, `inLanguage` per locale.
- **Product + Offer** (piece pages, fixed version in COPY-PAGES §8):
  - `name`, `description`, `image` (all views), `sku` and `mpn` = internal id, `brand`, `material` (the cloth), `category`, `url` = slug URL.
  - `offers`: `price` (whole francs, from Medusa), `priceCurrency` CHF, `availability` `https://schema.org/MadeToOrder`, `itemCondition` NewCondition.
  - `shippingDetails`: **one `OfferShippingDetails` per destination group** (CH, EU, UK, rest of world), each with `shippingDestination`, `shippingRate` (`[SHIPPING_COST]` until confirmed), `deliveryTime.handlingTime` 14–28 days and `deliveryTime.transitTime` (CH 2–3, EU/UK 3–6, rest 5–10).
  - `hasMerchantReturnPolicy`: `returnPolicyCategory` = `MerchantReturnNotPermitted` for change of mind, `applicableCountry` per market, added **only after the legal check** (§13.3).
  - No `aggregateRating` or `review` until real reviews exist (§9).
  - No `color` property (house rule); colours are chosen from swatches.
- **BreadcrumbList** on piece and category pages.
- **FAQPage**: see §6.6.
- **Article** on guides: `headline`, `datePublished`, `dateModified`, named `author` (a real person, §13.6), `publisher` = the Organization.
- **Check:** Rich Results Test and Schema Markup Validator pass on one piece, one category, one guide; Search Console "Product snippets" and "Merchant listings" show no errors 2 weeks after launch.

### 6.6 FAQ: visible text and markup (fix)
Google shows FAQ rich results only for well-known government and health sites since 2023, so FAQ markup brings no rich result to a shop. Its value is for AI engines, and the risk is the same 4–5 answers repeated on 66 pages.
- **FAQPage markup only on hub pages**: `/care/questions`, `/made-to-measure`, `/design`, guides, market pages. Questions and answers in the markup match the visible text word for word.
- **Piece pages**: a visible "Questions about this piece" block, **no FAQPage markup**. It is built from one of **eight garment-type sets** (gown, dress, skirt, blouse, women's linen set, sleepwear, men's shirt, men's trousers), plus **one piece-specific question** drawn from the garment lock (e.g. "Is the halter tie adjustable?" only where it is). The shared lead-time, duty and returns answers are one line each with a link to `/care/questions`, not repeated paragraphs.
- **Check:** no two piece pages share more than ~40% of their body text (crawl similarity report).

### 6.7 Languages and hreflang
- Next.js `[locale]` segment: `en` (root, default), `de-ch`, `fr-ch`, `de`, `fr`; `nl` later.
- UI strings in dictionary files; page copy for categories, About, Cloth, `/made-to-measure`, `/design`, guides and FAQ in Payload (`pages` collection, `locale` field) so the client can edit it. Piece names and slugs per locale in Medusa `metadata` (`title_de`, `title_fr`, `slug_de`, `slug_fr`).
- hreflang on every URL: `en`, `de-CH`, `de-LI` (both on `/de-ch/`), `fr-CH`, `de-AT`, `de-DE`, `de-LU` (on `/de/`), `fr-FR`, `fr-LU` (on `/fr/`), `en-NL`, `en-AE` (on the root, later), `x-default` = English root. Set in `<link rel="alternate">` and mirrored in `sitemap.ts` (`alternates.languages`), with `lastModified`.
- Suggest a language and currency with a small banner; never redirect by IP.
- **Check:** Search Console international targeting report shows 0 hreflang errors; every alternate returns 200 and links back (return tags).

### 6.8 Currency
Add AED to the approximate-price switcher (`lib/exchange.ts`, `app/api/rates/route.ts`). Schema and feeds stay in CHF; the EUR, GBP, USD and AED figures stay labelled as approximations.

### 6.9 Crawling, indexing and IndexNow
- **IndexNow**: a key file in `public/`, and a call to `api.indexnow.org` whenever a URL is created, changed or removed: a Payload `afterChange` hook for pages, a Medusa product-update subscriber for pieces, and a deploy hook that submits changed static pages. IndexNow reaches Bing (whose index feeds ChatGPT search and Copilot), Yandex, Seznam and Naver; Google ignores it and is fed by the sitemap.
- Search Console: one Domain property plus one URL-prefix property per locale folder. Bing Webmaster Tools: import from Search Console, submit the sitemap.
- `noindex` on legal pages (already), commission, account, cart, checkout, order, and `/season-letter` if it is only a sign-up.
- `llms.txt` at the root pointing to About, `/made-to-measure`, `/cloth`, `/care/questions` and the guides (optional; costs nothing).
- **AI crawler access check, monthly**: request the home page with the GPTBot, OAI-SearchBot, ChatGPT-User, PerplexityBot, ClaudeBot, Google-Extended and Bingbot user agents; all must return 200. Cloudflare's "Block AI bots" / AI Crawl Control must stay set to allow search crawlers.
- **Check:** Bing Webmaster "IndexNow" report shows submissions within an hour of a product edit.

### 6.10 Analytics and AI-referral tracking (none installed today)
- **Tool: Umami Cloud, free Hobby plan** (client decision 22 Oct). Cookieless, so no cookie banner in CH or the EU. Free-plan limits: 1 website, 100,000 events a month, data kept 6 months; it includes custom events and revenue tracking. Export the monthly report figures (§12) to a sheet each month, because the free plan deletes data older than 6 months. Move to a paid Umami plan if events pass about 80,000 a month.
- Setup: create the account under the client's email, add bylinsilk.com, put the tracking script in `app/layout.tsx` (loaded with `defer`), with the website ID in an environment variable (`NEXT_PUBLIC_UMAMI_WEBSITE_ID`), not hard-coded. Exclude `/admin` and `/api`.
- Events (Umami custom events, `umami.track`): `piece_view` (piece id), `select_colour` (piece id, cloth), `sheet_started`, `sheet_confirmed`, `order_placed` (with `revenue` in CHF and `currency: "CHF"`, piece ids). GA4 only if the client later runs Google Ads and wants conversion import.
- Privacy page: add one line naming Umami and saying it sets no cookies and stores no personal data.
- **AI referral channel**: in Umami, a saved filter "AI assistants" on referrer domain and UTM source, matching referrers `chatgpt.com`, `chat.openai.com`, `perplexity.ai`, `gemini.google.com`, `copilot.microsoft.com`, `claude.ai`, and `utm_source=chatgpt.com` (ChatGPT adds it to outbound links). Report sessions, orders and revenue from this group monthly.
- Feed traffic: tag Merchant Center and ChatGPT feed URLs with `utm_source` / `utm_medium=feed` (the canonical ignores the parameters).
- **Check:** a test visit with `?utm_source=chatgpt.com` shows under "AI assistants".

### 6.11 Images and performance
- Alt per view (COPY-PAGES §6.3); file names from the slug (`silk-cowl-halter-gown-front.webp`); width and height set; hero preloaded. Cloudflare resizing is already in place.
- Smooth-scroll and reveal animations rest at `opacity:0`: all copy must be in server-rendered HTML (it is) and the `noscript` override stays. Check Core Web Vitals on mobile after each sprint; target LCP < 2.5 s, CLS < 0.1.
- Image sitemap entries for every piece view.

### 6.12 Live-site text fixes (no new pages needed)
- Home hero "Woven by hand" → COPY-PAGES §2.
- Home pillar "Nothing synthetic enters the shell, the lining or the thread" → "Every LINSILK garment is made in 100% silk or 100% linen cloth. No polyester and no blended cloth."
- Home stat "natural fibre, shell to thread" → "silk or linen cloth".
- `/cloth` prose and `lib/catalog.ts` lead "no polyester in the shell, the lining, the pocket bag or the thread" → "No polyester and no blended cloth: the cloth is pure silk or pure linen."
- `/cloth` and `lib/catalog.ts` "A linen jacket worn through one summer…" → "A linen shirt worn through one summer…".
- Piece page "Made in a capped run for Collection {n} and not made again" → §7 wording.
- Footer "each made once" → §7 wording.

### 6.13 Legal identity block (placeholder)
Footer and About show **"Geneva, Switzerland"** for now. A full legal-notice page (`/legal/notice`: company name, street address, UID, contact) is required for sales to Germany and Austria (Impressum) and by Swiss UWG Art. 3 lit. s; it is built now with `[ADDRESS]`, `[UID]` and `[LEGAL_NAME]` placeholders and published when the client supplies them. The Organization schema gains `streetAddress` and `vatID` at the same time.

---

## 7. Product continuity (designs carry over between collections)

Designs are not one-off: most move to the next collection; only slow sellers are phased out. Piece pages are therefore long-lived ranking pages, not seasonal ones.

- **The URL belongs to the design, not the collection.** `/piece/{slug}` never contains a collection or season. A design that moves to the next collection keeps its URL, its links and its rankings; only the "In Collection {n}" label changes.
- **Copy no longer says "not made again"** for designs that carry over. Piece page: "Part of Collection {n}." Footer: "Four small collections a year." (drop "each made once"). The capped-run line is used only for designs the client marks `limited: true`.
- **Phased-out designs** (client marks `retired: true` in Medusa):
  1. If a close successor exists (same cloth and garment type), **301 to the successor**.
  2. Otherwise **301 to the owning category page** (e.g. women's silk dresses).
  3. Only designs with real backlinks or press mentions stay live as an archive record (200, "This design is no longer made", links to two current pieces, Product schema without Offer, removed from feeds and the sitemap).
- Feeds drop retired designs the same day (§8), and IndexNow is notified of each change.
- **Check:** monthly report of 404s and redirect chains in Search Console = 0.

---

## 8. Product feeds (Google, Microsoft, ChatGPT)

### 8.1 Why
Google Shopping free listings and AI Mode shopping answers draw on Merchant Center; Copilot shopping draws on Microsoft Merchant Center; ChatGPT shopping answers draw on merchant product feeds and on Bing. For a catalogue of 66 pieces this is the shortest route into AI shopping answers.

### 8.2 One feed, generated from Medusa
- New route `app/feeds/products.xml` (Google RSS 2.0 format) and `app/feeds/products.json` (for the ChatGPT spec), rebuilt hourly like the sitemap, from the same data as the Product schema, so prices never disagree.
- One item per **design** (not per colour; colours are swatch choices).

| Feed field | Value |
| --- | --- |
| `id` | internal id (`004`) |
| `title` | `{Title}, made to measure` (cloth first, no colour), max 150 chars |
| `description` | lead + facts block text (cloth, cut, length, 2–4 weeks, 48 silk / 40 linen colours) |
| `link` | slug URL + `?utm_source=google&utm_medium=feed` |
| `image_link` / `additional_image_link` | front view / other views |
| `price` | `{price}.00 CHF` (whole francs, from Medusa) |
| `availability` | `in_stock` (orderable now) with `min_handling_time` 14 and `max_handling_time` 28 |
| `brand` | LINSILK |
| `mpn` | internal id; `identifier_exists` = no (no GTINs for made-to-measure) |
| `condition` | new |
| `google_product_category` | apparel subcategory per garment type (dresses, skirts, shirts and tops, pants, sleepwear and loungewear, suits/sets) |
| `product_type` | `Women > Silk > Gowns` etc. |
| `material` | silk / linen |
| `gender`, `age_group` | female or male / adult |
| `color`, `size` | **To settle before submission.** Google requires both for apparel in DE, FR, UK and other target countries, but the house sells by swatch and by measurement. Test candidate values (e.g. `size` "Made to measure") in a Merchant Center **test feed**, read the diagnostics and Google's current apparel rules, then fix the values. Nothing goes live on guessed values, and no colour name is used (house rule). |
| `shipping` | per country: price `[SHIPPING_COST]`, transit times from §3.4 |
| `return_policy` | linked Merchant Center return policy, after the legal check |
| `custom_label_0..4` | cloth, garment type, collection, `limited`, margin band (for later paid campaigns) |

### 8.3 Channels and steps
1. **Google Merchant Center**: create the account under the client's Google account, verify and claim bylinsilk.com, set shipping and returns in the account, add the scheduled feed URL, target CH, LI, AT, DE, FR, LU, NL, UK, AE, enable free listings. Link Search Console. **Check:** 0 disapproved items, products visible in the Shopping tab for "LINSILK".
2. **Microsoft Merchant Center**: import from Google Merchant Center. **Check:** offers visible in Bing Shopping.
3. **ChatGPT merchant programme**: apply through OpenAI's merchant sign-up and submit the JSON feed to their product feed spec (read the current spec before building; do not guess fields). **Check:** LINSILK pieces appear for "made to measure silk dress Switzerland" in ChatGPT shopping results within the programme's stated time.
4. **Optional, later**: Meta and Pinterest catalogues from the same feed (Pinterest suits the wedding-guest and occasion edits).

### 8.4 Feed hygiene
Feed price = page price = schema price, always (Merchant Center suspends on mismatch). Retired designs leave the feed the same day. A nightly check compares feed prices with live page prices and fails loudly on any difference.

---

## 9. Entity and off-site corroboration

AI engines name a brand when the same facts appear on independent sites. **Live data will be added by the client**; until then each line below is a placeholder and is not published.

| Profile | Status | Data needed | Used in |
| --- | --- | --- | --- |
| Instagram `instagram.com/linsilk` | Live | — | `sameAs` |
| Swiss commercial register (Zefix) entry | `[ZEFIX_URL]` | legal name, UID | `sameAs`, legal notice, `vatID` |
| LinkedIn company page | `[LINKEDIN_URL]` | entity sentence as the tagline | `sameAs` |
| Pinterest business account | `[PINTEREST_URL]` | catalogue from §8 | `sameAs`, occasion boards |
| Facebook page (needed for Meta catalogue) | `[FACEBOOK_URL]` | — | `sameAs` |
| Reviews platform: **Trusted Shops** (the trust badge DACH buyers look for) or Trustpilot | `[REVIEWS_URL]` | client chooses one | reviews widget; rating schema only once real reviews exist |
| Google Business Profile | Only if there is an address clients may visit | `[ADDRESS]` | local results |
| Wikidata item | When the house has 2+ independent press mentions (notability) | press links | `sameAs` |
| Directories: Swiss fashion and slow-fashion directories, Geneva business listings | `[LIST]` | entity sentence, same email and city | citations |

Rules: the **entity sentence, name, city and email are identical everywhere** (COPY-PAGES §0). Each new profile is added to `sameAs` the day it goes live.

**Digital PR plan** (replaces the one-paragraph mention in v1):
- **Fact sheet** (COPY-GUIDES-FAQ §4) as a PDF and a `/press` page with images and the at-a-glance block.
- **Targets per market**, 10 titles each, built in Sprint 2: Geneva and Zurich lifestyle (FR/DE), Vienna fashion and ball-season pages (DE-AT), Luxembourg lifestyle (FR), Dubai lifestyle (EN), plus wedding blogs in CH/AT/DE.
- **Quota**: 8 personalised pitches a week, one story angle per season (COPY-GUIDES-FAQ §4), tracked in a simple sheet (outlet, contact, date, result, link).
- **Roundups**: pitch "Swiss labels", "wedding-guest dresses", "silk sleepwear gifts" (Oct–Nov), "ball gowns" (Nov–Jan), "linen menswear" (Mar–May) round-ups 6–8 weeks before they run.
- **Forums**: honest, disclosed answers on Reddit and similar about measuring yourself, silk care and made-to-measure, linking to the guide, not the shop. Never fake reviews or posts.
- **Target**: 2 earned mentions per market per quarter.

---

## 10. GEO plan (getting named by ChatGPT, Perplexity, Gemini, AI Overviews)

1. **Entity sentence, identical everywhere** (site, schema, profiles, press, feeds):
   > LINSILK is a made-to-measure silk and linen clothing house based in Geneva, Switzerland. Every piece is cut and sewn to the customer's own measurements in 2–4 weeks, in 100% silk or 100% linen cloth.
2. **"LINSILK at a glance"** on About and `/care/questions` (COPY-PAGES §4): what, where, cloth, price range, colours, lead time, ordering, fittings, returns, delivery, contact, as a definition list.
3. **Answer-first passages**: every guide and FAQ answer opens with 1–2 sentences that name LINSILK where it helps and make sense quoted alone.
4. **Honest limits**: the bespoke guide and `/made-to-measure` say plainly what LINSILK does not do (fittings, alterations, a toile). Engines favour sources that state limits.
5. **Language parity**: every guide exists in de-ch, de and fr; engines answer German and French questions mostly from German and French pages.
6. **Freshness**: visible "Updated {date}" and `dateModified` on guides and the answer bank; review them each quarter.
7. **Feeds** (§8) and **corroboration** (§9) carry most of the citation weight.
8. **Monthly prompt test**: the brief's eight prompts plus "best made to measure dress brands without fittings", "made to measure linen shirt Dubai", "silk pyjamas gift Switzerland", "where to buy a silk ball gown to measure Austria", "is LINSILK legit", in ChatGPT, Perplexity, Gemini and Google AI Overviews/AI Mode, each in its language. Log prompt, engine, language, named yes/no, page cited, and any **wrong fact** an engine repeats (wrong facts are fixed at the source page first).

---

## 11. Delivery schedule (full scope, to completion)

Every page in §5 is built. The schedule ships the English versions of the seasonal pages first so they exist before the season, then the language versions. **Honest timing note:** new pages on a young domain take weeks to be indexed and months to rank; this winter's gift, ball and UAE seasons should be backed by paid search and social pointing at these pages, while organic builds for the same seasons in 2027. Feeds (§8) can show products within days of approval and are the fastest organic channel.

| Sprint | Dates (2026–27) | Done when | Status (22 Oct) |
| --- | --- | --- | --- |
| **0** | 23 Oct (was 20 Oct) | Analytics installed; `backend` committed, merged and deployed; robots and sitemap return 200; Search Console + Bing verified, sitemap submitted | Not started: code ready; Umami chosen 22 Oct, account and script still to set up |
| **1** | 23 Oct – 2 Nov | Brand spelling, titles and H1s; live-text fixes §6.12; keyword slugs + 301s; canonicals; Organization, WebSite, Product, Breadcrumb schema; IndexNow; EN pages: home, `/made-to-measure`, women's silk, sleepwear and gifts, About, `/cloth`, answer bank, piece template; **Austria Ballkleid page (de) and UAE page (EN)** via the `[locale]` route with only those pages; Merchant Center test feed submitted | Mostly built (§0). Left: Ballkleid page + minimal `[locale]` route, Payload IndexNow hook, Merchant Center test feed, deploy. **Gift page must be live by 2 Nov** |
| **2** | 3 – 16 Nov | Full i18n routing and hreflang; de-ch, fr-ch, de, fr versions of every Sprint 1 page and all 66 piece pages (from the glossary); `/design` copy; `/care/measuring`; feeds live in Google, Microsoft, ChatGPT application sent; press list built, pitching starts | Not started (AED already done) |
| **3** | 17 Nov – 7 Dec | Keyword volumes pulled and pages without volume merged; wedding-guest (all languages), skirts and blouses, linen sets, men's shirts, men's trousers (all languages); bespoke and silk-worth-it guides; legal-notice page with placeholders | EN wedding-guest page and category edits exist; rest not started |
| **4** | 8 Dec – 11 Jan | Linen-heat and care guides; **high-frequency guide; silk-vs-satin guide** (both approved 22 Oct); Luxembourg landing; Valentine's sleepwear edit live by 15 Dec; first monthly report | Not started |
| **5** | 12 Jan – 1 Feb | Wedding-guest fullest build (all languages) by 1 Feb; Eid page (UAE) by 1 Feb | Not started |
| **6** | Feb – Apr | Linen and menswear push live by 1 Mar; Mother's Day by 1 Apr; `/nl/` if Dutch volumes justify it | Not started |

Native-speaker review of German and French is a gate before each language goes live (§13.7). Piece pages need review of the **name glossary** once, not of 66 pages.

Last order dates go on the seasonal pages, counted from the **confirmed measurement sheet** at the worst case (4 weeks to make plus the longest transit) for delivery by 23 Dec: Switzerland 20 Nov, EU and UK 17 Nov, UAE and rest of world 13 Nov. Sprint 1 must therefore ship the gift page by 2 Nov at the latest.

---

## 12. Measurement

| What | Tool | How often |
| --- | --- | --- |
| Baseline the week each language goes live (impressions, indexed pages, hreflang errors) | Search Console | Once per language |
| Indexed pages, hreflang and canonical errors per folder | Search Console | Weekly for 2 months, then monthly |
| Impressions and clicks for the made-to-measure and synonym clusters, by country | Search Console | Monthly |
| Rankings of head terms per locale (CH-de, CH-fr, AT, DE, FR, LU, NL, AE) | Rank tracker | Weekly |
| Branded search (LINSILK, bylinsilk), the first leading indicator | Search Console | Monthly |
| Product snippets and merchant listings | Search Console, Merchant Center diagnostics | After launch, then monthly |
| Feed health: disapprovals, price mismatches | Merchant Center, nightly check (§8.4) | Daily alert, monthly review |
| Bing indexing and IndexNow | Bing Webmaster Tools | Monthly |
| AI-assistant referrals, orders and revenue | Analytics, "AI assistants" group (§6.10) | Monthly |
| AI citations and wrong facts | Prompt log (§10.8) | Monthly |
| Earned mentions and new profiles | PR sheet (§9) | Monthly |
| Organic and feed orders and revenue by country | Analytics | Monthly |
| Cannibalisation (two pages on one query) | Search Console | Monthly |

At 90 days, decide which Phase 2 languages and pages to deepen from impressions by country.

---

## 13. Client decisions

Closed 19 Oct: origin wording (match the live site), fabric claims (cloth only), prices (whole francs from live data), product continuity (designs carry over), address (Geneva only for now).

Closed 22 Oct: brand spelling, hand-work wording, held pages, high-frequency wording, analytics tool (rows 1, 4, 5, 8, 11).

Every open row has a placeholder, so building never waits on it; only the line or field it names stays unpublished until the answer arrives.

| # | Decision | Status | Until answered, build with | Holds back only |
| --- | --- | --- | --- | --- |
| 1 | Brand spelling | **Closed 22 Oct: LINSILK** everywhere (site, schema, feeds, profiles) | — | — |
| 2 | Shipping cost per region; is "duty included in CH and the EU" true for every EU country | Open | `[SHIPPING_COST]`; live duty wording in copy | `shippingRate` in schema and feed; duty wording in schema |
| 3 | EU returns wording (made-to-measure exemption) | Open, needs legal check | Live returns wording on pages | `hasMerchantReturnPolicy`; feed return policy |
| 4 | Hand-work wording | **Closed 22 Oct: keep the live "cut flat by hand… hem, facings and lining by hand"** | — | — |
| 5 | Silk-vs-satin guide; example colour names | **Closed 22 Oct: both approved.** Colour names in body copy and on `/cloth` only, never in titles, H1s, alt text, schema or feeds | — | — |
| 6 | Named author for guides | Open | Organization as `author` | Person `author` in Article schema |
| 7 | Native reviewers (Swiss German, French; Dutch later) | Open | Draft copy in COPY files | Going live with each language |
| 8 | High-frequency wording | **Closed 22 Oct: plain fact, in the client's brand-pillar wording, no legal gate** | — | — |
| 9 | Payment methods per market | Open | No payment logos or names in copy | Payment lines on market pages |
| 10 | Who marks `retired` / `limited` in Medusa; successors | Open | All designs current, none limited | Redirects for phased-out designs |
| 11 | Analytics tool; Google Ads this winter | **Analytics closed 22 Oct: Umami Cloud, free plan.** Google Ads still open | No GA4 | Google Ads conversion import only |
| 12 | Disclosure of AI-generated product photos | Open | No statement either way | Press kit and `/about` imagery note |
| 13 | Zefix UID, legal name, street address, profile URLs | Open | `[UID]`, `[LEGAL_NAME]`, `[ADDRESS]`, Instagram only in `sameAs` | `/legal/notice` (required for DE/AT sales), extra `sameAs` |

## 14. Sources of this research

- Live site checks on 19 Oct 2026: robots.txt and sitemap.xml (404), host redirects, AI-crawler responses, every piece page's live price and name.
- Searches on 19 Oct 2026 in German and French for Swiss/Geneva made-to-measure silk dresses and Viennese ball gowns (no direct online competitor found), and for "made to measure silk dress lead time".
- Market figures (fashion spend per head, customs thresholds, wages): the brief's sources, not re-verified here.
- Search volumes: **not yet pulled**; scheduled for Sprint 3 (§11).
