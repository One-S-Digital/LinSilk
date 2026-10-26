# LINSILK — On-page copy: pages, templates, schema (v2)

Ready to paste. Client decisions of 22 Oct are applied (plan §13: LINSILK spelling, live hand-work wording, satin guide and colour names approved, high-frequency wording as plain fact); the remaining open items are bracketed placeholders. Languages: **EN** (root, UAE, NL, LU fallback), **DE-CH** (`/de-ch/`, Swiss spelling: *Mass*, no ß), **DE** (`/de/` for AT, DE, LU: *Maß*), **FR** (`/fr-ch/`, `/fr/`). German and French are written as native-style copy but **need a native-speaker pass** before publishing.

Companion: [`COPY-GUIDES-FAQ.md`](COPY-GUIDES-FAQ.md)

## 0. Rules this copy follows

- Name: **LINSILK**. Place: **Geneva / Genf / Genève** only, as where the house is based and where orders are handled and dispatched from. **Never** "made / cut / sewn in Geneva", "before it leaves Geneva", "Swiss made" (plan §3.1).
- Cloth claims cover **the cloth only**: "100% silk", "100% linen", "pure silk cloth", "no polyester or blended cloth". **Never** "shell to thread", lining, pocket bag or thread claims; buttons, zips and trims are not silk or linen (plan §3.2).
- Cloth words in labels: **silk** and **linen** only. "Satin" and colour words never appear in a title, H1, label, alt text, schema or feed. Colour names may appear in body copy and on `/cloth`; "satin" only in the silk-vs-satin guide (both approved 22 Oct).
- Always **made-to-measure** (*nach Mass* / *nach Maß* / *sur mesure*). No fittings, alterations or measuring service are implied. No "perfect fit guaranteed", no "free alterations".
- Lead time: **2–4 weeks from your confirmed measurement sheet**.
- Process words: "cut and sewn", "cut flat by hand", "hem, facings and lining by hand" (the live piece-page wording, kept by client decision 22 Oct), "inspected twice". Not "hand-sewn" as a general claim.
- **Prices are whole francs and are rendered from Medusa on the site**, never typed in. The figures below are the live values on 19 Oct 2026, for review: whole range **CHF 119–359**, silk from **CHF 159**, linen from **CHF 119**; per-group ranges in plan §3.3. In templates: `{price}`, `{from_group}`, `{to_group}`.
- Numbers: **48 silk colours** (plain, jacquard, brocade), **40 linen colours**, **15 measurements**.
- Placeholders: `[DUTY_LINE_x]` per market, `[SHIPPING_COST]`, `[ADDRESS]`.
- Title ≈ 60 characters, description ≈ 155. If a piece title overruns, drop "Geneva" from the suffix, never the cloth or "made to measure".

### Entity sentence (verbatim in schema, About, profiles, press, feeds)

- **EN:** LINSILK is a made-to-measure silk and linen clothing house based in Geneva, Switzerland. Every piece is cut and sewn to the customer's own measurements in 2–4 weeks, in 100% silk or 100% linen cloth.
- **DE-CH:** LINSILK ist ein Genfer Modehaus für Seide und Leinen nach Mass. Jedes Stück wird nach den eigenen Massen der Kundin oder des Kunden zugeschnitten und genäht, innert 2–4 Wochen, aus 100 % Seide oder 100 % Leinen.
- **DE (AT/DE/LU):** LINSILK ist ein Genfer Modehaus für Seide und Leinen nach Maß. Jedes Stück wird nach den eigenen Maßen der Kundin oder des Kunden zugeschnitten und genäht, in 2–4 Wochen, aus 100 % Seide oder 100 % Leinen.
- **FR:** LINSILK est une maison genevoise de vêtements sur mesure en soie et en lin. Chaque pièce est coupée et cousue aux mesures de la cliente ou du client en 2 à 4 semaines, en 100 % soie ou 100 % lin.

### Duty lines (default = live shipping page; confirm, plan §13.2)

| Market | EN | DE | FR |
| --- | --- | --- | --- |
| CH, LI | Prices include duty within Switzerland. | Preise inklusive Zoll innerhalb der Schweiz. | Prix incluant les droits de douane en Suisse. |
| EU (AT, DE, FR, LU, NL) | `[DUTY_LINE_EU]` Duty is included in the price; the figure you agree is the figure you pay. | `[DUTY_LINE_EU]` Zoll ist im Preis enthalten; der vereinbarte Preis ist der Endpreis. | `[DUTY_LINE_EU]` Les droits de douane sont inclus; le prix convenu est le prix payé. |
| UK | Import VAT is payable on arrival. | — | — |
| UAE and rest of world | `[DUTY_LINE_AE]` Duty and import tax are collected on delivery by the carrier. | — | — |

---

## 1. Global elements

### Footer blurb (replaces "each made once": designs carry over between collections, plan §7)
- **EN:** Made-to-measure silk and linen, from Geneva. Cut and sewn to your measurements in 2–4 weeks. Four small collections a year.
- **DE-CH:** Seide und Leinen nach Mass, aus Genf. Nach Ihren Massen zugeschnitten und genäht, innert 2–4 Wochen. Vier kleine Kollektionen im Jahr.
- **FR:** Soie et lin sur mesure, de Genève. Coupés et cousus à vos mesures en 2 à 4 semaines. Quatre petites collections par an.
- Location line: **Geneva, Switzerland** (street address added later, plan §6.13).

### Navigation labels (crawlable anchor text)
EN: Women · Men · Made to measure · Design your own · The cloth · Measuring guide · About · Questions.
DE-CH: Damen · Herren · Nach Mass · Selbst entwerfen · Die Stoffe · Mass nehmen · Über LINSILK · Fragen.
FR: Femmes · Hommes · Sur mesure · Créer la vôtre · Les tissus · Prendre ses mesures · À propos · Questions.

---

## 2. Home (owns: brand + made-to-measure silk and linen clothing)

### EN
- **Title:** LINSILK | Made-to-measure silk and linen clothing from Geneva
- **Meta:** LINSILK makes silk and linen clothing to your own measurements in 2–4 weeks. 48 silk and 40 linen colours, from CHF 119. No fittings needed. From Geneva.
- **H1:** Made-to-measure silk and linen clothing, from Geneva.
- **Hero lines** (inside the H1 or directly under it): *Cut from silk and linen. Sewn to your measurements. Made for you in 2–4 weeks.*
  (Replaces "Cut from silk. Woven by hand. Fitted to you." LINSILK does not weave, and "fitted to you" implies a fitting.)
- **Intro (first 2 sentences):** LINSILK is a made-to-measure silk and linen clothing house based in Geneva, Switzerland. You choose a piece, choose its colour from swatches of the cloth, enter your own measurements, and it is cut and sewn for you in 2–4 weeks.
- **Three pillars (H2 + 2 sentences):**
  1. **Made to your measurements.** There is no size chart and no nearest size. Fifteen measurements become a pattern drawn for you alone; the piece is cut from it, inspected twice against your numbers, then dispatched from Geneva.
  2. **Pure silk and pure linen.** Every LINSILK garment is made in 100% silk or 100% linen cloth. No polyester and no blended cloth.
  3. **Comfort first.** Silk and linen breathe, move with the body and rest lightly on the skin, so a piece stays comfortable from morning to night, in the heat and in the cold.
