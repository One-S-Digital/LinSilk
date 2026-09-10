/* The house's catalogue.
 *
 * A collection is a first-class thing here, not a label on a product: it has a
 * slug, a number, a season and a status. `current` is open and orderable;
 * `past` is archived and readable but never orderable again. That shape maps
 * directly onto a Medusa product collection with a `status` metadata field, so
 * the storefront and the backend agree on what a collection is.
 *
 * Counts are always derived from the pieces, never written down twice.
 */

export type Group = 'women' | 'men';
export type CollectionStatus = 'current' | 'past';

export type Collection = {
  slug: string;
  /** Season name on its own — 'Autumn'. */
  season: string;
  number: number;
  /** Full display title — 'Autumn — Collection IV'. */
  title: string;
  status: CollectionStatus;
  /** The cloth the season was built on. */
  note: string;
  /** Shown on the archive; the current collection says when it closes. */
  closes?: string;
};

export const COLLECTIONS: Collection[] = [
  {
    slug: 'autumn-iv',
    season: 'Autumn',
    number: 4,
    title: 'Autumn — Collection IV',
    status: 'current',
    note: 'Sand silk twill and unpressed linen.',
    closes: 'February',
  },
  {
    slug: 'summer-iii',
    season: 'Summer',
    number: 3,
    title: 'Summer — Collection III',
    status: 'past',
    note: 'Wet-spun linen in flax and olive.',
  },
  {
    slug: 'spring-ii',
    season: 'Spring',
    number: 2,
    title: 'Spring — Collection II',
    status: 'past',
    note: 'Oyster and champagne charmeuse.',
  },
  {
    slug: 'winter-i',
    season: 'Winter',
    number: 1,
    title: 'Winter — Collection I',
    status: 'past',
    note: 'Deep burgundy silk crepe. The first.',
  },
];

export type Piece = {
  id: string;
  /** Slug of the collection this piece belongs to. */
  collection: string;
  group: Group;
  name: string;
  /** Cloth and construction, shown under the name on every tile. */
  material: string;
  /** Price in whole Swiss francs. */
  price: number;
  /** Art direction for the photograph that replaces the placeholder. */
  shot: string;
  sleep?: boolean;
  /* Which garment length the sheet should ask for. The atelier takes a
     different length for a dress, a skirt, a trouser and anything hanging
     from the shoulder, so the piece names its own. */
  lengthKind?: LengthKind;
};

