/* The house's catalogue, as the storefront reads it.
 *
 * A collection is a first-class thing here, not a label on a product: it has a
 * slug, a number, a season and a status. `current` is open and orderable;
 * `past` is archived and readable but never orderable again. That shape maps
 * directly onto a Medusa product collection with a `status` metadata field, so
 * the storefront and the backend agree on what a collection is.
 *
 * Both the collections and the pieces now come from Medusa rather than from
 * this file, which is what lets a piece, a photograph or a season arrive
 * without a deploy. The lookups below kept their names and their meaning and
 * gained an `await`. The written-down copy the seed provisions an empty
 * database from lives in the backend, beside the script that uses it
 * (apps/medusa/src/scripts/catalogue-fixture.ts).
 *
 * A read that cannot be answered returns nothing rather than throwing:
 * `medusaGet` already swallows an unreachable backend, and every page here is
 * written to render what it has — an empty rail is not drawn, an empty archive
 * says so. Quietly wrong beats a build that will not finish.
 *
 * Counts are always derived from the pieces, never written down twice.
 */

/* Explicit .ts extension: payload's CLI loads this file outside Next's own
   bundler when it runs payload/seed.ts, which reads STORY from here, and
   resolves a relative import only with the literal extension — the same
   constraint payload.config.ts documents. */
import { medusaGet } from './medusa.ts';

export type Group = 'women' | 'men';
/** What a piece is cut from. The house makes in silk and in linen, nothing else. */
export type Cloth = 'silk' | 'linen';
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

export type Piece = {
  id: string;
  /** Slug of the collection this piece belongs to. */
  collection: string;
  group: Group;
  name: string;
  /** Cloth and construction, shown under the name on every tile. */
  material: string;
  /* Which colour library the client chooses from. Null for a piece the house
     has not tagged, which cannot be reserved until it is. */
  cloth: Cloth | null;
  /** Price in whole Swiss francs. */
  price: number;
  /** Art direction for the photograph that replaces the placeholder. */
  shot: string;
  sleep?: boolean;
  /* Which garment lengths the sheet should ask for. The atelier takes a
     different length for a dress, a skirt, a trouser and anything hanging
     from the shoulder, so the piece names its own — and a set names both,
     because it is two garments on one ticket. */
  lengthKinds?: LengthKind[];
  /** Photography, once a piece has any. Empty until then, and an empty list is
      what tells the frame to render the placeholder weave from `shot`. */
  images: string[];
  /* Both carried on the piece rather than looked up, because the order panel
     is a client component and cannot go and read the collection itself. */
  orderable: boolean;
  collectionTitle: string;
};

/* ---- Reading the backend ---- *
 *
 * Collections that are not a season — the commission and silhouette holding
 * collections, and a season still being built up — carry a `status` this file
 * does not recognise, and are dropped here. A piece whose collection was
 * dropped is dropped with it, so one rule keeps both the shop and the archive
 * to seasons the house has actually opened.
 */

type ApiCollection = {
  handle: string;
  title: string;
  metadata?: Record<string, unknown> | null;
};

type ApiProduct = {
  handle: string;
  title: string;
  subtitle?: string | null;
  thumbnail?: string | null;
  images?: { url: string }[] | null;
  metadata?: Record<string, unknown> | null;
  collection?: { handle: string } | null;
  variants?: { calculated_price?: { calculated_amount?: number } | null }[] | null;
};

const isStatus = (value: unknown): value is CollectionStatus =>
  value === 'current' || value === 'past';

const readCollection = (c: ApiCollection): Collection | null => {
  const meta = c.metadata ?? {};
  if (!isStatus(meta.status)) return null;
  return {
    slug: c.handle,
    season: String(meta.season ?? c.title),
    number: Number(meta.number ?? 0),
    title: c.title,
    status: meta.status,
    note: String(meta.note ?? ''),
    ...(meta.closes ? { closes: String(meta.closes) } : {}),
  };
};

const LENGTH_KINDS: LengthKind[] = ['dress', 'skirt', 'trouser', 'top', 'robe'];