- **How ordering works (H2 "How ordering works", 4 short steps, link "Read the full guide" → `/made-to-measure`):** Choose a piece · Choose its colour from the swatches · Enter your measurements · We make it in 2–4 weeks and send it with tracking.
- **Occasion row (H2 "Dressed for the occasion"):** Wedding-guest silk · Evening and gala · Linen sets for the warm months · Silk pyjamas and robes as gifts · Linen shirts and trousers for men. (Each links to its edit page.)
- **Closing line:** *Wear what raises you.* (Brand line; keep.)
- No FAQ block on the home page (the questions live on `/made-to-measure` and `/care/questions`, which own them).

### DE-CH
- **Title:** LINSILK | Kleidung nach Mass aus Seide und Leinen, aus Genf
- **Meta:** LINSILK fertigt Kleidung aus Seide und Leinen nach Ihren Massen, innert 2–4 Wochen. 48 Seiden- und 40 Leinenfarben, ab CHF 119. Ohne Anprobe. Aus Genf.
- **H1:** Kleidung nach Mass aus Seide und Leinen, aus Genf.
- **Hero:** *Aus Seide und Leinen geschnitten. Nach Ihren Massen genäht. In 2–4 Wochen für Sie gefertigt.*
- **Intro:** LINSILK ist ein Genfer Modehaus für Seide und Leinen nach Mass. Sie wählen ein Stück, wählen die Farbe aus den Stoffmustern, geben Ihre eigenen Masse ein, und es wird innert 2–4 Wochen für Sie zugeschnitten und genäht.
- **Säulen:**
  1. **Nach Ihren Massen.** Keine Grössentabelle, keine «nächste Grösse». Fünfzehn Masse werden zu einem Schnittmuster, das nur für Sie gezeichnet wird; das Stück wird danach zugeschnitten, zweimal mit Ihren Zahlen geprüft und dann aus Genf versandt.
  2. **Reine Seide, reines Leinen.** Jedes Stück von LINSILK ist aus 100 % Seide oder 100 % Leinen gefertigt. Kein Polyester, keine Mischgewebe.
  3. **Tragekomfort zuerst.** Seide und Leinen atmen, bewegen sich mit dem Körper und liegen leicht auf der Haut, bei Hitze wie bei Kälte.
- **So bestellen Sie:** Stück wählen · Farbe aus den Stoffmustern wählen · Masse eingeben · Wir fertigen es innert 2–4 Wochen und versenden mit Sendungsverfolgung. (Link → `/de-ch/nach-mass`)
- **Anlass-Zeile:** Hochzeitsgast in Seide · Abend und Gala · Leinen-Sets für warme Monate · Seidenpyjama und Morgenmantel als Geschenk · Leinenhemden und -hosen für Herren.
- **Schlusszeile:** *Tragen, was Sie hebt.* (Native reviewer to confirm or replace.)

### FR
- **Title:** LINSILK | Vêtements sur mesure en soie et en lin, de Genève
- **Meta:** LINSILK coupe et coud vos vêtements en soie et en lin à vos mesures en 2 à 4 semaines. 48 coloris de soie, 40 de lin, dès CHF 119. Sans essayage.
- **H1:** Vêtements sur mesure en soie et en lin, de Genève.
- **Hero:** *Coupé dans la soie et le lin. Cousu à vos mesures. Fait pour vous en 2 à 4 semaines.*
- **Intro:** LINSILK est une maison genevoise de vêtements sur mesure en soie et en lin. Vous choisissez une pièce, son coloris parmi les échantillons du tissu, vous saisissez vos propres mesures, et elle est coupée et cousue pour vous en 2 à 4 semaines.
- **Piliers:**
  1. **À vos mesures.** Pas de tableau de tailles, pas de taille la plus proche. Quinze mesures deviennent un patron tracé pour vous seule ou vous seul; la pièce y est coupée, vérifiée deux fois par rapport à vos chiffres, puis expédiée depuis Genève.
  2. **Soie pure, lin pur.** Chaque vêtement LINSILK est en 100 % soie ou 100 % lin. Ni polyester, ni tissu mélangé.
  3. **Le confort d'abord.** La soie et le lin respirent, suivent le corps et reposent légèrement sur la peau, par temps chaud comme par temps frais.
- **Comment commander:** Choisir une pièce · Choisir son coloris parmi les échantillons · Saisir vos mesures · Nous la confectionnons en 2 à 4 semaines et l'expédions avec suivi. (Lien → `/fr-ch/sur-mesure`)
- **Occasions:** Invitée de mariage en soie · Soirée et gala · Ensembles en lin pour la belle saison · Pyjamas et peignoirs en soie à offrir · Chemises et pantalons en lin pour hommes.
- **Clôture:** *Portez ce qui vous élève.*

---

## 3. Category pages

Each category: unique title/meta/H1, a 60–90 word answer-first intro, 2–3 H2 blocks, 3 FAQ (marked up only where plan §6.6 allows: category FAQs are visible, not marked up). EN in full; DE-CH and FR give title, meta, H1 and intro. DE (AT/DE/LU) = DE-CH with *Maß/ß*, approximate EUR shown next to CHF, and market notes. **Each category URL is the only page for its cluster.** All prices are `{from_group}` / `{to_group}` from Medusa (19 Oct values shown).

### 3.1 Women: silk dresses and gowns (`/collection/women/silk` · `kleider/seide` · `robes/soie`)

**EN**
- **Title:** Silk dresses and gowns, made to measure | LINSILK
- **Meta:** Silk dresses and gowns made to your measurements in 2–4 weeks. Wrap, slip, halter and floor-length evening styles in 48 silk colours. From CHF 239.
- **H1:** Silk dresses and gowns, made to measure
- **Intro:** These are LINSILK's silk dresses and gowns, each cut and sewn to your own measurements in 2–4 weeks in 100% silk. Wrap dresses, slip dresses, halter and floor-length evening gowns come in 48 silk colours, from CHF 239 for a slip midi dress to CHF 359 for a high-neck halter gown with train.
- **H2 Choose by occasion:** Evening and gala: the halter, cowl and high-neck gowns, floor-length with slits. Wedding guest: the wrap, midi and flutter-sleeve dresses. Long sleeves and full length: the long-sleeve wrap maxi dress.
- **H2 Why silk:** Pure silk is smooth and light, drapes without clinging, and keeps you comfortable when it is warm or cool. Every dress here is made in 100% silk.
- **H2 How made-to-measure works here:** Choose the dress, choose its silk colour, enter your measurements. It is cut and sewn in 2–4 weeks from your confirmed sheet. (Link → `/made-to-measure`)
- **FAQ (visible):** What is a made-to-measure silk dress? · How long does a made-to-measure silk dress take? · Which silk dress is best for a wedding guest?

**DE-CH**
- **Title:** Seidenkleider und Abendkleider nach Mass | LINSILK
- **Meta:** Seidenkleider und Abendkleider nach Ihren Massen, gefertigt innert 2–4 Wochen. Wickel-, Slip- und Neckholderkleider in 48 Seidenfarben. Ab CHF 239.
- **H1:** Seidenkleider und Abendkleider nach Mass
- **Intro:** Das sind die Kleider und Abendkleider von LINSILK, jedes aus 100 % Seide nach Ihren eigenen Massen zugeschnitten und genäht, innert 2–4 Wochen. Wickelkleider, Slipkleider, Neckholder- und bodenlange Abendkleider gibt es in 48 Seidenfarben, ab CHF 239 für ein Slip-Midikleid bis CHF 359 für ein Neckholder-Abendkleid mit Schleppe.