export const PIECES: Piece[] = [
  /* ---- Autumn — Collection IV (current) ---- */
  { id: 'w1', collection: 'autumn-iv', group: 'women', name: 'Coat, Bảo Lộc silk', material: 'Sand silk twill, unlined', price: 1980, shot: 'full length, stone doorway', lengthKind: 'top' },
  { id: 'w2', collection: 'autumn-iv', group: 'women', name: 'Bias dress, champagne', material: '19mm charmeuse, hand-rolled hem', price: 1640, shot: 'walking, tiled wall', lengthKind: 'dress' },
  { id: 'w3', collection: 'autumn-iv', group: 'women', name: 'Wide trouser, flax', material: 'Wet-spun linen, unpressed crease', price: 890, shot: 'seated, low warm light', lengthKind: 'trouser' },
  { id: 'w4', collection: 'autumn-iv', group: 'women', name: 'Shirt, cream linen', material: 'Handkerchief linen, shell buttons', price: 640, shot: 'shoulder detail', lengthKind: 'top' },
  { id: 'w5', collection: 'autumn-iv', group: 'women', name: 'Column skirt, burgundy', material: 'Silk satin, invisible placket', price: 780, shot: 'street, mid-stride', lengthKind: 'skirt' },
  { id: 'w6', collection: 'autumn-iv', group: 'women', name: 'Jacket, olive linen', material: 'Half-canvassed, hand-set sleeve', price: 1720, shot: 'front, courtyard', lengthKind: 'top' },
  { id: 'w7', collection: 'autumn-iv', group: 'women', name: 'Slip, oyster', material: '16mm silk, French seams', price: 520, shot: 'draped on chair', lengthKind: 'dress' },
  { id: 'w8', collection: 'autumn-iv', group: 'women', name: 'Sleep set, cream silk', material: '19mm silk, piped edge', price: 690, shot: 'morning window', sleep: true },
  { id: 'w9', collection: 'autumn-iv', group: 'women', name: 'Robe, deep burgundy', material: '22mm silk crepe, tie belt', price: 840, shot: 'interior, doorway', sleep: true, lengthKind: 'top' },

  { id: 'm1', collection: 'autumn-iv', group: 'men', name: 'Overshirt, olive linen', material: 'Heavy linen, patch pockets', price: 720, shot: 'street, hands in pocket', lengthKind: 'top' },
  { id: 'm2', collection: 'autumn-iv', group: 'men', name: 'Two-button jacket, cream', material: 'Linen canvas, hand-padded lapel', price: 2140, shot: 'full length, stone', lengthKind: 'top' },
  { id: 'm3', collection: 'autumn-iv', group: 'men', name: 'Pleated trouser, sand', material: 'Linen, side adjusters', price: 820, shot: 'seated, tiled floor', lengthKind: 'trouser' },
  { id: 'm4', collection: 'autumn-iv', group: 'men', name: 'Shirt, oyster silk', material: '16mm silk, hand-set collar', price: 680, shot: 'collar detail', lengthKind: 'top' },
  { id: 'm5', collection: 'autumn-iv', group: 'men', name: 'Field coat, loden', material: 'Linen drill, bridle stitch', price: 1890, shot: 'walking, rain light', lengthKind: 'top' },
  { id: 'm6', collection: 'autumn-iv', group: 'men', name: 'Knit-neck tee, flax', material: 'Linen jersey, bound neck', price: 340, shot: 'front, plain wall' },
  { id: 'm7', collection: 'autumn-iv', group: 'men', name: 'Sleep trouser, cream', material: '19mm silk, drawstring', price: 480, shot: 'interior morning', sleep: true, lengthKind: 'trouser' },
  { id: 'm8', collection: 'autumn-iv', group: 'men', name: 'Sleep shirt, sand silk', material: '19mm silk, piped edge', price: 560, shot: 'bed, warm light', sleep: true, lengthKind: 'top' },

  /* ---- Summer — Collection III (archived) ---- */
  { id: 's1', collection: 'summer-iii', group: 'women', name: 'Shirt dress, flax', material: 'Wet-spun linen, shell buttons', price: 1180, shot: 'courtyard, midday', lengthKind: 'dress' },
  { id: 's2', collection: 'summer-iii', group: 'women', name: 'Wide trouser, olive', material: 'Wet-spun linen, unpressed crease', price: 860, shot: 'walking, white wall', lengthKind: 'trouser' },
  { id: 's3', collection: 'summer-iii', group: 'women', name: 'Camp shirt, flax', material: 'Handkerchief linen, open collar', price: 590, shot: 'seated, shutters' },
  { id: 's4', collection: 'summer-iii', group: 'women', name: 'Sleeveless column, olive', material: 'Linen, bias-cut skirt', price: 1240, shot: 'stone steps', lengthKind: 'dress' },
  { id: 's5', collection: 'summer-iii', group: 'women', name: 'Coat, undyed linen', material: 'Linen drill, unlined', price: 1690, shot: 'full length, doorway', lengthKind: 'top' },
  { id: 's6', collection: 'summer-iii', group: 'women', name: 'Wrap skirt, flax', material: 'Wet-spun linen, tie waist', price: 640, shot: 'mid-stride, gravel', lengthKind: 'skirt' },
  { id: 's7', collection: 'summer-iii', group: 'men', name: 'Camp-collar shirt, olive', material: 'Handkerchief linen, one-piece collar', price: 610, shot: 'front, shaded wall', lengthKind: 'top' },
  { id: 's8', collection: 'summer-iii', group: 'men', name: 'Drawstring trouser, flax', material: 'Wet-spun linen, no belt loops', price: 720, shot: 'seated, courtyard', lengthKind: 'trouser' },
  { id: 's9', collection: 'summer-iii', group: 'men', name: 'Unlined blazer, olive', material: 'Linen canvas, patch pockets', price: 1780, shot: 'full length, rain light', lengthKind: 'top' },
  { id: 's10', collection: 'summer-iii', group: 'men', name: 'Short-sleeve shirt, flax', material: 'Handkerchief linen, bound cuff', price: 520, shot: 'shoulder detail', lengthKind: 'top' },
  { id: 's11', collection: 'summer-iii', group: 'men', name: 'Linen tee, undyed', material: 'Linen jersey, bound neck', price: 310, shot: 'front, plain wall' },
  { id: 's12', collection: 'summer-iii', group: 'men', name: 'Field jacket, olive', material: 'Linen drill, bridle stitch', price: 1620, shot: 'walking, wet street', lengthKind: 'top' },

  /* ---- Spring — Collection II (archived) ---- */
  { id: 'p1', collection: 'spring-ii', group: 'women', name: 'Bias slip, oyster', material: '19mm charmeuse, French seams', price: 780, shot: 'draped, morning light', lengthKind: 'dress' },
  { id: 'p2', collection: 'spring-ii', group: 'women', name: 'Blouse, champagne', material: '16mm charmeuse, covered placket', price: 690, shot: 'collar detail', lengthKind: 'top' },
  { id: 'p3', collection: 'spring-ii', group: 'women', name: 'Column dress, oyster', material: '19mm charmeuse, hand-rolled hem', price: 1560, shot: 'full length, plaster wall', lengthKind: 'dress' },
  { id: 'p4', collection: 'spring-ii', group: 'women', name: 'Wide trouser, champagne', material: 'Silk charmeuse, side adjusters', price: 940, shot: 'seated, low light', lengthKind: 'trouser' },
  { id: 'p5', collection: 'spring-ii', group: 'women', name: 'Camisole, oyster', material: '16mm silk, bias straps', price: 430, shot: 'flat, raking light', lengthKind: 'top' },
  { id: 'p6', collection: 'spring-ii', group: 'women', name: 'Robe, champagne', material: '22mm silk, tie belt', price: 890, shot: 'interior, window', sleep: true, lengthKind: 'top' },
  { id: 'p7', collection: 'spring-ii', group: 'women', name: 'Slip skirt, oyster', material: 'Charmeuse, invisible placket', price: 620, shot: 'mid-stride, tile', lengthKind: 'skirt' },
  { id: 'p8', collection: 'spring-ii', group: 'men', name: 'Shirt, oyster charmeuse', material: '16mm silk, hand-set collar', price: 720, shot: 'front, plain wall', lengthKind: 'top' },
  { id: 'p9', collection: 'spring-ii', group: 'men', name: 'Pyjama trouser, champagne', material: '19mm silk, drawstring', price: 500, shot: 'interior morning', sleep: true, lengthKind: 'trouser' },
  { id: 'p10', collection: 'spring-ii', group: 'men', name: 'Overshirt, oyster', material: 'Silk crepe, patch pockets', price: 840, shot: 'street, hands in pocket', lengthKind: 'top' },
  { id: 'p11', collection: 'spring-ii', group: 'men', name: 'Sleep shirt, champagne', material: '19mm silk, piped edge', price: 560, shot: 'bed, warm light', sleep: true, lengthKind: 'top' },
  { id: 'p12', collection: 'spring-ii', group: 'men', name: 'Silk tee, oyster', material: '16mm silk jersey, bound neck', price: 390, shot: 'front, shaded wall' },
  { id: 'p13', collection: 'spring-ii', group: 'men', name: 'Lounge trouser, oyster', material: 'Silk crepe, elastic waist', price: 610, shot: 'seated, interior', lengthKind: 'trouser' },

  /* ---- Winter — Collection I (archived) ---- */
  { id: 'i1', collection: 'winter-i', group: 'women', name: 'Crepe dress, burgundy', material: '22mm silk crepe, hand-rolled hem', price: 1720, shot: 'full length, dark room', lengthKind: 'dress' },
  { id: 'i2', collection: 'winter-i', group: 'women', name: 'Blouse, burgundy', material: '19mm crepe, covered placket', price: 710, shot: 'collar detail', lengthKind: 'top' },
  { id: 'i3', collection: 'winter-i', group: 'women', name: 'Column skirt, burgundy', material: 'Silk crepe, invisible placket', price: 760, shot: 'mid-stride, stone', lengthKind: 'skirt' },
  { id: 'i4', collection: 'winter-i', group: 'women', name: 'Wide trouser, burgundy', material: 'Silk crepe, side adjusters', price: 900, shot: 'seated, warm light', lengthKind: 'trouser' },
  { id: 'i5', collection: 'winter-i', group: 'women', name: 'Robe, burgundy', material: '22mm crepe, tie belt', price: 870, shot: 'interior, doorway', sleep: true, lengthKind: 'top' },
  { id: 'i6', collection: 'winter-i', group: 'women', name: 'Slip, burgundy', material: '16mm silk, French seams', price: 490, shot: 'draped on chair', lengthKind: 'dress' },
  { id: 'i7', collection: 'winter-i', group: 'men', name: 'Crepe shirt, burgundy', material: '19mm crepe, hand-set collar', price: 700, shot: 'front, plain wall', lengthKind: 'top' },
  { id: 'i8', collection: 'winter-i', group: 'men', name: 'Pyjama set, burgundy', material: '19mm silk, piped edge', price: 980, shot: 'bed, low light', sleep: true },
  { id: 'i9', collection: 'winter-i', group: 'men', name: 'Overshirt, burgundy', material: 'Silk crepe, patch pockets', price: 830, shot: 'street, evening', lengthKind: 'top' },
  { id: 'i10', collection: 'winter-i', group: 'men', name: 'Trouser, burgundy', material: 'Silk crepe, flat front', price: 780, shot: 'seated, tiled floor', lengthKind: 'trouser' },
  { id: 'i11', collection: 'winter-i', group: 'men', name: 'Scarf, burgundy', material: '22mm crepe, hand-rolled edge', price: 260, shot: 'flat, raking light' },
];