const readPiece = (p: ApiProduct, collection: Collection): Piece => {
  const meta = p.metadata ?? {};
  const kinds = Array.isArray(meta.length_kinds)
    ? meta.length_kinds.filter((k): k is LengthKind =>
        LENGTH_KINDS.includes(k as LengthKind),
      )
    : [];
  /* The thumbnail is one of the images, so it leads rather than repeats. */
  const images = [
    ...(p.thumbnail ? [p.thumbnail] : []),
    ...(p.images ?? []).map((i) => i.url).filter((url) => url !== p.thumbnail),
  ];

  return {
    id: p.handle,
    collection: collection.slug,
    group: meta.group === 'men' ? 'men' : 'women',
    name: p.title,
    material: p.subtitle ?? '',
    cloth: meta.cloth === 'silk' || meta.cloth === 'linen' ? meta.cloth : null,
    price: p.variants?.[0]?.calculated_price?.calculated_amount ?? 0,
    shot: String(meta.shot ?? ''),
    ...(meta.sleep ? { sleep: true } : {}),
    ...(kinds.length ? { lengthKinds: kinds } : {}),
    images,
    orderable: collection.status === 'current',
    collectionTitle: collection.title,
  };
};

/* `w2` before `w10`: the handle is a letter and a number, and sorting it as
   text would read the catalogue out in the wrong order once a collection
   passes nine pieces. */
const byHandle = (a: Piece, b: Piece) =>
  a.id.localeCompare(b.id, 'en', { numeric: true });

/** The house prices in francs, so the shop is read in the Swiss region. The
    currency a client is charged in is settled at checkout, not here. */
async function swissRegionId(): Promise<string | null> {
  const body = await medusaGet<{ regions: { id: string; name: string }[] }>(
    '/store/regions',
    3600,
  );
  const regions = body?.regions ?? [];
  return (regions.find((r) => r.name === 'Switzerland') ?? regions[0])?.id ?? null;
}

/* ---- Lookups ---- */

export async function getCollections(): Promise<Collection[]> {
  const body = await medusaGet<{ collections: ApiCollection[] }>(
    '/store/collections?limit=100&fields=handle,title,metadata',
  );
  return (body?.collections ?? [])
    .map(readCollection)
    .filter((c): c is Collection => c !== null)
    .sort((a, b) => b.number - a.number);
}

export async function getPieces(): Promise<Piece[]> {
  const region = await swissRegionId();
  const seasons = new Map((await getCollections()).map((c) => [c.slug, c]));
  if (!region || seasons.size === 0) return [];

  const body = await medusaGet<{ products: ApiProduct[] }>(
    `/store/products?limit=200&region_id=${region}` +
      '&fields=handle,title,subtitle,thumbnail,metadata,*images,*collection,*variants.calculated_price',
  );

  return (body?.products ?? [])
    .flatMap((p) => {
      const collection = p.collection ? seasons.get(p.collection.handle) : undefined;
      return collection ? [readPiece(p, collection)] : [];
    })
    .sort(byHandle);
}

export const currentCollection = async () =>
  (await getCollections()).find((c) => c.status === 'current');

export const pastCollections = async () =>
  (await getCollections()).filter((c) => c.status === 'past');

export const collectionBySlug = async (slug: string) =>
  (await getCollections()).find((c) => c.slug === slug);

export const piecesIn = async (slug: string) =>
  (await getPieces()).filter((p) => p.collection === slug);

export const findPiece = async (id: string) =>
  (await getPieces()).find((p) => p.id === id);

/** True when the piece's collection is still open, so it can be reserved. */
export const isOrderable = (piece: Piece) => piece.orderable;

/** Pieces in a collection, split the way the collection pages present them. */
export const byGroup = async (group: Group, sleep = false, slug?: string) => {
  const season = slug ?? (await currentCollection())?.slug;
  if (!season) return [];
  return (await piecesIn(season)).filter(
    (p) => p.group === group && Boolean(p.sleep) === sleep,
  );
};

/* ---- The measurement sheet ---- *
 *
 * Taken from the atelier's own chart.
 *
 * Note the four drop measurements — bust point, front waist, back waist and
 * hip depth. They are drops from a fixed point rather than girths, and they
 * are what let a flat pattern sit on a specific body. No amount of chest and
 * waist circumference substitutes for them.
 */

export type Zone = {
  key: string;
  label: string;
  hint: string;
};