**DE (AT)** — Title: *Seidenkleider und Abendkleider nach Maß | LINSILK* · H1: *Seidenkleider und Abendkleider nach Maß*; EUR shown as an approximation, `[DUTY_LINE_EU]`.

**FR**
- **Title:** Robes en soie et robes de soirée sur mesure | LINSILK
- **Meta:** Robes en soie et robes de soirée faites à vos mesures en 2 à 4 semaines. Portefeuille, nuisette, dos-nu, longues. 48 coloris de soie. Dès CHF 239.
- **H1:** Robes en soie et robes de soirée sur mesure
- **Intro:** Voici les robes en soie de LINSILK, chacune coupée et cousue en 100 % soie à vos propres mesures en 2 à 4 semaines. Robes portefeuille, robes nuisette, dos-nu et longues robes de soirée existent en 48 coloris de soie, dès CHF 239 pour une robe nuisette midi jusqu'à CHF 359 pour une robe longue dos-nu à traîne.

### 3.2 Occasion: wedding guest in silk (`/occasion/wedding-guest` · `anlass/hochzeitsgast` · `occasion/invitee-mariage`)

**EN**
- **Title:** Wedding guest dresses in silk, made to measure | LINSILK
- **Meta:** Wedding-guest dresses in 100% silk, made to your measurements. Order 6 weeks ahead in Europe: 2–4 weeks to make, plus delivery. From CHF 239.
- **H1:** Wedding guest dresses in silk, made to measure
- **Intro:** A silk dress made to your measurements suits the day: it moves, it breathes through a long ceremony, and it is ready in 2–4 weeks from your confirmed sheet. Order about six weeks before a wedding in Europe, or eight weeks before one further away, and choose from LINSILK's wrap, midi and flutter-sleeve dresses in 48 silk colours.
- **H2 Timing:** Making takes 2–4 weeks from your confirmed measurements; delivery is 2–3 days within Switzerland, 3–6 days to the EU and UK, 5–10 days elsewhere, once dispatched.
- **H2 By dress code:** Black tie → silk gowns (halter and high-neck). Cocktail → midi wrap and flutter-sleeve dresses. Daytime and garden → a silk midi skirt with a silk blouse.
- **H2 Making it yours:** Choose from plain, jacquard or brocade silks. Set the length by entering your own length measurement.
- **FAQ (visible):** What should a guest wear to a wedding? · Is silk comfortable in summer heat? · Can I order six weeks before the date?

**DE-CH**
- **Title:** Kleid für Hochzeitsgäste aus Seide nach Mass | LINSILK
- **Meta:** Elegante Kleider für Hochzeitsgäste aus 100 % Seide, nach Ihren Massen. 6 Wochen vorher bestellen: 2–4 Wochen Fertigung plus Versand. Ab CHF 239.
- **H1:** Outfit für Hochzeitsgäste aus Seide, nach Mass
- **Intro:** Ein Seidenkleid nach Ihren Massen sitzt an diesem Tag richtig: Es bewegt sich mit Ihnen, atmet durch eine lange Trauung und ist innert 2–4 Wochen ab bestätigtem Massblatt fertig. Bestellen Sie etwa sechs Wochen vor der Hochzeit und wählen Sie aus Wickel-, Midi- und Volantärmelkleidern in 48 Seidenfarben.

**FR**
- **Title:** Robe invitée mariage en soie sur mesure | LINSILK Genève
- **Meta:** Robes d'invitée de mariage en 100 % soie, faites à vos mesures. Commandez 6 semaines avant: 2 à 4 semaines de confection, plus la livraison. Dès CHF 239.
- **H1:** Tenue d'invitée de mariage en soie, sur mesure
- **Intro:** Une robe en soie faite à vos mesures tombe juste le jour J: elle suit vos mouvements, respire pendant toute la cérémonie et est prête en 2 à 4 semaines après validation de votre fiche de mesures. Commandez environ six semaines avant le mariage, parmi les robes portefeuille, midi et à manches volantées en 48 coloris de soie.

### 3.3 Women: linen sets (`/collection/women/linen` · `leinen/sets-damen` · `lin/ensembles-femme`)

**EN**
- **Title:** Linen two-piece sets for women, made to measure | LINSILK
- **Meta:** Women's linen waistcoat, vest and trouser sets, made to your measurements in 2–4 weeks. 100% linen, 40 colours. From CHF 269.
- **H1:** Linen two-piece sets for women, made to measure
- **Intro:** LINSILK's women's linen sets pair a waistcoat, vest or top with trousers, each cut and sewn to your measurements in 2–4 weeks. They are made in 100% linen and come in 40 linen colours, from CHF 269 to CHF 299.
- **H2 For warm days and travel:** Linen is crisp, airy and cooling; it breathes in heat and softens with every wear. Natural creasing is part of the cloth.
- **H2 Two garments, one order:** A set is two garments on one order, each with its own length and fit measurements.
- **FAQ (visible):** Is linen good for hot weather? · Does linen crease? · Can I order the set in a different length?

**DE-CH**
- **Title:** Leinen-Zweiteiler für Damen nach Mass | LINSILK Genf
- **Meta:** Damen-Sets aus Leinen (Weste, Top und Hose), nach Ihren Massen gefertigt innert 2–4 Wochen. 100 % Leinen, 40 Farben. Ab CHF 269.
- **H1:** Leinen-Zweiteiler für Damen nach Mass
- **Intro:** Die Leinen-Sets für Damen von LINSILK kombinieren Weste, Top oder Bluse mit Hose, jedes nach Ihren Massen zugeschnitten und genäht, innert 2–4 Wochen. Sie sind aus 100 % Leinen gefertigt, in 40 Leinenfarben, ab CHF 269.

**FR**
- **Title:** Ensembles en lin pour femme sur mesure | LINSILK Genève
- **Meta:** Ensembles gilet-pantalon et top-pantalon en lin pour femme, faits à vos mesures en 2 à 4 semaines. 100 % lin, 40 coloris. Dès CHF 269.
- **H1:** Ensembles en lin pour femme, sur mesure
- **Intro:** Les ensembles en lin de LINSILK associent un gilet, un top ou une chemise à un pantalon, chacun coupé et cousu à vos mesures en 2 à 4 semaines. Ils sont en 100 % lin, en 40 coloris, dès CHF 269.

### 3.4 Women: silk skirts and blouses (`/collection/women/silk-separates` · `seide/roecke-blusen` · `soie/jupes-chemisiers`)

**EN**
- **Title:** Silk midi skirts and blouses, made to measure | LINSILK
- **Meta:** Bias-cut silk skirts and silk blouses, made to your measurements in 2–4 weeks. 100% silk, 48 colours. Blouses from CHF 159, skirts CHF 179.
- **H1:** Silk skirts and blouses, made to measure
- **Intro:** LINSILK's silk midi and maxi skirts are cut on the bias, and its silk blouses come with a ruffle front or a mock neck; each is cut and sewn to your measurements in 2–4 weeks. All are 100% silk in 48 silk colours: blouses from CHF 159, skirts CHF 179.
- **DE-CH:** *Seidenröcke und Seidenblusen nach Mass | LINSILK Genf* — Meta: *Schräg geschnittene Seidenröcke und Seidenblusen, nach Ihren Massen gefertigt innert 2–4 Wochen. 100 % Seide, 48 Farben. Ab CHF 159.*
- **FR:** *Jupes et chemisiers en soie sur mesure | LINSILK Genève* — Meta: *Jupes en soie coupées dans le biais et chemisiers en soie, faits à vos mesures en 2 à 4 semaines. 100 % soie, 48 coloris. Dès CHF 159.*

