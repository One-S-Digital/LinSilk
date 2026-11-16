/* The care guide's words and rules (docs/care/CARE-GUIDE-PLAN.md §0).
 *
 * The box a piece arrives in carries one QR code to /care and nothing else,
 * so this file is the whole of the house's care advice. The rules per cloth
 * were set by the owner on 2026-11-16; change them here and the page, the
 * symbol strip and the comparison table all follow. English only for now. */

import type { IconName } from '@/components/care/care-icon';
import { CARE_DE } from './care-guide-de';
import { CARE_FR } from './care-guide-fr';
import type { Lang } from './i18n';

export type ClothKey = 'silk' | 'linen' | 'cashmere' | 'ties';

export const CLOTH_KEYS: ClothKey[] = ['silk', 'linen', 'cashmere', 'ties'];

export type Step = { icon: IconName; title: string; body: string };
export type Tip = { icon: IconName; text: string };
export type Glance = { icon: IconName; label: string };

export type ClothCare = {
  name: string;
  /** The cloth as it follows "For" in a sentence: 'silk', 'la soie'. */
  forCloth: string;
  /** A few words on how the cloth feels, under its name on the card. */
  feel: string;
  /** The clean render shown as the cloth's texture (a neutral swatch). */
  texture: string;
  glance: Glance[];
  rules: string[];
  /** A highlighted note shown before the wash steps, when the cloth has one. */
  notice?: { title: string; body: string };
  washH: string;
  washIntro: string;
  wash: Step[];
  /** The second way to wash, shown as a smaller card after the steps. */
  washAlt?: { title: string; body: string };
  /** Replaces the 'Drying' heading where the cloth is never washed. */
  dryH?: string;
  dry: Tip[];
  dryNever: string;
  /** Iron dots, 0 for no iron. */
  heat: 0 | 1 | 2 | 3;
  heatLabel: string;
  press: Tip[];
  wear: Tip[];
  store: { method: 'padded' | 'wide' | 'clip' | 'roll'; label: string; tips: Tip[] };
  keep: string[];
  avoid: string[];
};

