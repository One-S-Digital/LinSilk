/* What kind of garment a piece is, read from what the catalogue already
 * knows (group, sleep, cloth, name), and the questions each kind answers on
 * its page. One set per kind rather than one set repeated on every piece, so
 * no two kinds of page carry the same text (docs/seo/SEO-GEO-PLAN.md §6.6).
 * Every answer restates something the house already says elsewhere on the
 * site — the measuring hints in lib/catalog.ts, the care line, the shipping
 * times — and nothing new. */

import type { Piece } from './catalog';
import { COLOURS, coloursOf, fibre } from './house';

export type GarmentType =
  | 'gown'
  | 'dress'
  | 'skirt'
  | 'blouse'
  | 'linen-set'
  | 'sleepwear'
  | 'shirt'
  | 'trousers'
  | 'cashmere-pants'
  | 'tie';

export function garmentType(
  piece: Pick<Piece, 'group' | 'sleep' | 'cloth' | 'name' | 'lengthKinds' | 'noMeasurements'>,
): GarmentType {
  const name = piece.name.toLowerCase();
  /* A piece that asks for no measurements is a tie: nothing else is ordered
     by colour alone. It is read first so no later rule can claim it. */
  if (piece.noMeasurements) return 'tie';
  if (piece.sleep) return 'sleepwear';
  const only = piece.lengthKinds ?? [];
  if (piece.cloth === 'cashmere' && only.length === 1 && only[0] === 'trouser') return 'cashmere-pants';
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

const CARE_CASHMERE: QA = {
  q: 'How do I care for it?',
  a: 'Cashmere prefers cool hand-washing and drying flat out of direct sun; it does not want a tumble dryer.',
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
  'cashmere-pants': [
    {
      q: 'How do I choose the pants length?',
      a: 'Measure from your natural waist down the outside of the leg to where you want the hem to fall, without shoes.',
    },
    {
      q: 'Which measurements do cashmere pants need?',
      a: 'The waist, hip, hip depth, thigh, knee and rise, plus the pants length. The sheet leaves out the upper body.',
    },
    {
      q: 'Which colours do the pants come in?',
      a: `You choose from ${COLOURS.cashmere} cashmere colours, from swatches of the cloth itself, before you enter your measurements.`,
    },
    CARE_CASHMERE,
  ],
  tie: [
    {
      q: 'Does a tie need measurements?',
      a: 'No. A tie is not cut to your body: you choose the colour from the swatches offered for it and it is made in one standard length.',
    },
    {
      q: 'How wide is the tie?',
      a: 'Classic width: about 8 cm at the widest part of the broad blade.',
    },
    {
      q: 'What is on the back of the tie?',
      a: 'A small woven LINSILK label on the broad blade, and a keeper loop of the same silk for the narrow blade to pass through. The photograph of the back shows exactly where.',
    },
    {
      q: 'How long does delivery take?',
      a: 'Once dispatched from Geneva, with tracking: 2–3 days in Switzerland, 3–6 days to the EU and UK, and 5–10 days elsewhere.',
    },
  ],
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
      a: 'They share one measurement sheet, and each garment takes its own length, so the top and the pants or shorts each fall where you want them.',
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
      q: 'How do I choose the pants length?',
      a: 'Measure from your natural waist down the outside of the leg to where you want the hem to fall, without shoes.',
    },
    {
      q: 'Which measurements do pants need?',
      a: 'The waist, hip, hip depth, thigh, knee and rise, plus the pants length. The sheet leaves out the upper body.',
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
  trousers: { label: 'Pants', google: 'Apparel & Accessories > Clothing > Pants' },
  'cashmere-pants': { label: 'Cashmere pants', google: 'Apparel & Accessories > Clothing > Pants' },
  tie: { label: 'Ties', google: 'Apparel & Accessories > Clothing Accessories > Neckties' },
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
  LONG_PANTS: 'worn with long pants',
};

/* The ties are product photographs, not model shots. */
const TIE_VIEWS: Record<string, string> = {
  FULL_FRONT: 'rolled tie',
  ANGLE_ROLL: 'rolled tie, angled view',
  FLAT: 'tie laid flat, both blades',
  DETAIL: 'close-up of the silk weave',
  BACK: 'back of the tie with the LINSILK label',
};

/** 'Woman wearing a made-to-measure silk cowl halter gown, front view'. */
export function imageAlt(
  piece: Pick<Piece, 'group' | 'name'> & { noMeasurements?: boolean },
  src: string,
  index: number,
) {
  const who = piece.group === 'men' ? 'Man' : 'Woman';
  const what = piece.name.charAt(0).toLowerCase() + piece.name.slice(1);
  const view = src.match(/_\d{2}_([A-Z_]+?)-[A-Z0-9]+\.\w+$/)?.[1];
  if (piece.noMeasurements) {
    const what = view && TIE_VIEWS[view];
    return `${piece.name}, ${what ?? `view ${index + 1}`}`;
  }
  return `${who} wearing a made-to-measure ${what}, ${view && VIEWS[view] ? VIEWS[view] : `view ${index + 1}`}`;
}

/* ---- What a piece is called in schema, feeds and titles ----
 * One place, so the Product schema, the Google feed and the ChatGPT feed
 * describe a made-to-measure piece, and a tie that is not, the same way. */

type Describable = Pick<Piece, 'name' | 'cloth' | 'swatches' | 'noMeasurements'>;

const clothOf = (p: Describable) => p.cloth ?? 'silk';

/** ', made to measure' for a piece cut to a body; nothing for a tie. */
export const madeToMeasureSuffix = (p: Pick<Piece, 'noMeasurements'>) =>
  p.noMeasurements ? '' : ', made to measure';

/** The short description used in the Product schema. */
export function schemaDescription(p: Describable) {
  const cloth = fibre(clothOf(p));
  return p.noMeasurements
    ? `${p.name}, in ${cloth}: ordered by colour alone, in one standard length, then dispatched from Geneva.`
    : `${p.name}, made to measure in ${cloth}: cut and sewn to your own measurements in 2–4 weeks, then dispatched from Geneva.`;
}

/** The longer description used in the product feeds. */
export function feedDescription(p: Describable) {
  const cloth = clothOf(p);
  const colours = `${coloursOf(p)} ${cloth} colours`;
  return p.noMeasurements
    ? `${p.name}, in ${fibre(cloth)}: ordered by colour alone, in one standard length, then dispatched from Geneva. Choose from ${colours}.`
    : `${p.name}, made to measure in ${fibre(cloth)}: cut and sewn to your own measurements in 2–4 weeks from your confirmed measurement sheet, then dispatched from Geneva. Choose from ${colours}. No fittings: measure yourself or use any tailor.`;
}