### 3.5 Sleepwear and gifts (`/collection/sleepwear` · `schlafmode/seide` · `pyjamas/soie`)

**EN**
- **Title:** Silk pyjamas and robes, made to measure | LINSILK Geneva
- **Meta:** Silk pyjama sets, robes and slip dresses made to your measurements in 2–4 weeks. A personal gift, from CHF 159. Confirm measurements by 17 Nov for the holidays.
- **H1:** Silk pyjamas, robes and slip dresses, made to measure
- **Intro:** LINSILK's silk sleepwear is made to your measurements in 2–4 weeks, in 100% silk. Pyjama sets, a long wrap robe with slip dress, a three-piece kimono set and a slip mini dress run from CHF 159 to CHF 359 and come in 48 silk colours.
- **H2 Giving it as a gift:** A made-to-measure gift needs the recipient's measurements. Send them the measuring guide, or order for yourself with a gift note. For delivery before the holidays, confirm the measurement sheet by 17 November in Europe, 20 November in Switzerland, and 13 November for the UAE and the rest of the world (up to 4 weeks to make, plus delivery). *(Link to shipping; no exact delivery promise.)*
- **H2 Why silk to sleep in:** Silk is smooth, breathes, and keeps you comfortable when the night is warm or cool.
- **DE-CH:** *Seidenpyjama und Morgenmantel nach Mass | LINSILK Genf* — Meta: *Seidenpyjamas, Morgenmäntel und Slipkleider nach Ihren Massen, gefertigt innert 2–4 Wochen. Ein persönliches Geschenk, ab CHF 159. Masse bis 20. November bestätigen.* — H1: *Seidenpyjama, Morgenmantel und Slipkleid nach Mass*
- **FR:** *Pyjamas et peignoirs en soie sur mesure | LINSILK Genève* — Meta: *Pyjamas, peignoirs et nuisettes en soie faits à vos mesures en 2 à 4 semaines. Un cadeau personnel, dès CHF 159. Mesures à confirmer avant le 20 novembre.* — H1: *Pyjamas, peignoirs et nuisettes en soie, sur mesure*

### 3.6 Men: linen shirts (`/collection/men/shirts` · `herren/leinenhemden` · `hommes/chemises-lin`)

**EN**
- **Title:** Linen shirts for men, made to measure | LINSILK Geneva
- **Meta:** Men's linen shirts: camp-collar, spread-collar, band-collar, wrap and popover. Made to your measurements in 2–4 weeks. From CHF 119.
- **H1:** Linen shirts for men, made to measure
- **Intro:** LINSILK's men's linen shirts are cut and sewn to your own measurements in 2–4 weeks, in 100% linen. Choose camp-collar, spread-collar, band-collar, wrap or popover styles in 40 linen colours, from CHF 119 to CHF 179.
- **H2 Linen for heat and travel:** Linen breathes, so a linen shirt stays airy in warm weather and softens with every wash.
- **H2 Made to measure, not a size:** Your shirt follows your shoulder, chest, sleeve and length measurements, not the nearest S, M or L.
- **FAQ (visible):** Does a linen shirt shrink? · How should a linen shirt fit? · Can I order a linen shirt made to measure online?
- **DE-CH:** *Leinenhemden für Herren nach Mass | LINSILK Genf* — Meta: *Leinenhemden für Herren: Kentkragen, Stehkragen, Camp-Kragen. Nach Ihren Massen gefertigt innert 2–4 Wochen. Ab CHF 119.* — H1: *Leinenhemden für Herren nach Mass*
- **DE (AT/DE):** *Leinenhemd Herren nach Maß | LINSILK Genf* — H1: *Leinenhemden für Herren nach Maß*
- **FR:** *Chemises en lin pour homme sur mesure | LINSILK Genève* — Meta: *Chemises en lin pour homme: col cubain, col mao, col classique. Faites à vos mesures en 2 à 4 semaines. Dès CHF 119.* — H1: *Chemises en lin pour homme, sur mesure*

### 3.7 Men: linen trousers and full looks (`/collection/men/trousers` · `herren/leinenhosen` · `hommes/pantalons-lin`)

**EN**
- **Title:** Linen trousers and full looks for men, made to measure | LINSILK
- **Meta:** Pleated, straight and gurkha linen trousers and full linen looks for men, made to your measurements in 2–4 weeks. 100% linen. From CHF 149.
- **H1:** Linen trousers and full looks for men, made to measure
- **Intro:** LINSILK makes men's linen trousers (pleated, straight, wide-leg and gurkha) and matching shirt-and-trouser looks, cut and sewn to your measurements in 2–4 weeks. All are 100% linen in 40 colours; trousers run from CHF 149 to CHF 174.
- **H2 Summer weddings and holidays:** A full linen look for a summer wedding is a shirt and trousers ordered together, each to your measurements.
- **DE-CH:** *Leinenhosen für Herren nach Mass | LINSILK Genf* — H1: *Leinenhosen und Leinen-Looks für Herren nach Mass*
- **DE (AT/DE):** *Leinenhose Herren mit Bundfalte nach Maß | LINSILK* — H1: *Leinenhosen und Leinen-Looks für Herren, nach Maß*
- **FR:** *Pantalons en lin pour homme sur mesure | LINSILK Genève* — H1: *Pantalons en lin et tenues complètes pour homme, sur mesure*

---

## 4. About (`/about`; `/contact` stays as the contact page)

**EN**
- **Title:** About LINSILK: made-to-measure silk and linen from Geneva
- **Meta:** LINSILK is a Geneva house making clothing to your measurements in 100% silk and 100% linen. How it is made, what it costs, and how to order.
- **H1:** About LINSILK
- **Lead:** (Entity sentence EN, §0.)
- **H2 What made-to-measure means at LINSILK:** Nothing is made to a standard size. Your fifteen measurements become a pattern drawn for you alone. The piece is cut flat from it, one at a time, sewn, inspected twice against your measurements, then dispatched from Geneva. LINSILK does not hold fittings: you measure yourself, or take the measuring guide to any tailor.
- **H2 Why only silk and linen:** Silk and linen are natural fibres that breathe, move with the body and rest lightly on the skin. Every LINSILK garment is made in 100% silk or 100% linen cloth, never a blend or a synthetic. Polyester, nylon and PU cloths are made from petroleum, do not breathe, and shed microplastic fibres when worn and washed.
- **H2 High-frequency fabric:** Every fabric carries a frequency, and silk and linen are two of the highest there are. Worn against the body all day, high-frequency fabric raises your own: you feel lighter, clearer and more at ease in your skin, and it shows in how you carry yourself. Many studies have shown the negative effects of wearing PU, polyester, nylon and other synthetic materials. That is why LINSILK makes only in silk and linen. *(Client decision 22 Oct: plain fact, from the approved About copy `about_linsilk.md`.)*
- **H2 LINSILK at a glance** (definition list, marked up):
  | | |
  | --- | --- |
  | What | Made-to-measure clothing for women and men |
  | Where | Based in Geneva, Switzerland |
  | Cloth | 100% silk or 100% linen |
  | Colours | 48 silk colours (plain, jacquard, brocade); 40 linen colours |
  | Price | CHF 119–359 per piece (from live data) |
  | Making time | 2–4 weeks from your confirmed measurement sheet |
  | How to order | Choose a piece and colour, enter 15 measurements, it is cut and sewn for you |
  | Fittings | None; you measure yourself or use any tailor |
  | Delivery | Switzerland 2–3 days, EU and UK 3–6 days, rest of world 5–10 days, once dispatched from Geneva; tracking included |
  | Returns | Made-to-measure pieces cannot be returned for a change of mind; manufacturing faults are repaired or the piece replaced; an order can be cancelled before cutting |
  | Contact | hello@bylinsilk.com, answered by a person, usually within a day |