const CARE_EN: Record<ClothKey, ClothCare> = {
  silk: {
    name: 'Silk',
    forCloth: 'silk',
    feel: 'Fluid, cool, light on the skin',
    texture: '/swatches/silk/LS-S07.webp',
    glance: [
      { icon: 'washHand', label: 'Hand wash, 30°' },
      { icon: 'noBleach', label: 'No bleach' },
      { icon: 'dryFlatShade', label: 'Dry flat, in shade' },
      { icon: 'noTumble', label: 'No dryer' },
      { icon: 'iron1', label: 'Iron low' },
      { icon: 'dryCleanP', label: 'Cleaner welcome' },
    ],
    rules: [
      'Cool water and a pH-neutral silk wash, always.',
      'Press the water out; never wring or twist.',
      'Let perfume and deodorant dry before you dress.',
    ],
    notice: {
      title: 'Jacquard or brocade silk?',
      body: 'Silks with a woven pattern go to a professional cleaner only. The pattern is made in the weave, and home washing can pucker or shift it. The steps below are for plain silk.',
    },
    washH: 'Washing by hand',
    washIntro: 'Five quiet minutes at the basin is all plain silk asks for.',
    wash: [
      { icon: 'basin', title: 'Cool water', body: 'Fill a clean basin with cool water, no warmer than 30 °C.' },
      { icon: 'bottle', title: 'A little silk wash', body: 'A capful of pH-neutral detergent made for silk. No enzymes, no bleach, no softener.' },
      { icon: 'swirl', title: 'Inside out, gently', body: 'Turn the piece inside out and move it through the water for three to five minutes. Never scrub.' },
      { icon: 'rinse', title: 'Rinse cool', body: 'Rinse in clean, cool water until no soap is left.' },
      { icon: 'pressPalms', title: 'Press, don’t wring', body: 'Press the water out between flat palms. Wringing breaks wet silk fibres.' },
      { icon: 'towelRoll', title: 'Roll in a towel', body: 'Lay it on a clean towel, roll it up, and press once more to draw out the damp.' },
    ],
    washAlt: {
      title: 'By machine, if you prefer',
      body: 'Not the first choice, but possible for plain silk: delicate cycle, 30 °C, inside a mesh bag, lowest spin, with other silks only. Take it out as soon as the cycle ends.',
    },
    dry: [
      { icon: 'dryFlat', text: 'Dry flat on a dry towel, or on a padded hanger.' },
      { icon: 'shade', text: 'Indoors or in shade, away from sun and radiators.' },
      { icon: 'clock', text: 'Silk dries fast; it is usually ready within a few hours.' },
    ],
    dryNever: 'Never the tumble dryer',
    heat: 1,
    heatLabel: 'Low, the silk setting',
    press: [
      { icon: 'insideOut', text: 'Inside out, and only once the silk is fully dry.' },
      { icon: 'pressCloth', text: 'Lay a thin cotton cloth between the iron and the silk.' },
      { icon: 'noSpray', text: 'No water spray on silk: drops can leave marks.' },
      { icon: 'steamer', text: 'A steamer held a hand’s width away is the easiest daily refresh.' },
    ],
    wear: [
      { icon: 'perfume', text: 'Perfume, hairspray and deodorant first; dress once they have dried.' },
      { icon: 'air', text: 'Air it on a hanger after an evening, rather than washing every time.' },
      { icon: 'rest', text: 'Give it a day’s rest between wears; the fibres relax back.' },
      { icon: 'sun', text: 'Keep long hours of strong sun for linen: light fades silk over time.' },
    ],
    store: {
      method: 'padded',
      label: 'Hung on a padded hanger',
      tips: [
        { icon: 'hangerPadded', text: 'Dresses and blouses on padded hangers, buttons done up.' },
        { icon: 'bag', text: 'Gowns inside a breathable cotton cover. Never plastic.' },
        { icon: 'dark', text: 'A cool, dark, dry wardrobe, with a little room around each piece.' },
      ],
    },
    keep: [
      'Cool water, 30 °C at most',
      'pH-neutral silk detergent',
      'Pressing out, rolling in a towel',
      'Low iron, inside out, with a cloth',
      'Padded hangers and cotton covers',
    ],
    avoid: [
      'Hot water, bleach, softener, enzymes',
      'Wringing, scrubbing, rubbing a spot',
      'Tumble dryer and radiators',
      'Water spray while ironing',
      'Plastic covers and strong sun',
    ],
  },

  linen: {
    name: 'Linen',
    forCloth: 'linen',
    feel: 'Airy, crisp, softer with every wash',
    texture: '/swatches/linen/LS-L04.webp',
    glance: [
      { icon: 'dryCleanP', label: 'First wash: cleaner' },
      { icon: 'wash30Gentle', label: 'Then 30°, gentle' },
      { icon: 'noBleach', label: 'No bleach' },
      { icon: 'lineDryShade', label: 'Hang to dry' },
      { icon: 'noTumble', label: 'No dryer' },
      { icon: 'iron2', label: 'Iron medium' },
    ],
    rules: [
      'The first wash goes to a professional cleaner.',
      'After that: 30 °C, gentle cycle, no dryer.',
      'Iron it while still a little damp.',
    ],
    notice: {
      title: 'The first wash: a professional cleaner',
      body: 'Linen settles most in its first wash, and LINSILK’s linen is not pre-washed. Washed at home the first time, it can lose a few centimetres from a fit made to your measurements. Ask a cleaner for a gentle clean the first time; from the second wash on, home is easy.',
    },
    washH: 'From the second wash',
    washIntro: 'Linen is the easiest of the three, and it gets softer every time.',
    wash: [
      { icon: 'insideOut', title: 'Close and turn', body: 'Do up the buttons, empty the pockets, and turn the piece inside out.' },
      { icon: 'meshBag', title: 'In a mesh bag', body: 'A mesh bag keeps buttons and seams from catching on the drum.' },
      { icon: 'wash30Gentle', title: 'Gentle, 30 °C', body: 'A gentle or delicate cycle at 30 °C, with a mild detergent. No bleach.' },
      { icon: 'similar', title: 'With similar colours', body: 'Wash with linen or cottons of a similar shade, and leave room in the drum.' },
      { icon: 'shake', title: 'Shake it out', body: 'Straight out of the machine, give it a firm shake and smooth the seams with your hands.' },
      { icon: 'hangerWide', title: 'Hang in shade', body: 'Dry on a wide hanger, out of strong sun. Hand washing in cool water works just as well.' },
    ],
    dry: [
      { icon: 'hangerWide', text: 'Shirts and jackets on a wide hanger; pants hung by the waistband.' },
      { icon: 'shade', text: 'Shade or indoors: strong sun can fade dark linen.' },
      { icon: 'clock', text: 'Take it down while just damp if you plan to iron.' },
    ],
    dryNever: 'Never the tumble dryer',
    heat: 2,
    heatLabel: 'Medium, while slightly damp',
    press: [
      { icon: 'insideOut', text: 'Iron on the reverse; dark linen especially, to avoid shine.' },
      { icon: 'spray', text: 'Dry already? Mist it lightly and wait five minutes.' },
      { icon: 'steamer', text: 'A steamer softens creases quickly; it won’t make linen crisp.' },
      { icon: 'crease', text: 'Some creases will come back by lunchtime. That is linen being linen.' },
    ],
    wear: [
      { icon: 'crease', text: 'Creases are part of linen’s ease; they soften as you move.' },
      { icon: 'air', text: 'Air it overnight between wears; linen freshens quickly.' },
      { icon: 'sun', text: 'Made for warm days, terraces and long lunches.' },
      { icon: 'perfume', text: 'Let perfume dry before dressing, especially on pale linen.' },
    ],
    store: {
      method: 'wide',
      label: 'Hung on a wide hanger',
      tips: [
        { icon: 'hangerWide', text: 'Shirts and jackets on wide hangers that hold the shoulder.' },
        { icon: 'fold', text: 'Pants folded loosely along the crease, not packed tight.' },
        { icon: 'bag', text: 'For the winter: clean, then a breathable cotton bag, never sealed plastic.' },
      ],
    },
    keep: [
      'A professional first wash',
      '30 °C, gentle cycle, mesh bag',
      'Shaking out and drying in shade',
      'Ironing while damp, on the reverse',
      'Wide hangers and breathing room',
    ],
    avoid: [
      'A first wash at home',
      'Hot washes and bleach',
      'The tumble dryer',
      'Ironing dark linen on the face',
      'Sealed plastic for long storage',
    ],
  },

  cashmere: {
    name: 'Cashmere',
    forCloth: 'cashmere',
    feel: 'Soft, warm, tailored',
    texture: '/swatches/cashmere/LS-C05.webp',
    glance: [
      { icon: 'washHand', label: 'Hand wash, 30°' },
      { icon: 'wash30Wool', label: 'Or wool cycle, 30°' },
      { icon: 'noBleach', label: 'No bleach' },
      { icon: 'dryFlat', label: 'Dry flat' },
      { icon: 'noTumble', label: 'No dryer' },
      { icon: 'iron2', label: 'Iron with a cloth' },
    ],
    rules: [
      'Brush and air between wears; wash only when needed.',
      'Same cool temperature from wash to rinse.',
      'Dry flat, then press the crease back with a cloth.',
    ],
    washH: 'Washing by hand',
    washIntro: 'Cashmere needs washing far less than you think. When it does, keep the water cool and the hands gentle.',
    wash: [
      { icon: 'basin', title: 'Cool water', body: 'A basin of cool water, no warmer than 30 °C, and the pants turned inside out.' },
      { icon: 'bottle', title: 'Wool and cashmere wash', body: 'A gentle wash made for wool. Ordinary detergents with enzymes harm the fibre.' },
      { icon: 'soak', title: 'Soak, then squeeze', body: 'Let them soak for ten minutes, then squeeze the water through softly. No rubbing.' },
      { icon: 'rinse', title: 'Rinse at the same temperature', body: 'Rinse in water of the same coolness. A sudden change in temperature tightens the fibre.' },
      { icon: 'towelRoll', title: 'Roll in a towel', body: 'Lift them out in both hands, lay them on a towel and roll to press out the water.' },
      { icon: 'dryFlat', title: 'Dry flat, reshape', body: 'Lay flat, lined up along the crease, and smooth the waistband and pockets with your hands.' },
    ],
    washAlt: {
      title: 'By machine',
      body: 'A wool cycle at 30 °C, inside a mesh bag, on a low spin, then dry flat. Hand washing is kinder to the pressed crease and the waistband, so keep the machine for when time is short.',
    },
    dry: [
      { icon: 'dryFlat', text: 'Flat on a dry towel, turning once; never hung while wet.' },
      { icon: 'shade', text: 'Away from radiators and sun, which harden the fibre.' },
      { icon: 'clock', text: 'Allow a day or more; put away only when fully dry.' },
    ],
    dryNever: 'Never the tumble dryer',
    heat: 2,
    heatLabel: 'Wool setting, with a damp cloth',
    press: [
      { icon: 'pressCloth', text: 'A damp cotton cloth between the iron and the cashmere, always.' },
      { icon: 'crease', text: 'Press the crease back along its line; lift the iron, don’t slide it.' },
      { icon: 'steamer', text: 'Between wears, steam from a hand’s width on the reverse.' },
      { icon: 'noShine', text: 'A hot iron straight on the face leaves shine and flattens the nap.' },
    ],
    wear: [
      { icon: 'brush', text: 'Brush gently along the nap after wearing to lift dust.' },
      { icon: 'rest', text: 'A day’s rest between wears lets the cloth recover its shape.' },
      { icon: 'comb', text: 'Small pills at the thighs are natural; lift them with a cashmere comb, now and then.' },
      { icon: 'air', text: 'Air rather than wash: cashmere freshens on a hanger by an open window.' },
    ],
    store: {
      method: 'clip',
      label: 'Hung by the hem on a clip hanger',
      tips: [
        { icon: 'hangerClip', text: 'Hang by the hem from a clip hanger; small creases fall out overnight.' },
        { icon: 'cedar', text: 'Cedar or lavender in the wardrobe keeps moths away.' },
        { icon: 'bag', text: 'For the summer: clean first, then a cotton bag. Check them in spring.' },
      ],
    },
    keep: [
      'Brushing and airing between wears',
      'Cool water and a wool wash',
      'Drying flat, away from heat',
      'Pressing with a damp cloth',
      'Cedar and clean storage',
    ],
    avoid: [
      'Washing after every wear',
      'Hot water or a change of temperature',
      'Wringing and the tumble dryer',
      'A hot iron straight on the cloth',
      'Storing a worn piece unwashed',
    ],
  },

  ties: {
    name: 'Silk ties',
    forCloth: 'silk ties',
    feel: 'Rolled edges, a clean knot',
    texture: '/swatches/silk/LS-J16.webp',
    glance: [
      { icon: 'noWash', label: 'Do not wash' },
      { icon: 'noBleach', label: 'No bleach' },
      { icon: 'noTumble', label: 'No dryer' },
      { icon: 'noIron', label: 'No iron' },
      { icon: 'steamer', label: 'Steam, at a distance' },
      { icon: 'dryCleanP', label: 'Specialist cleaner' },
    ],
    rules: [
      'Untie the knot the way you tied it.',
      'Let it rest flat or rolled overnight.',
      'Never washed: spills go to a specialist cleaner.',
    ],
    washH: 'If something spills',
    washIntro: 'A silk tie is never washed. Act quickly, then let a specialist do the rest.',
    wash: [
      { icon: 'blot', title: 'Blot at once', body: 'Lift the spill with a clean white cloth or napkin. Dab; never rub.' },
      { icon: 'noSpray', title: 'No water', body: 'Don’t wet the spot or dab it with soda water: it leaves a ring on silk.' },
      { icon: 'dryCleanP', title: 'A specialist cleaner', body: 'Ask a cleaner who handles ties, and ask that the edges stay rolled, not pressed flat.' },
    ],
    dryH: 'After wearing',
    dry: [
      { icon: 'roll', text: 'After wearing, roll it loosely or lay it flat overnight.' },
      { icon: 'shade', text: 'Keep it away from sunlight, which fades the silk.' },
      { icon: 'rest', text: 'Rotate your ties; a rested tie keeps its shape.' },
    ],
    dryNever: 'Never washed, never wrung',
    heat: 0,
    heatLabel: 'No iron: steam only',
    press: [
      { icon: 'steamer', text: 'Hold a steamer a hand’s width away; let the steam do the work.' },
      { icon: 'shower', text: 'No steamer? Hang it in the bathroom during a hot shower.' },
      { icon: 'noIron', text: 'A flat iron crushes the rolled edges for good.' },
    ],
    wear: [
      { icon: 'tie', text: 'Untie the knot in reverse; pulling the narrow end through stretches the silk.' },
      { icon: 'perfume', text: 'Perfume first, tie second.' },
      { icon: 'rest', text: 'A tie worn every day needs a day off now and then.' },
    ],
    store: {
      method: 'roll',
      label: 'Rolled loosely in a drawer',
      tips: [
        { icon: 'roll', text: 'Rolled loosely from the narrow end, in a drawer.' },
        { icon: 'tie', text: 'Or draped over a tie rack, never on a hook by the loop.' },
        { icon: 'travel', text: 'Travelling: roll it and tuck it into a shoe or a case pocket.' },
      ],
    },
    keep: [
      'Untying in reverse',
      'Resting it rolled or flat',
      'Blotting a spill at once',
      'Steam from a distance',
      'A specialist tie cleaner',
    ],
    avoid: [
      'Washing, by hand or machine',
      'Pulling the narrow end through the knot',
      'Water or soda on a spot',
      'A hot iron',
      'Hanging it on a hook by the loop',
    ],
  },
};