/* ---- Lookups ---- */

export const currentCollection = () =>
  COLLECTIONS.find((c) => c.status === 'current')!;

export const pastCollections = () =>
  COLLECTIONS.filter((c) => c.status === 'past');

export const collectionBySlug = (slug: string) =>
  COLLECTIONS.find((c) => c.slug === slug);

export const piecesIn = (slug: string) =>
  PIECES.filter((p) => p.collection === slug);

export const findPiece = (id: string) => PIECES.find((p) => p.id === id);

/** True when the piece's collection is still open, so it can be reserved. */
export const isOrderable = (piece: Piece) =>
  collectionBySlug(piece.collection)?.status === 'current';

/** Pieces in a collection, split the way the collection pages present them. */
export const byGroup = (
  group: Group,
  sleep = false,
  slug = currentCollection().slug,
) =>
  PIECES.filter(
    (p) => p.collection === slug && p.group === group && Boolean(p.sleep) === sleep,
  );

/* ---- The measurement sheet ---- *
 *
 * Translated from the atelier's own chart, which is worked in Vietnamese. The
 * Vietnamese term travels with each zone because that is what is written on
 * the ticket in Hội An, and a sheet that reaches the bench in the bench's own
 * vocabulary is one fewer thing to mistranslate.
 *
 * Note the four "hạ" measurements — bust point, front waist, back waist and
 * hip depth. They are drops from a fixed point rather than girths, and they
 * are what let a flat pattern sit on a specific body. No amount of chest and
 * waist circumference substitutes for them.
 */