- **Closing line:** *Wear what raises you.*

**DE-CH**
- **Title:** Über LINSILK: Mode nach Mass aus Seide und Leinen, aus Genf
- **Meta:** LINSILK ist ein Genfer Modehaus: Kleidung nach Ihren Massen, aus 100 % Seide und 100 % Leinen. So wird sie gefertigt, was sie kostet, wie Sie bestellen.
- **H1:** Über LINSILK
- **Lead:** (Entity sentence DE-CH, §0.)
- **Was «nach Mass» bei LINSILK heisst:** Nichts wird in einer Standardgrösse gefertigt. Ihre fünfzehn Masse werden zu einem Schnittmuster, das nur für Sie gezeichnet wird. Das Stück wird daraus einzeln zugeschnitten, genäht, zweimal mit Ihren Massen geprüft und aus Genf versandt. LINSILK bietet keine Anproben an: Sie messen selbst oder gehen mit der Anleitung zu einer beliebigen Schneiderei.
- **Warum nur Seide und Leinen:** Seide und Leinen sind Naturfasern, die atmen, sich mit dem Körper bewegen und leicht auf der Haut liegen. Jedes Stück von LINSILK ist aus 100 % Seide oder 100 % Leinen gefertigt, nie aus Mischgewebe oder Kunstfaser.
- **Auf einen Blick:** Was: Kleidung nach Mass für Damen und Herren · Wo: Sitz in Genf, Schweiz · Stoff: 100 % Seide oder 100 % Leinen · Farben: 48 Seidenfarben, 40 Leinenfarben · Preis: CHF 119–359 · Fertigung: 2–4 Wochen ab bestätigtem Massblatt · Anprobe: keine · Rückgabe: Stücke nach Mass sind vom Umtausch ausgeschlossen; Fabrikationsfehler werden repariert oder das Stück ersetzt.

**FR**
- **Title:** À propos de LINSILK: soie et lin sur mesure, de Genève
- **Meta:** LINSILK est une maison genevoise: vêtements à vos mesures, en 100 % soie et 100 % lin. Confection, prix et commande.
- **H1:** À propos de LINSILK
- **Ce que « sur mesure » veut dire chez LINSILK:** Rien n'est fabriqué à une taille standard. Vos quinze mesures deviennent un patron tracé pour vous seule ou vous seul. La pièce est coupée à plat, une à la fois, cousue, vérifiée deux fois par rapport à vos mesures, puis expédiée depuis Genève. LINSILK ne propose pas d'essayage: vous vous mesurez vous-même ou vous emportez le guide chez n'importe quel tailleur.
- **Pourquoi seulement la soie et le lin:** La soie et le lin sont des fibres naturelles qui respirent, suivent le corps et reposent légèrement sur la peau. Chaque vêtement LINSILK est en 100 % soie ou 100 % lin, jamais en tissu mélangé ou synthétique.
- **En un coup d'œil:** Quoi: vêtements sur mesure pour femmes et hommes · Où: basée à Genève, Suisse · Tissu: 100 % soie ou 100 % lin · Coloris: 48 de soie, 40 de lin · Prix: CHF 119–359 · Confection: 2 à 4 semaines après validation de la fiche de mesures · Essayage: aucun · Retours: pièces sur mesure non reprises pour changement d'avis; défauts de fabrication réparés ou pièce remplacée.

---

## 5. The Cloth (`/cloth`)

**EN**
- **Title:** Silk and linen cloth: 48 silk and 40 linen colours | LINSILK
- **Meta:** The cloths LINSILK makes in: pure silk (plain, jacquard, brocade) and pure linen. How they feel, how they wear, how to care for them, and all 88 colours.
- **H1:** The cloth: pure silk and pure linen
- **Lead:** LINSILK makes in two cloths only, pure silk and pure linen: no polyester and no blended cloth. You choose your piece's colour from swatches of its own cloth, so this page shows what you are choosing from.
- **H2 Silk:** Smooth and light, silk keeps you comfortable when the temperature drops as well as when it rises. LINSILK's silk comes in three weaves: **plain** (15 colours), **jacquard** (20 patterned colourways) and **brocade** (13 patterned colourways), 48 silk colours in all. Used for dresses, gowns, skirts, blouses and sleepwear.
- **H2 Linen:** Crisp, airy and cooling, linen softens with every wear. LINSILK's 40 linen colours include slub textures. Used for all menswear and the women's waistcoat and trouser sets.
- **H2 Choosing your colour:** On a piece page, click **Select colour** and pick from the swatches of that piece's cloth. You can request a cutting from the house before ordering.
- **H2 Caring for silk and linen:** Both prefer cool hand-washing and drying flat out of direct sun; neither wants a tumble dryer. See the care guide.
- **H2 Why not blends?** Synthetic fibre holds a press longer and costs less to sew, which is why much clothing is made from it or blended with it. LINSILK's cloth is pure silk or pure linen. *(Keep: "Natural fibre creases, softens and moves; that is the cloth, not a fault.")*
- **Replace (live text):** "no polyester in the shell, the lining, the pocket bag or the thread" → the lead above. "A linen jacket worn through one summer…" → "A linen shirt worn through one summer will not look the way it did in the photograph."
- **Colour note (approved 22 Oct):** example colour names in body copy, e.g. "48 silk colours, including ivory and black". Never in a title, H1, alt text, schema or feed.

**DE-CH** — Title: *Seide und Leinen: 48 Seidenfarben, 40 Leinenfarben | LINSILK* · Meta: *Die Stoffe von LINSILK: reine Seide (uni, Jacquard, Brokat) und reines Leinen. Wie sie sich tragen, wie Sie sie pflegen, und alle 88 Farben.* · H1: *Die Stoffe: reine Seide und reines Leinen* · Lead: *LINSILK fertigt nur aus zwei Stoffen, reiner Seide und reinem Leinen: kein Polyester, kein Mischgewebe. Die Farbe Ihres Stücks wählen Sie aus den Mustern seines eigenen Stoffs; diese Seite zeigt, woraus Sie wählen.*

**FR** — Title: *Soie et lin: 48 coloris de soie, 40 de lin | LINSILK* · Meta: *Les tissus de LINSILK: soie pure (unie, jacquard, brocart) et lin pur. Leur toucher, leur tenue, leur entretien, et les 88 coloris.* · H1: *Les tissus: soie pure et lin pur* · Lead: *LINSILK ne travaille que deux tissus, la soie pure et le lin pur: ni polyester, ni tissu mélangé. Vous choisissez le coloris de votre pièce parmi les échantillons de son propre tissu; cette page montre parmi quoi vous choisissez.*