/* ---------------- Stain first aid ---------------- */

export type StainKey = 'wine' | 'coffee' | 'oil' | 'makeup' | 'deodorant' | 'water';

export type StainDef = {
  key: StainKey;
  icon: IconName;
  label: string;
  /** Linen tolerates a cool rinse; silk, cashmere and ties do not. */
  linen: string[];
  delicate: string[];
};

const STAINS_EN: StainDef[] = [
  {
    key: 'wine',
    icon: 'wine',
    label: 'Red wine',
    linen: [
      'Blot at once with a clean white cloth. Don’t rub.',
      'Hold the stain under cold running water from the back, so it flushes out the way it came in.',
      'Then wash as usual, at 30 °C, before the stain has time to dry.',
    ],
    delicate: [
      'Blot at once with a clean white cloth. Don’t rub, and don’t add water.',
      'Let it dry as it is; no salt, no soda, no home remedies.',
      'Take it to a professional cleaner within a day or two and tell them it is wine.',
    ],
  },
  {
    key: 'coffee',
    icon: 'coffee',
    label: 'Coffee or tea',
    linen: [
      'Blot the spill straight away.',
      'Rinse cold from the back of the cloth.',
      'Wash at 30 °C with a mild detergent. Never hot: heat sets tannins.',
    ],
    delicate: [
      'Blot straight away with a clean, dry cloth.',
      'No water and no rubbing; both spread the mark on silk and cashmere.',
      'A professional cleaner, and tell them what it was.',
    ],
  },
  {
    key: 'oil',
    icon: 'oil',
    label: 'Oil or food',
    linen: [
      'Lift any food off with the back of a spoon.',
      'Cover the spot with cornflour or talc for an hour to draw the oil out, then brush it off.',
      'Wash as usual, cool. Oil left in can darken over time, so don’t wait.',
    ],
    delicate: [
      'Lift any food off with the back of a spoon.',
      'Cover the spot with cornflour or talc for an hour, then brush it off gently.',
      'A professional cleaner for whatever remains.',
    ],
  },
  {
    key: 'makeup',
    icon: 'makeup',
    label: 'Make-up',
    linen: [
      'Lift powder off by tapping the cloth, not by wiping.',
      'Dab foundation or lipstick with a drop of mild detergent on a damp white cloth, from the outside in.',
      'Rinse cool and wash as usual.',
    ],
    delicate: [
      'Shake or tap powder off; don’t wipe it in.',
      'For lipstick or foundation, leave it for a professional cleaner.',
      'Tip for next time: dress first, then make-up, with a scarf over the neckline.',
    ],
  },
  {
    key: 'deodorant',
    icon: 'deodorant',
    label: 'Deodorant',
    linen: [
      'Fresh white marks often brush off with a dry clean sock.',
      'Otherwise wash cool, inside out, soon after wearing.',
      'Let deodorant dry fully before dressing next time.',
    ],
    delicate: [
      'Fresh white marks: rub gently with a dry clean sock or a soft brush.',
      'Wash silk soon after; salts left in weaken the fibre at the underarm.',
      'Marks that stay are for a professional cleaner.',
    ],
  },
  {
    key: 'water',
    icon: 'droplet',
    label: 'Water marks',
    linen: [
      'Water doesn’t mark linen; let it dry and it will vanish.',
      'If a crease stays, iron while still damp.',
      'Nothing more needed.',
    ],
    delicate: [
      'A drop of water can leave a ring on silk. Don’t dab or rub it.',
      'Steam the whole panel evenly from a hand’s width; the ring usually blends away.',
      'If it stays, washing the whole piece evenly, or a cleaner, will lift it.',
    ],
  },
];