export type Zone = {
  key: string;
  label: string;
  /** The tailor's own term, as written on the chart. */
  vi: string;
  hint: string;
};

export const ZONES: Zone[] = [
  { key: 'neck', label: 'Neck', vi: 'Cổ', hint: 'Around the base of the neck, one finger of ease.' },
  { key: 'shoulder', label: 'Shoulder', vi: 'Vai', hint: 'Across the back, shoulder bone to shoulder bone.' },
  { key: 'bust', label: 'Bust / chest', vi: 'Ngực', hint: 'Fullest point, tape level all the way round.' },
  { key: 'bustPoint', label: 'Bust point', vi: 'Hạ đỉnh ngực', hint: 'From the top of the shoulder straight down to the fullest point of the bust.' },
  { key: 'frontWaist', label: 'Front waist length', vi: 'Hạ eo trước', hint: 'From the top of the shoulder, down over the bust, to the natural waist.' },
  { key: 'backWaist', label: 'Back waist length', vi: 'Hạ eo sau', hint: 'From the bone at the base of the neck, straight down the back, to the natural waist.' },
  { key: 'waist', label: 'Waist', vi: 'Eo', hint: 'Narrowest point, usually just above the navel.' },
  { key: 'hip', label: 'Hip', vi: 'Mông', hint: 'Fullest point of the seat, feet together.' },
  { key: 'hipDepth', label: 'Hip depth', vi: 'Hạ đỉnh mông', hint: 'From the natural waist straight down to the fullest point of the seat.' },
  { key: 'thigh', label: 'Thigh', vi: 'Đùi', hint: 'Around the fullest part, standing.' },
  { key: 'knee', label: 'Knee', vi: 'Gối', hint: 'Around the knee, leg straight.' },
  { key: 'sleeve', label: 'Sleeve length', vi: 'Dài tay', hint: 'From the shoulder bone to the wrist bone, arm slightly bent.' },
  { key: 'bicep', label: 'Upper arm', vi: 'Bắp tay', hint: 'Around the widest part, arm relaxed.' },
  { key: 'wrist', label: 'Wrist', vi: 'Cổ tay', hint: 'Over the wrist bone.' },
  { key: 'rise', label: 'Rise', vi: 'Đáy quần', hint: 'Sitting on a hard chair: from the natural waist at the front, between the legs, to the natural waist at the back.' },
];