---

## 6. Piece page template (66 pieces, generated from `title`, `cloth`, `price`, `group`, garment type)

### 6.1 URL, title and description

- **URL:** `/piece/{slug}`, slug from the public `title` (e.g. `/piece/silk-cowl-halter-gown`); `/piece/004` 301s to it (plan §6.3). DE: `/de-ch/stueck/{slug_de}`, FR: `/fr-ch/piece/{slug_fr}`.

| | Pattern |
| --- | --- |
| **EN title** | `{Title}, made to measure \| LINSILK Geneva` |
| **EN meta** | `{Title} in 100% {silk/linen}, cut and sewn to your measurements in 2–4 weeks. Choose from {48 silk/40 linen} colours. CHF {price}.` |
| **DE-CH title** | `{Titel} nach Mass \| LINSILK Genf` |
| **DE-CH meta** | `{Titel} aus 100 % {Seide/Leinen}, nach Ihren Massen gefertigt innert 2–4 Wochen. {48 Seidenfarben/40 Leinenfarben} zur Wahl. CHF {price}.` |
| **DE (AT/DE) title** | `{Titel} nach Maß \| LINSILK Genf` |
| **FR title** | `{Titre} sur mesure \| LINSILK Genève` |
| **FR meta** | `{Titre} en 100 % {soie/lin}, coupé(e) et cousu(e) à vos mesures en 2 à 4 semaines. {48 coloris de soie/40 coloris de lin}. CHF {price}.` |

Worked examples (live prices, 19 Oct):

| Piece | Price | EN title | DE-CH title | FR title |
| --- | --- | --- | --- | --- |
| 004 | 319 | Silk cowl halter gown, made to measure \| LINSILK Geneva | Seidenkleid mit Neckholder und Wasserfallausschnitt nach Mass \| LINSILK | Robe longue dos-nu en soie à col bénitier sur mesure \| LINSILK |
| 006 | 339 | Silk long-sleeve wrap maxi dress, made to measure \| LINSILK | Langärmliges Seidenwickelkleid nach Mass \| LINSILK Genf | Robe portefeuille longue manches longues en soie sur mesure \| LINSILK |
| 013 | 179 | Silk bias-cut midi skirt, made to measure \| LINSILK Geneva | Seidenrock im Schrägschnitt nach Mass \| LINSILK Genf | Jupe midi en soie dans le biais sur mesure \| LINSILK |
| 030 | 159 | Silk slip mini dress, made to measure \| LINSILK Geneva | Seiden-Slipkleid mini nach Mass \| LINSILK Genf | Nuisette courte en soie sur mesure \| LINSILK Genève |
| 038 | 289 | Silk long wrap robe and midi slip dress set, made to measure \| LINSILK | Seidenmorgenmantel und Slipkleid nach Mass \| LINSILK Genf | Peignoir et nuisette en soie sur mesure \| LINSILK |
| 016 | 269 | Linen tie-front vest and wide-leg trousers set, made to measure \| LINSILK | Leinen-Set mit Weste und Hose nach Mass \| LINSILK Genf | Ensemble gilet et pantalon en lin sur mesure \| LINSILK |
| 063 | 239 | Silk cowl slip midi dress, made to measure \| LINSILK Geneva | Seiden-Slipkleid midi mit Wasserfallausschnitt nach Mass \| LINSILK | Robe nuisette midi en soie sur mesure \| LINSILK Genève |
| 041 | 139 | Linen spread-collar shirt, made to measure \| LINSILK Geneva | Leinenhemd Herren nach Mass \| LINSILK Genf | Chemise en lin homme sur mesure \| LINSILK Genève |
| 042 | 174 | Linen cuffed trousers, made to measure \| LINSILK Geneva | Leinenhose Herren mit Umschlag nach Mass \| LINSILK Genf | Pantalon en lin homme sur mesure \| LINSILK Genève |
| 059 | 129 | Linen band-collar shirt, made to measure \| LINSILK Geneva | Leinenhemd Herren mit Stehkragen nach Mass \| LINSILK Genf | Chemise en lin col mao sur mesure \| LINSILK Genève |

Where the full public title is too long for the pattern (e.g. 038, 016), the title tag uses a shortened form from the glossary; the H1 keeps the full title. Translated names and slugs come from **one name glossary in the CMS**: *halter = Neckholder / dos-nu*, *cowl = Wasserfallausschnitt / col bénitier*, *wrap = Wickel- / portefeuille*, *slip = Slip- / nuisette*, *camp collar = Camp-Kragen / col cubain*, *waistcoat = Weste / gilet*, *pleated = Bundfalte / à pinces*, *band collar = Stehkragen / col mao*. The native reviewer checks the glossary once, not 66 pages.

### 6.2 Body

1. **H1:** the full public title, cloth first, no colour. e.g. *Silk cowl halter gown*.
2. **Lead (2 sentences):**
   - *EN:* The {title} is made to measure in 100% {silk/linen}: cut and sewn to your own measurements in 2–4 weeks from your confirmed sheet, inspected twice, then dispatched from Geneva. CHF {price}.
   - *DE-CH:* {Titel} wird nach Mass aus 100 % {Seide/Leinen} gefertigt: nach Ihren eigenen Massen zugeschnitten und genäht, innert 2–4 Wochen ab bestätigtem Massblatt, zweimal geprüft und aus Genf versandt. CHF {price}.
   - *FR:* {Titre} est confectionné(e) sur mesure en 100 % {soie/lin}: coupé(e) et cousu(e) à vos propres mesures en 2 à 4 semaines après validation de votre fiche, vérifié(e) deux fois, puis expédié(e) depuis Genève. CHF {price}.
3. **Facts block** (list):
   - **Cloth:** 100% silk (or 100% linen)
   - **Cut:** {from the garment lock: e.g. cowl neck, halter tie, bias-cut}
   - **Length:** {mini / midi / maxi / floor-length}; you set the length when you enter your measurements
   - **Closures:** {zip / tie / buttons / none}
   - **Care:** cool hand-wash, dry flat out of direct sun
   - **Making time:** 2–4 weeks from your confirmed measurement sheet
   - **Delivery to {country}:** {CH 2–3 days · EU 3–6 · UK 3–6 · rest 5–10} once dispatched, with tracking. `[DUTY_LINE_x]`
4. **Collection line** (plan §7): *Part of Collection {n}.* Only for designs marked `limited`: *Made in a capped run for Collection {n}.* Never "not made again" on a design that carries over.
5. **Colour note:** *Made in any of 48 silk colours: plain, jacquard and brocade. Select your colour on this page, or see all the cloth and swatches.* (link `/cloth`). 40 linen colours for linen. **No single colour named.**
6. **How it is made to measure** (H2, 3 steps): 1) Choose your colour from the swatches. 2) Enter your measurements; the measuring guide helps. 3) It is cut and sewn in 2–4 weeks and sent with tracking. (Link → `/made-to-measure`)
7. **Questions about this piece** (visible, **no FAQPage markup**, plan §6.6): the garment-type set from §6.4 plus one piece-specific question taken from the garment lock (only if the answer is a real feature of that piece, e.g. "Is the halter tie adjustable?").
8. **Internal links:** two pieces in the same cloth and garment type; the matching occasion or category page; the measuring guide.
9. **Retired designs:** 301 per plan §7. A design kept live as a record shows *"This design is no longer made"* and two current pieces; Product schema without Offer; out of feeds and sitemap.