/* ---------------- The three cloths side by side ---------------- */

export type TableRow = { label: string; values: Record<ClothKey, string> };

const TABLE_EN: TableRow[] = [
  { label: 'Home washing', values: { silk: 'By hand, plain silk', linen: 'From the second wash', cashmere: 'By hand', ties: 'Never' } },
  { label: 'Machine', values: { silk: 'Delicate, 30 °C, mesh bag', linen: 'Gentle, 30 °C', cashmere: 'Wool cycle, 30 °C', ties: 'Never' } },
  { label: 'Detergent', values: { silk: 'pH-neutral, for silk', linen: 'Mild, no bleach', cashmere: 'Wool and cashmere wash', ties: '–' } },
  { label: 'Drying', values: { silk: 'Flat or padded hanger', linen: 'Wide hanger, shade', cashmere: 'Flat, away from heat', ties: 'Rolled or flat' } },
  { label: 'Iron', values: { silk: '• Low, dry, with a cloth', linen: '•• Medium, while damp', cashmere: '•• Wool, damp cloth', ties: 'None' } },
  { label: 'Steam', values: { silk: 'Yes, at a distance', linen: 'Yes', cashmere: 'Yes, on the reverse', ties: 'Yes, at a distance' } },
  { label: 'Storage', values: { silk: 'Padded hanger, cotton cover', linen: 'Wide hanger, loose fold', cashmere: 'Clip hanger, cedar', ties: 'Rolled, in a drawer' } },
  { label: 'Professional', values: { silk: 'Welcome; jacquard and brocade only', linen: 'For the first wash', cashmere: 'Welcome', ties: 'For any spill' } },
];