/* ---- Garment lengths ---- *
 * A body does not tell the bench how long to make a thing. The chart carries a
 * separate length for each kind of garment, taken from a different place on
 * each, so the sheet asks for the one that applies. */

export type LengthKind = 'dress' | 'skirt' | 'trouser' | 'top';

export const LENGTH_ZONE: Record<LengthKind, Zone> = {
  dress: {
    key: 'length',
    label: 'Dress length',
    vi: 'Chiều dài đầm',
    hint: 'From the top of the shoulder, over the bust, straight down to where you want the hem to fall. Measure against a dress you already own and like.',
  },
  skirt: {
    key: 'length',
    label: 'Skirt length',
    vi: 'Dài váy',
    hint: 'From the natural waist straight down to where you want the hem to fall.',
  },
  trouser: {
    key: 'length',
    label: 'Trouser length',
    vi: 'Dài quần',
    hint: 'From the natural waist down the outside of the leg to where you want the hem to fall, without shoes.',
  },
  top: {
    key: 'length',
    label: 'Desired length',
    vi: 'Dài áo',
    hint: 'From the top of the shoulder seam straight down to where you want the hem to fall. Measure against a garment you already own and like.',
  },
};

export const garmentZonesFor = (piece: Pick<Piece, 'lengthKind'>): Zone[] =>
  piece.lengthKind ? [LENGTH_ZONE[piece.lengthKind]] : [];

/* ---- Cloth ---- */

export type Fabric = {
  key: string;
  name: string;
  origin: string;
  /** Placeholder weave rendering until real swatch photography lands. */
  css: string;
  /** True for silks, which get the sheen sweep on hover. */
  lustrous?: boolean;
};

export const FABRICS: Fabric[] = [
  {
    key: 'silk19',
    name: 'Silk charmeuse, 19mm',
    origin: 'Bảo Lộc, Việt Nam · 100% mulberry silk',
    css: 'linear-gradient(118deg,#E8DCC6,#D8C6A6 60%,#E8DCC6)',
    lustrous: true,
  },
  {
    key: 'silk22',
    name: 'Silk crepe, 22mm',
    origin: 'Bảo Lộc, Việt Nam · 100% mulberry silk',
    css: 'linear-gradient(118deg,#6E3B3B,#5A2E2E 60%,#7A4545)',
    lustrous: true,
  },
  {
    key: 'linenh',
    name: 'Handkerchief linen',
    origin: 'Kortrijk, Belgium · 100% wet-spun flax',
    css: 'repeating-linear-gradient(90deg,#E4DAC6 0 3px,#DCD0B8 3px 6px)',
  },
  {
    key: 'linend',
    name: 'Linen drill, heavy',
    origin: 'Kortrijk, Belgium · 100% wet-spun flax',
    css: 'repeating-linear-gradient(90deg,#5C6B4C 0 3px,#4E5C40 3px 6px)',
  },
];

