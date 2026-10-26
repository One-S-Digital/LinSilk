/* What kind of garment a piece is, read from what the catalogue already
 * knows (group, sleep, cloth, name), and the questions each kind answers on
 * its page. One set per kind rather than one set repeated on every piece, so
 * no two kinds of page carry the same text (docs/seo/SEO-GEO-PLAN.md §6.6).
 * Every answer restates something the house already says elsewhere on the
 * site — the measuring hints in lib/catalog.ts, the care line, the shipping
 * times — and nothing new. */

import type { Piece } from './catalog';

export type GarmentType =
  | 'gown'
  | 'dress'
  | 'skirt'
  | 'blouse'
  | 'linen-set'
  | 'sleepwear'
  | 'shirt'
  | 'trousers';

export function garmentType(piece: Pick<Piece, 'group' | 'sleep' | 'cloth' | 'name' | 'lengthKinds'>): GarmentType {
  const name = piece.name.toLowerCase();
  if (piece.sleep) return 'sleepwear';
  if (piece.group === 'men') {
    const kinds = piece.lengthKinds ?? [];
    if (kinds.length > 1) return 'linen-set';
    return kinds.length === 1 && kinds[0] === 'trouser' ? 'trousers' : 'shirt';
  }
  if (piece.cloth === 'linen') return 'linen-set';
  if (name.includes('gown')) return 'gown';
  if (name.includes('skirt')) return 'skirt';
  if (name.includes('blouse')) return 'blouse';
  return 'dress';
}

export type QA = { q: string; a: string };

const CARE_SILK: QA = {
  q: 'How do I care for it?',
  a: 'Silk prefers cool hand-washing and drying flat out of direct sun; it does not want a tumble dryer.',
};

const CARE_LINEN: QA = {
  q: 'How do I care for it?',
  a: 'Linen prefers cool hand-washing and drying flat out of direct sun; it does not want a tumble dryer.',
};

const CREASE: QA = {
  q: 'Does linen crease?',
  a: 'Yes. Natural linen creases, softens and ages with wear; that is the cloth, not a fault.',
};

const ORDER_AHEAD: QA = {
  q: 'How far ahead should I order for an event?',
  a: 'About six weeks before a date in Europe and eight weeks before one further away: the piece takes 2–4 weeks from your confirmed measurement sheet, then 2–10 days to arrive depending on where you are.',
};

const DRESS_LENGTH: QA = {
  q: 'How do I choose the length?',
  a: 'You give the length yourself: measure from the top of the shoulder, over the bust, straight down to where you want the hem to fall. Measuring against a dress you already own and like helps.',
};

export const QUESTIONS: Record<GarmentType, QA[]> = {
  gown: [
    DRESS_LENGTH,
    ORDER_AHEAD,
    CARE_SILK,
  ],
  dress: [
    DRESS_LENGTH,
    {
      q: 'Is a silk dress comfortable in warm weather?',
      a: 'Yes. Silk breathes and rests lightly on the skin, and it keeps you comfortable when the temperature drops as well as when it rises.',
    },
    ORDER_AHEAD,
  ],
  skirt: [
    {
      q: 'How do I choose the skirt length?',
      a: 'Measure from your natural waist straight down to where you want the hem to fall.',
    },
    {
      q: 'Which measurements does a skirt need?',
      a: 'Only the waist, the hip and the hip depth, plus the skirt length. The sheet leaves out the upper body and the leg.',
    },
    CARE_SILK,
  ],
  blouse: [
    {
      q: 'How do I choose the length?',
      a: 'Measure from the top of the shoulder seam straight down to where you want the hem to fall, ideally against a top you already own and like.',
    },
    {
      q: 'Which measurements does a blouse need?',
      a: 'The upper-body measurements, the waist and the hip, plus the length. The sheet leaves out the leg.',
    },
    CARE_SILK,
  ],
  'linen-set': [
    {
      q: 'Are the two pieces measured separately?',
      a: 'They share one measurement sheet, and each garment takes its own length, so the top and the trousers or shorts each fall where you want them.',
    },
    CREASE,
    CARE_LINEN,
  ],
  sleepwear: [
    {
      q: 'Can I give it as a gift?',
      a: 'Yes, with one caveat: it is made to measure, so you need the recipient’s measurements. Send them the measuring guide, or ask them to take the fifteen measurements with any tailor.',
    },
    {
      q: 'Is silk good to sleep in?',
      a: 'Silk is smooth, breathes, and keeps you comfortable when the night is warm or cool.',
    },
    CARE_SILK,
  ],
  shirt: [
    {
      q: 'Which measurements does a shirt need?',
      a: 'The upper-body measurements, the waist and the hip, plus the length you want. The sheet leaves out the leg.',
    },
    {
      q: 'Is linen good in hot weather?',
      a: 'Linen is crisp, airy and cooling; it breathes in the heat and softens with every wear.',
    },
    CREASE,
  ],
  trousers: [
    {
      q: 'How do I choose the trouser length?',
      a: 'Measure from your natural waist down the outside of the leg to where you want the hem to fall, without shoes.',
    },
    {
      q: 'Which measurements do trousers need?',
      a: 'The waist, hip, hip depth, thigh, knee and rise, plus the trouser length. The sheet leaves out the upper body.',
    },
    CREASE,
  ],
};

/** The breadcrumb and feed category for each kind. */
export const CATEGORY: Record<GarmentType, { label: string; google: string }> = {
  gown: { label: 'Gowns', google: 'Apparel & Accessories > Clothing > Dresses' },
  dress: { label: 'Dresses', google: 'Apparel & Accessories > Clothing > Dresses' },
  skirt: { label: 'Skirts', google: 'Apparel & Accessories > Clothing > Skirts' },
  blouse: { label: 'Blouses', google: 'Apparel & Accessories > Clothing > Shirts & Tops' },
  'linen-set': { label: 'Linen sets', google: 'Apparel & Accessories > Clothing > Outfit Sets' },
  sleepwear: { label: 'Sleepwear', google: 'Apparel & Accessories > Clothing > Sleepwear & Loungewear' },
  shirt: { label: 'Shirts', google: 'Apparel & Accessories > Clothing > Shirts & Tops' },
  trousers: { label: 'Trousers', google: 'Apparel & Accessories > Clothing > Pants' },
};

/* The pipeline names every photograph by its view
   (LINSILK_004_02_UPPER-….jpg), so each one can say what it shows. */
const VIEWS: Record<string, string> = {
  FULL_FRONT: 'front view',
  UPPER: 'upper body detail',
  LOWER: 'lower body and hem detail',
  SIDE: 'three-quarter side view',
  BACK: 'back view',
  ALT_DETAIL: 'three-quarter view',
  FULL_LOOK: 'full look with the matching piece',
  LONG_PANTS: 'worn with long trousers',
};

/** 'Woman wearing a made-to-measure silk cowl halter gown, front view'. */
export function imageAlt(piece: Pick<Piece, 'group' | 'name'>, src: string, index: number) {
  const who = piece.group === 'men' ? 'Man' : 'Woman';
  const what = piece.name.charAt(0).toLowerCase() + piece.name.slice(1);
  const view = src.match(/_\d{2}_([A-Z_]+?)-[A-Z0-9]+\.\w+$/)?.[1];
  return `${who} wearing a made-to-measure ${what}, ${view && VIEWS[view] ? VIEWS[view] : `view ${index + 1}`}`;
}