/* ---------------- Reading the symbols ---------------- */

export type SymbolFamily = { family: string; items: { icon: IconName; title: string; body: string }[] };

const SYMBOLS_EN: SymbolFamily[] = [
  {
    family: 'Washing',
    items: [
      { icon: 'wash30', title: '30 °C', body: 'Wash at up to 30 °C on a normal cycle.' },
      { icon: 'wash30Gentle', title: '30 °C, gentle', body: 'One bar under the tub: a gentle cycle, with a lower spin.' },
      { icon: 'wash30Wool', title: '30 °C, very gentle', body: 'Two bars: a very gentle cycle, such as wool or silk.' },
      { icon: 'washHand', title: 'Hand wash', body: 'Wash by hand, at up to 40 °C. LINSILK says 30 °C.' },
      { icon: 'noWash', title: 'Do not wash', body: 'No washing, by hand or machine.' },
    ],
  },
  {
    family: 'Bleaching',
    items: [
      { icon: 'bleachAny', title: 'Any bleach', body: 'Any bleaching agent may be used.' },
      { icon: 'noBleach', title: 'No bleach', body: 'No bleach of any kind. True for every LINSILK piece.' },
    ],
  },
  {
    family: 'Drying',
    items: [
      { icon: 'tumble', title: 'Tumble dry', body: 'The circle in a square means a tumble dryer may be used.' },
      { icon: 'noTumble', title: 'No tumble dryer', body: 'Never in the dryer. True for every LINSILK piece.' },
      { icon: 'lineDry', title: 'Line dry', body: 'Hang to dry on a line or hanger.' },
      { icon: 'dryFlat', title: 'Dry flat', body: 'Lay flat to dry, so the piece keeps its shape.' },
      { icon: 'dripDry', title: 'Drip dry', body: 'Hang while wet without spinning or wringing.' },
      { icon: 'dryFlatShade', title: 'Dry in shade', body: 'The corner line means: out of direct sun.' },
    ],
  },
  {
    family: 'Ironing',
    items: [
      { icon: 'iron1', title: 'Low', body: 'One dot: up to 110 °C. Silk; no steam.' },
      { icon: 'iron2', title: 'Medium', body: 'Two dots: up to 150 °C. Wool and cashmere, linen when damp.' },
      { icon: 'iron3', title: 'High', body: 'Three dots: up to 200 °C. Heavy linen and cotton.' },
      { icon: 'noIron', title: 'Do not iron', body: 'No iron. Steam from a distance instead, where allowed.' },
    ],
  },
  {
    family: 'Professional care',
    items: [
      { icon: 'dryCleanP', title: 'Dry clean (P)', body: 'A professional cleaner, with standard solvents. The letter is for the cleaner.' },
      { icon: 'dryCleanF', title: 'Dry clean (F)', body: 'A professional cleaner, with a mild solvent only.' },
      { icon: 'wetCleanW', title: 'Wet clean (W)', body: 'Professional wet cleaning with water.' },
      { icon: 'noDryClean', title: 'Do not dry clean', body: 'No professional dry cleaning.' },
    ],
  },
];