/* ---- Commission ---- */

/* `estimate` is the opening figure quoted before the tailor has read the note,
   and it tracks bench hours: a half-canvassed jacket is roughly forty, a shirt
   closer to eight. `lengthKind` decides which finished length the commission
   sheet asks for. */
export const SILHOUETTES = [
  { key: 'shirt', name: 'Shirt', note: 'Set sleeve, one-piece collar.', estimate: 1200, lengthKind: 'top' as const },
  { key: 'trouser', name: 'Trouser', note: 'Flat or pleated front.', estimate: 1450, lengthKind: 'trouser' as const },
  { key: 'dress', name: 'Dress', note: 'Bias or straight cut.', estimate: 2200, lengthKind: 'top' as const },
  { key: 'jacket', name: 'Jacket', note: 'Half-canvassed, two button.', estimate: 3200, lengthKind: 'top' as const },
] as const;

export type Silhouette = (typeof SILHOUETTES)[number];

export const COMMISSION_STEPS = [
  'Silhouette',
  'Cloth',
  'Notes',
  'Measurements',
  'Review',
] as const;

/* ---- Editorial ---- *
 * Moves to Payload once the CMS is wired; the copy is final either way. */

export const STORY = {
  atelier: {
    title: 'The Atelier',
    lead: 'One room in Hội An, nine people, and a bench that has been in use since 2019. Everything the house sells is cut and finished here.',
    a: 'Patterns are drawn on paper for one client and kept. Cloth is cut flat by hand against that paper — never stacked, never die-cut. Seams are closed on a single industrial machine; hems, facings, buttonholes, linings and bar tacks are worked by hand at the bench. Nothing is fused. A silk dress takes eleven to sixteen hours; a half-canvassed jacket takes closer to forty.',
    b: 'Before a garment leaves, it is checked twice against the measurement sheet by someone who did not sew it. Anything more than half a centimetre out is opened and re-set. The names of the people who cut and finished your piece are written on the ticket that comes with it, because a claim about handwork that cannot be attributed to a person is not a claim at all.',
  },
  cloth: {
    title: 'The Cloth',
    lead: 'Mulberry silk from Bảo Lộc and wet-spun linen from Kortrijk. No synthetic fibre in the shell, the lining, the pocket bag or the thread.',
    a: 'Silk is bought in 16, 19 and 22 momme weights, undyed where possible and finished in small lots. Linen is wet-spun rather than dry-spun, which produces a smoother yarn and a cloth that softens instead of pilling. Both are bought by the bolt, logged with mill and date, and used until the bolt is gone.',
    b: 'Natural fibre creases, moves and ages. A linen jacket after one summer does not look like the photograph, and that is what it is for. Synthetic blends hold a press longer and cost less to sew, which is why most houses put them where the customer cannot see. The house does not keep any in the room.',
  },
  contact: {
    title: 'The house',
    lead: 'Maison Ayla was set up to make one thing properly: clothing in pure natural fibre, cut for one body, made in small capped runs and never restocked.',
    a: 'Orders and client care are handled from Zürich; everything is made in Hội An. Prices are in Swiss francs and include duty within Switzerland and the EU. A commission takes four to six weeks from the confirmed measurement sheet; a seasonal piece takes three to five.',
    b: 'Alterations to a piece the house made are free for the first year — send it back and it is re-set at the bench. Write to hello@maisonayla.ch for measurement help, a fabric cutting, or an appointment with a tailor in Zürich.',
  },
} as const;

export type StoryKey = keyof typeof STORY;

/* ---- Formatting ---- */

/** Swiss francs, Swiss grouping: CHF 1'980. */
export function money(amount: number, currency = 'CHF') {
  return `${currency} ${amount.toLocaleString('de-CH')}`;
}

/** The house numbers its collections in Roman, and its counts with them. */
export function roman(n: number) {
  const table: [number, string][] = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
    [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
    [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
  ];
  let out = '';
  let rest = n;
  for (const [value, sign] of table) {
    while (rest >= value) {
      out += sign;
      rest -= value;
    }
  }
  return out;
}