### 6.3 Image alt text and file names

| View | EN alt | DE-CH alt | FR alt | File |
| --- | --- | --- | --- | --- |
| Front | Woman wearing a made-to-measure silk cowl halter gown, front view | Frau in einem Seidenkleid mit Neckholder nach Mass, Vorderansicht | Femme portant une robe en soie sur mesure à col bénitier, vue de face | `silk-cowl-halter-gown-front.webp` |
| Upper | …, upper body detail | …, Oberteil im Detail | …, détail du haut | `…-upper.webp` |
| Lower | …, skirt and hem detail | …, Rock und Saum im Detail | …, détail de la jupe et de l'ourlet | `…-lower.webp` |
| Side | …, three-quarter side view | …, Seitenansicht | …, vue de trois quarts | `…-side.webp` |
| Back / detail | …, back view | …, Rückansicht | …, vue de dos | `…-back.webp` |

Men: *Man wearing a made-to-measure linen camp-collar shirt, front view* / *Mann in einem Leinenhemd nach Mass, Vorderansicht* / *Homme portant une chemise en lin sur mesure, vue de face*. Never a colour, never "satin". File names follow the slug.

### 6.4 Garment-type question sets (8 sets; replace the one FAQ repeated on every piece)

Each set has 3 questions. Shared facts (lead time, duty, returns) are one line with a link to `/care/questions`, not a repeated paragraph.

| Set | Pieces | Questions |
| --- | --- | --- |
| Gowns | 001, 003, 004, 010, 011 | Can I set the length for my heel height? · Is a floor-length silk gown warm enough for a winter ball? · How far ahead should I order for an event? |
| Dresses | 002, 005–009, 012, 063, 064, 066 | Can I wear a silk dress to a summer wedding? · Can the length be changed? · How do I measure for a wrap dress? |
| Skirts | 013, 014 | Why is a silk skirt cut on the bias? · Which measurement sets the skirt length? · How do I wash a silk skirt? |
| Blouses | 069, 070 | Which measurements matter for a blouse? · Can I wear a silk blouse to the office? · How do I wash a silk blouse? |
| Women's linen sets | 015–029 | Can I order different sizes for top and trousers? (no sizes: each is cut to its own measurements) · Does linen crease? · Is linen good for travel? |
| Sleepwear | 030–039 | Can I give silk sleepwear as a gift if I don't know the measurements? · How do I wash silk pyjamas? · Is silk good to sleep in when it is warm? |
| Men's shirts | 041, 043, 044, 046, 048, 050, 052, 054, 057, 059, 060, 067, 040 (shirt) | How should a linen shirt fit? · Does a linen shirt shrink? · Is linen good for hot weather? |
| Men's trousers | 042, 045, 047, 049, 051, 053, 055, 056, 061, 062, 068, 040 (shorts) | Where should linen trousers break over the shoe? · What does a pleat change? · Does linen stretch with wear? |

Answers are written once per set in the CMS, in all languages.

---

## 7. `/made-to-measure` (new page, owns the made-to-measure process cluster) and `/design`

### 7.1 `/made-to-measure` · `/de-ch/nach-mass` · `/fr-ch/sur-mesure`

**EN**
- **Title:** Made-to-measure clothing online: how it works | LINSILK
- **Meta:** How to order made-to-measure silk and linen clothing online: choose, enter 15 measurements, ready in 2–4 weeks. No fittings. From CHF 119.
- **H1:** Made-to-measure clothing, ordered online
- **Lead:** Made-to-measure clothing is cut and sewn to your own measurements instead of a standard size. At LINSILK you order online: choose a silk or linen piece, choose its colour, enter fifteen measurements, and it is cut and sewn for you in 2–4 weeks, then dispatched from Geneva.
- **H2 How it works (4 steps):**
  1. Choose a piece from the women's or men's collection.
  2. Choose its colour from the swatches of its cloth (48 silk colours, 40 linen colours).
  3. Enter your measurements, with the measuring guide beside you. No fittings: measure yourself, or take the guide to any tailor.
  4. It is cut and sewn in 2–4 weeks from your confirmed sheet, inspected twice, then sent with tracking.
- **H2 What you pay:** Pieces run CHF 119–359 (silk from CHF 159, linen from CHF 119). The price you see includes the pattern drawn to your measurements; there is no extra charge for it. `[confirm]`
- **H2 Made-to-measure, tailor-made, custom-made or bespoke?** LINSILK is *made to measure*, also called *tailor-made* or *custom-made*: a pattern drawn from your measurements, cut and sewn individually. It is not *bespoke* in the strict tailoring sense, which adds fittings and a trial garment. (Link → guide 1.1)
- **H2 Have a dress made online, without a fitting:** You measure yourself with the guide (about ten minutes with a soft tape), or take the guide to any tailor. Nothing is cut until you confirm your sheet in writing, and each piece is checked twice against your numbers before dispatch.
- **H2 Want something not in the collection?** Design your own piece as a commission. (Link → `/design`)
- **FAQ (5, FAQPage markup):** What is made-to-measure clothing? · How long does it take? · Do I need a fitting? · What if my measurements are wrong? · Can I have a dress made online?

**DE-CH**
- **Title:** Kleidung nach Mass online bestellen: so geht's | LINSILK
- **Meta:** So bestellen Sie Kleidung nach Mass online: wählen, 15 Masse eingeben, fertig innert 2–4 Wochen. Ohne Anprobe. Ab CHF 119.
- **H1:** Kleidung nach Mass, online bestellt
- **Lead:** Kleidung nach Mass wird nach Ihren eigenen Massen zugeschnitten und genäht, nicht nach einer Standardgrösse. Bei LINSILK bestellen Sie online: Stück aus Seide oder Leinen wählen, Farbe wählen, fünfzehn Masse eingeben, und es wird innert 2–4 Wochen für Sie gefertigt und aus Genf versandt.
- **H2 Kleid nähen lassen, ganz ohne Anprobe:** Sie nehmen Ihre Masse selbst (etwa zehn Minuten mit einem weichen Massband) oder gehen mit der Anleitung zu einer beliebigen Schneiderei. Zugeschnitten wird erst nach Ihrer schriftlichen Bestätigung; jedes Stück wird vor dem Versand zweimal mit Ihren Zahlen geprüft.
- **H2 Nach Mass, massgeschneidert, individuell angefertigt oder Bespoke?** LINSILK arbeitet *nach Mass*, auch *massgeschneidert* oder *individuell angefertigt* genannt: ein Schnittmuster aus Ihren Massen, einzeln zugeschnitten und genäht. Bespoke im strengen Schneidersinn, mit Anproben und Probeteil, ist es nicht.
- **FAQ:** Was bedeutet Massanfertigung? · Wie lange dauert es? · Braucht es eine Anprobe? · Was, wenn ich falsch messe? · Kann ich ein Kleid online nähen lassen?