/* ---------------- Travel ---------------- */

export type TravelItem = { icon: IconName; title: string; body: string };

const TRAVEL_EN: TravelItem[] = [
  { icon: 'roll', title: 'Linen, rolled', body: 'Roll linen rather than folding it; it creases less, and a hanger in the bathroom does the rest.' },
  { icon: 'tissue', title: 'Silk, in tissue', body: 'Fold silk around a sheet of tissue paper and pack it on top, where nothing presses on it.' },
  { icon: 'steamer', title: 'Cashmere, on arrival', body: 'Hang cashmere pants by the hem as soon as you arrive; the steam of a shower settles them.' },
];

/* ---------------- Page words ---------------- */

const PAGE_EN = {
  metaTitle: 'Care for silk, linen and cashmere',
  description:
    'How to wash, dry, press and store LINSILK silk, linen and cashmere pieces and silk ties: the house care rules, step by step, with stain first aid and care symbols explained.',
  kicker: 'Care',
  title: 'So it stays as it arrived',
  lead: 'Silk, linen and cashmere are natural fibres: they breathe, soften and last when they are treated gently. Choose your cloth for its washing, drying, pressing and keeping.',
  chooseH: 'Choose your cloth',
  switcherLabel: 'Cloth',
  glanceH: 'At a glance',
  dryH: 'Drying',
  pressH: 'Pressing and steaming',
  heatCaption: 'Iron setting',
  steamDistance: 'a hand’s width',
  wearH: 'Wearing and refreshing',
  storeH: 'Keeping',
  keepH: 'Keep',
  avoidH: 'Avoid',
  stainsH: 'Stain first aid',
  stainsLead: 'Pick what happened. The steps follow the cloth you chose above.',
  stainsFor: 'For',
  stainsLinenFirst:
    'Linen that has not had its first professional clean yet: blot, then take it to the cleaner rather than washing it at home.',
  stainsStop:'When in doubt, stop and take it to a professional cleaner. A stain left alone is easier to remove than one that has been rubbed.',
  tableH: 'The cloths side by side',
  symbolsH: 'Reading care symbols',
  symbolsLead: 'Cleaners and washing machines speak in these symbols. Tap one to see what it means.',
  travelH: 'Travelling',
  helpH: 'Something we haven’t covered?',
  helpBody: 'Write to us about your piece, a stain or a question from your cleaner, and tell us which piece it is.',
  helpWrite: 'Write to us',
  helpContact: 'Contact page',
  print: 'Print this guide',
  more: 'More help',
  steam: 'Steam',
  methods: { padded: 'Padded hanger', wide: 'Wide hanger', clip: 'Clip hanger', roll: 'Rolled' },
  moreLinks: [
    ['/care/questions', 'Questions'],
    ['/care/shipping', 'Shipping'],
    ['/care/returns', 'Returns'],
    ['/care/measuring', 'Measurement guide'],
  ] as [string, string][],
  howTo: (cloth: string) => `How to wash ${cloth} from LINSILK`,
};

export type PageText = typeof PAGE_EN;

export type CareCopy = {
  CARE: Record<ClothKey, ClothCare>;
  STAINS: StainDef[];
  TABLE: TableRow[];
  SYMBOLS: SymbolFamily[];
  TRAVEL: TravelItem[];
  PAGE: PageText;
};

const EN: CareCopy = {
  CARE: CARE_EN,
  STAINS: STAINS_EN,
  TABLE: TABLE_EN,
  SYMBOLS: SYMBOLS_EN,
  TRAVEL: TRAVEL_EN,
  PAGE: PAGE_EN,
};

/* German and French are written natively in their own files, not translated
   from this one (CLAUDE.md, "Native writing in every language"). */
export const careCopy = (lang: Lang): CareCopy =>
  lang === 'de' ? CARE_DE : lang === 'fr' ? CARE_FR : EN;