export const ZONES: Zone[] = [
  { key: 'neck', label: 'Neck', hint: 'Around the base of the neck, one finger of ease.' },
  { key: 'shoulder', label: 'Shoulder', hint: 'Across the back, shoulder bone to shoulder bone.' },
  { key: 'bust', label: 'Bust / chest', hint: 'Fullest point, tape level all the way round.' },
  { key: 'bustPoint', label: 'Bust point', hint: 'From the top of the shoulder straight down to the fullest point of the bust.' },
  { key: 'frontWaist', label: 'Front waist length', hint: 'From the top of the shoulder, down over the bust, to the natural waist.' },
  { key: 'backWaist', label: 'Back waist length', hint: 'From the bone at the base of the neck, straight down the back, to the natural waist.' },
  { key: 'waist', label: 'Waist', hint: 'Narrowest point, usually just above the navel.' },
  { key: 'hip', label: 'Hip', hint: 'Fullest point of the seat, feet together.' },
  { key: 'hipDepth', label: 'Hip depth', hint: 'From the natural waist straight down to the fullest point of the seat.' },
  { key: 'thigh', label: 'Thigh', hint: 'Around the fullest part, standing.' },
  { key: 'knee', label: 'Knee', hint: 'Around the knee, leg straight.' },
  { key: 'sleeve', label: 'Sleeve length', hint: 'From the shoulder bone to the wrist bone, arm slightly bent.' },
  { key: 'bicep', label: 'Upper arm', hint: 'Around the widest part, arm relaxed.' },
  { key: 'wrist', label: 'Wrist', hint: 'Over the wrist bone.' },
  { key: 'rise', label: 'Rise', hint: 'Sitting on a hard chair: from the natural waist at the front, between the legs, to the natural waist at the back.' },
];

/* ---- Garment lengths ---- *
 * A body does not tell the bench how long to make a thing. The chart carries a
 * separate length for each kind of garment, taken from a different place on
 * each, so the sheet asks for the one that applies. */

export type LengthKind = 'dress' | 'skirt' | 'trouser' | 'top' | 'robe';

/* Each length has its own key, so a sleep set can carry a top length and a
   trouser length on the same sheet without one overwriting the other. */
export const LENGTH_ZONE: Record<LengthKind, Zone> = {
  dress: {
    key: 'lengthDress',
    label: 'Dress length',
    hint: 'From the top of the shoulder, over the bust, straight down to where you want the hem to fall. Measure against a dress you already own and like.',
  },
  skirt: {
    key: 'lengthSkirt',
    label: 'Skirt length',
    hint: 'From the natural waist straight down to where you want the hem to fall.',
  },
  trouser: {
    key: 'lengthTrouser',
    label: 'Trouser length',
    hint: 'From the natural waist down the outside of the leg to where you want the hem to fall, without shoes.',
  },
  top: {
    key: 'lengthTop',
    label: 'Desired length',
    hint: 'From the top of the shoulder seam straight down to where you want the hem to fall. Measure against a garment you already own and like.',
  },
  robe: {
    key: 'lengthRobe',
    label: 'Robe length',
    hint: 'From the top of the shoulder seam straight down to where you want the robe to fall. Measure against a robe you already own and like.',
  },
};

export const garmentZonesFor = (piece: Pick<Piece, 'lengthKinds'>): Zone[] =>
  (piece.lengthKinds ?? []).map((kind) => LENGTH_ZONE[kind]);

/* ---- Commission ---- */

export const COMMISSION_STEPS = [
  'Silhouette',
  'Cloth',
  'Notes',
  'Measurements',
  'Send',
] as const;

/* ---- Editorial ---- *
 * Seeds Payload's `pages` collection (payload/seed.ts) — the storefront reads
 * this copy back from there now (lib/payload.ts's getStoryPage), not from
 * this constant. Kept here because it is the seed's input and the copy is
 * final either way. */

export const STORY = {
  cloth: {
    title: 'The Cloth',
    lead: 'Premium silk and premium linen, and nothing else. No synthetic fibre in the shell, the lining, the pocket bag or the thread.',
    a: 'Silk is smooth and light, and keeps you comfortable when the temperature drops as well as when it rises. Linen is crisp, airy and cooling, and softens with every wear. Both breathe, move with the body and rest lightly on the skin.',
    b: 'Natural fibre creases, moves and ages. A linen jacket after one summer does not look like the photograph, and that is what it is for. Synthetic blends hold a press longer and cost less to sew, which is why most houses put them where the customer cannot see. The house does not keep any in the room.',
  },
  contact: {
    title: 'The house',
    lead: 'LinSilk was set up to make one thing properly: clothing in pure natural fibre, cut for one body, made in small capped runs and never restocked.',
    a: 'Orders and client care are handled from Geneva. Prices are in Swiss francs and include duty within Switzerland and the EU. A piece takes two to four weeks from the confirmed measurement sheet.',
    b: 'Write to hello@bylinsilk.com with any question about a piece or your order.',
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