**FR**
- **Title:** Vêtements sur mesure en ligne: comment ça marche | LINSILK
- **Meta:** Commander un vêtement sur mesure en ligne: choisir, saisir 15 mesures, prêt en 2 à 4 semaines. Sans essayage. Dès CHF 119.
- **H1:** Vêtements sur mesure, commandés en ligne
- **Lead:** Un vêtement sur mesure est coupé et cousu à vos propres mesures plutôt qu'à une taille standard. Chez LINSILK, vous commandez en ligne: une pièce en soie ou en lin, son coloris, quinze mesures, et elle est confectionnée pour vous en 2 à 4 semaines, puis expédiée depuis Genève.
- **H2 Faire faire une robe sur mesure sans essayage:** Vous prenez vos mesures vous-même (une dizaine de minutes avec un mètre ruban souple) ou vous emportez le guide chez n'importe quel tailleur. Rien n'est coupé avant votre confirmation écrite; chaque pièce est vérifiée deux fois par rapport à vos chiffres avant l'expédition.
- **H2 Sur mesure, fait sur mesure, personnalisé ou bespoke?** LINSILK travaille *sur mesure*: un patron tiré de vos mesures, coupé et cousu pièce par pièce. Ce n'est pas du *bespoke* au sens strict du métier, qui comprend des essayages et un modèle d'essai.
- **FAQ:** Qu'est-ce que le sur mesure ? · Combien de temps ? · Faut-il un essayage ? · Que faire si mes mesures sont fausses ? · Peut-on faire faire une robe en ligne ?

### 7.2 `/design` (Design Your Own; owns the commission cluster only)

Crawlable copy above or below the existing flow (the flow stays as it is).

**EN**
- **Title:** Design your own dress or shirt in silk or linen | LINSILK
- **Meta:** Design your own piece: choose a base silhouette and the cloth, write a brief, add your measurements. The atelier replies with a price. Silk or linen only.
- **H1:** Design your own, made to your measurements
- **Lead:** Design Your Own is LINSILK's commission service: you choose a base silhouette and the cloth, write a brief to the tailor and submit your measurements; the atelier builds one garment to it and replies with a price before anything is cut.
- **H2 What you can change:** Silhouette, length, neckline and sleeve from the base, in silk or linen. *(List only what the flow actually offers.)*
- **H2 What happens next:** A tailor reads every brief, replies with a price and a timeline, and nothing is cut until you accept.
- **FAQ (3, FAQPage markup):** Can I design my own dress online? · How is a commission priced? · How long does a commission take?
- **DE-CH:** Title *Kleid selbst entwerfen, aus Seide oder Leinen | LINSILK* · H1 *Selbst entwerfen, nach Ihren Massen*. **FR:** Title *Créez votre robe ou chemise en soie ou en lin | LINSILK* · H1 *Créez la vôtre, à vos mesures*.

---

## 8. Structured data (JSON-LD)

**Organization** (layout, every page; `streetAddress`, `vatID` added when supplied, plan §6.13; `sameAs` grows with plan §9):

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://bylinsilk.com/#organization",
  "name": "LINSILK",
  "url": "https://bylinsilk.com",
  "logo": "https://bylinsilk.com/brand/lockup-gold.png",
  "description": "LINSILK is a made-to-measure silk and linen clothing house based in Geneva, Switzerland. Every piece is cut and sewn to the customer's own measurements in 2–4 weeks, in 100% silk or 100% linen cloth.",
  "email": "hello@bylinsilk.com",
  "address": { "@type": "PostalAddress", "addressLocality": "Geneva", "addressCountry": "CH" },
  "sameAs": ["https://instagram.com/linsilk"]
}
```

**Product + Offer** (piece page; values from Medusa; one `OfferShippingDetails` per destination group):

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "@id": "https://bylinsilk.com/piece/silk-cowl-halter-gown#product",
  "name": "Silk cowl halter gown",
  "description": "Silk cowl halter gown, made to measure in 100% silk: cut and sewn to your own measurements in 2–4 weeks, then dispatched from Geneva.",
  "image": [
    "https://bylinsilk.com/…/silk-cowl-halter-gown-front.webp",
    "https://bylinsilk.com/…/silk-cowl-halter-gown-side.webp"
  ],
  "sku": "004",
  "mpn": "004",
  "brand": { "@type": "Brand", "name": "LINSILK" },
  "material": "Silk",
  "category": "Women > Dresses > Gowns",
  "offers": {
    "@type": "Offer",
    "url": "https://bylinsilk.com/piece/silk-cowl-halter-gown",
    "price": "319",
    "priceCurrency": "CHF",
    "availability": "https://schema.org/MadeToOrder",
    "itemCondition": "https://schema.org/NewCondition",
    "seller": { "@id": "https://bylinsilk.com/#organization" },
    "shippingDetails": [
      {
        "@type": "OfferShippingDetails",
        "shippingDestination": { "@type": "DefinedRegion", "addressCountry": ["CH", "LI"] },
        "shippingRate": { "@type": "MonetaryAmount", "value": "[SHIPPING_COST_CH]", "currency": "CHF" },
        "deliveryTime": {
          "@type": "ShippingDeliveryTime",
          "handlingTime": { "@type": "QuantitativeValue", "minValue": 14, "maxValue": 28, "unitCode": "DAY" },
          "transitTime": { "@type": "QuantitativeValue", "minValue": 2, "maxValue": 3, "unitCode": "DAY" }
        }
      },
      {
        "@type": "OfferShippingDetails",
        "shippingDestination": { "@type": "DefinedRegion", "addressCountry": ["AT", "DE", "FR", "LU", "NL", "GB"] },
        "shippingRate": { "@type": "MonetaryAmount", "value": "[SHIPPING_COST_EU]", "currency": "CHF" },
        "deliveryTime": {
          "@type": "ShippingDeliveryTime",
          "handlingTime": { "@type": "QuantitativeValue", "minValue": 14, "maxValue": 28, "unitCode": "DAY" },
          "transitTime": { "@type": "QuantitativeValue", "minValue": 3, "maxValue": 6, "unitCode": "DAY" }
        }
      },
      {
        "@type": "OfferShippingDetails",
        "shippingDestination": { "@type": "DefinedRegion", "addressCountry": ["AE"] },
        "shippingRate": { "@type": "MonetaryAmount", "value": "[SHIPPING_COST_ROW]", "currency": "CHF" },
        "deliveryTime": {
          "@type": "ShippingDeliveryTime",
          "handlingTime": { "@type": "QuantitativeValue", "minValue": 14, "maxValue": 28, "unitCode": "DAY" },
          "transitTime": { "@type": "QuantitativeValue", "minValue": 5, "maxValue": 10, "unitCode": "DAY" }
        }
      }
    ]
  }
}
```

- Add `hasMerchantReturnPolicy` (`returnPolicyCategory: https://schema.org/MerchantReturnNotPermitted`, `applicableCountry` per market) **only after** the legal check (plan §13.3). Until then, leave it out rather than publish a policy that may be wrong.
- No `aggregateRating` or `review` until real reviews exist. No `color` (house rule).
- Retired design kept live: Product without `offers`.

**BreadcrumbList** on piece and category pages (Home > Women > Silk dresses and gowns > piece).

**FAQPage** only on `/care/questions`, `/made-to-measure`, `/design`, guides and market pages; the markup matches the visible questions and answers word for word. **Not** on piece or category pages (plan §6.6).

**Article** on guides: `headline`, `datePublished`, `dateModified`, named `author` (a person), `publisher` = `{"@id": "https://bylinsilk.com/#organization"}`.

**WebSite** on the home page: `name` LINSILK, `url`, `inLanguage` per locale, `publisher` = the Organization.
