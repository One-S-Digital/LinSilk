/* Category and occasion pages: one page per search cluster
 * (docs/seo/SEO-GEO-PLAN.md §5, copy in docs/seo/COPY-PAGES.md §3). Each
 * picks its pieces from the open collection by garment type, and quotes its
 * price range from those pieces, so a price change reaches the copy without
 * anyone retyping it. */

import { money, type Group, type Piece } from './catalog';
import { garmentType, type QA } from './garments';
import { COLOURS } from './house';

export type Range = { from: number; to: number } | null;

export type Edit = {
  path: string;
  /** Title tag, before the " | LINSILK" suffix. */
  title: string;
  h1: string;
  description: (r: Range) => string;
  intro: (r: Range) => string;
  sections: { h2: string; body: string }[];
  faqs: QA[];
  pick: (p: Piece) => boolean;
  crumb: { name: string; path: string }[];
};

const from = (r: Range) => (r ? ` From ${money(r.from)}.` : '');
const span = (r: Range) =>
  !r ? '' : r.from === r.to ? `, ${money(r.from)}` : `, from ${money(r.from)} to ${money(r.to)}`;

const isWomen = (p: Piece) => p.group === 'women' && !p.sleep;

const LEAD_TIME_QA: QA = {
  q: 'How long does it take?',
  a: '2–4 weeks from your confirmed measurement sheet, plus delivery: 2–3 days in Switzerland, 3–6 days to the EU and UK, and 5–10 days elsewhere once dispatched from Geneva.',
};

const LINEN_HEAT_QA: QA = {
  q: 'Is linen good for hot weather?',
  a: 'Yes. Linen is crisp, airy and cooling; it breathes in the heat and softens with every wear.',
};

const CREASE_QA: QA = {
  q: 'Does linen crease?',
  a: 'Yes. Natural linen creases, softens and ages with wear; that is the cloth, not a fault.',
};

export const EDITS: Record<string, Edit> = {
  'women/silk': {
    path: '/collection/women/silk',
    title: 'Silk dresses and gowns, made to measure',
    h1: 'Silk dresses and gowns, made to measure',
    description: (r) =>
      `Silk dresses and gowns made to your measurements in 2–4 weeks. Wrap, slip, halter and floor-length evening styles in ${COLOURS.silk} silk colours.${from(r)}`,
    intro: (r) =>
      `These are LINSILK’s silk dresses and gowns, each cut and sewn to your own measurements in 2–4 weeks in 100% silk. Wrap dresses, slip dresses, halter and floor-length evening gowns come in ${COLOURS.silk} silk colours${span(r)}.`,
    sections: [
      {
        h2: 'Choose by occasion',
        body: 'Evening and gala: the halter, cowl and high-neck gowns, floor-length with slits. Wedding guest: the wrap, midi and flutter-sleeve dresses. Long sleeves and full length: the long-sleeve wrap maxi dress.',
      },
      {
        h2: 'Why silk',
        body: 'Pure silk is smooth and light, drapes without clinging, and keeps you comfortable when it is warm or cool. Every dress here is made in 100% silk.',
      },
    ],
    faqs: [
      {
        q: 'What is a made-to-measure silk dress?',
        a: `A silk dress cut and sewn to your own measurements instead of a standard size. At LINSILK you enter fifteen measurements, choose one of ${COLOURS.silk} silk colours, and the dress is made for you in 2–4 weeks.`,
      },
      LEAD_TIME_QA,
      {
        q: 'Which silk dress suits a wedding guest?',
        a: 'The wrap, midi and flutter-sleeve dresses suit most weddings; the halter and high-neck gowns suit black tie. Order about six weeks ahead.',
      },
    ],
    pick: (p) => isWomen(p) && p.cloth === 'silk' && ['gown', 'dress'].includes(garmentType(p)),
    crumb: [
      { name: 'Collection', path: '/collection' },
      { name: 'Women', path: '/collection/women' },
    ],
  },

  'women/silk-separates': {
    path: '/collection/women/silk-separates',
    title: 'Silk midi skirts and blouses, made to measure',
    h1: 'Silk skirts and blouses, made to measure',
    description: (r) =>
      `Bias-cut silk skirts and silk blouses, made to your measurements in 2–4 weeks. 100% silk, ${COLOURS.silk} colours.${from(r)}`,
    intro: (r) =>
      `LINSILK’s silk midi and maxi skirts are cut on the bias, and its silk blouses come with a ruffle front or a mock neck; each is cut and sewn to your measurements in 2–4 weeks, in 100% silk and ${COLOURS.silk} silk colours${span(r)}.`,
    sections: [
      {
        h2: 'Cut on the bias',
        body: 'A bias-cut skirt is cut diagonally across the weave, so the silk falls and moves with you rather than hanging straight.',
      },
    ],
    faqs: [
      {
        q: 'Which measurements does a skirt need?',
        a: 'Only the waist, the hip and the hip depth, plus the skirt length from your natural waist to where you want the hem to fall.',
      },
      LEAD_TIME_QA,
    ],
    pick: (p) => isWomen(p) && ['skirt', 'blouse'].includes(garmentType(p)),
    crumb: [
      { name: 'Collection', path: '/collection' },
      { name: 'Women', path: '/collection/women' },
    ],
  },

  'women/linen': {
    path: '/collection/women/linen',
    title: 'Linen two-piece sets for women, made to measure',
    h1: 'Linen two-piece sets for women, made to measure',
    description: (r) =>
      `Women’s linen waistcoat, vest and trouser sets, made to your measurements in 2–4 weeks. 100% linen, ${COLOURS.linen} colours.${from(r)}`,
    intro: (r) =>
      `LINSILK’s women’s linen sets pair a waistcoat, vest or top with trousers, each cut and sewn to your measurements in 2–4 weeks. They are made in 100% linen and come in ${COLOURS.linen} linen colours${span(r)}.`,
    sections: [
      {
        h2: 'For warm days and travel',
        body: 'Linen is crisp, airy and cooling; it breathes in heat and softens with every wear. Natural creasing is part of the cloth.',
      },
      {
        h2: 'Two garments, one order',
        body: 'A set is two garments on one order, each with its own length on the same measurement sheet.',
      },
    ],
    faqs: [LINEN_HEAT_QA, CREASE_QA, LEAD_TIME_QA],
    pick: (p) => isWomen(p) && garmentType(p) === 'linen-set',
    crumb: [
      { name: 'Collection', path: '/collection' },
      { name: 'Women', path: '/collection/women' },
    ],
  },

  sleepwear: {
    path: '/collection/sleepwear',
    title: 'Silk pyjamas and robes, made to measure',
    h1: 'Silk pyjamas, robes and slip dresses, made to measure',
    description: (r) =>
      `Silk pyjama sets, robes and slip dresses made to your measurements in 2–4 weeks. A personal gift${r ? `, from ${money(r.from)}` : ''}. For the holidays, confirm measurements by 17 Nov.`,
    intro: (r) =>
      `LINSILK’s silk sleepwear is made to your measurements in 2–4 weeks, in 100% silk. Pyjama sets, a long wrap robe with slip dress, a three-piece kimono set and a slip mini dress come in ${COLOURS.silk} silk colours${span(r)}.`,
    sections: [
      {
        h2: 'Giving it as a gift',
        body: 'A made-to-measure gift needs the recipient’s measurements: send them the measuring guide, or order for yourself with a gift note. For delivery before the holidays, confirm the measurement sheet by 20 November in Switzerland, 17 November in the EU and UK, and 13 November for the UAE and the rest of the world.',
      },
      {
        h2: 'Why silk to sleep in',
        body: 'Silk is smooth, breathes, and keeps you comfortable when the night is warm or cool.',
      },
    ],
    faqs: [
      {
        q: 'Is a silk pyjama set a good gift?',
        a: 'Yes, with one caveat: it is made to measure, so the recipient’s measurements are needed. Send them the measuring guide, or ask them to take the fifteen measurements with any tailor.',
      },
      LEAD_TIME_QA,
    ],
    pick: (p) => Boolean(p.sleep),
    crumb: [{ name: 'Collection', path: '/collection' }],
  },

  'men/shirts': {
    path: '/collection/men/shirts',
    title: 'Linen shirts for men, made to measure',
    h1: 'Linen shirts for men, made to measure',
    description: (r) =>
      `Men’s linen shirts: camp-collar, spread-collar, band-collar, wrap and popover. Made to your measurements in 2–4 weeks.${from(r)}`,
    intro: (r) =>
      `LINSILK’s men’s linen shirts are cut and sewn to your own measurements in 2–4 weeks, in 100% linen. Choose camp-collar, spread-collar, band-collar, wrap or popover styles in ${COLOURS.linen} linen colours${span(r)}.`,
    sections: [
      {
        h2: 'Linen for heat and travel',
        body: 'Linen breathes, so a linen shirt stays airy in warm weather and softens with every wash.',
      },
      {
        h2: 'Made to measure, not a size',
        body: 'Your shirt follows your shoulder, chest, sleeve and length measurements, not the nearest S, M or L.',
      },
    ],
    faqs: [
      {
        q: 'Can I order a linen shirt made to measure online?',
        a: 'Yes. Choose the shirt, choose its colour from the linen swatches, enter your measurements, and it is cut and sewn for you in 2–4 weeks.',
      },
      LINEN_HEAT_QA,
      CREASE_QA,
    ],
    pick: (p) => p.group === 'men' && garmentType(p) === 'shirt',
    crumb: [
      { name: 'Collection', path: '/collection' },
      { name: 'Men', path: '/collection/men' },
    ],
  },

  'men/trousers': {
    path: '/collection/men/trousers',
    title: 'Linen trousers and full looks for men, made to measure',
    h1: 'Linen trousers and full looks for men, made to measure',
    description: (r) =>
      `Pleated, straight, wide-leg and gurkha linen trousers and full linen looks for men, made to your measurements in 2–4 weeks. 100% linen.${from(r)}`,
    intro: (r) =>
      `LINSILK makes men’s linen trousers, pleated, straight, wide-leg and gurkha, and linen two-piece looks, each cut and sewn to your measurements in 2–4 weeks, in 100% linen and ${COLOURS.linen} colours${span(r)}.`,
    sections: [
      {
        h2: 'Summer weddings and holidays',
        body: 'A full linen look for a summer wedding is a shirt and trousers ordered together, each to your measurements.',
      },
    ],
    faqs: [
      {
        q: 'How do I choose the trouser length?',
        a: 'Measure from your natural waist down the outside of the leg to where you want the hem to fall, without shoes.',
      },
      CREASE_QA,
      LEAD_TIME_QA,
    ],
    pick: (p) => p.group === 'men' && ['trousers', 'linen-set'].includes(garmentType(p)),
    crumb: [
      { name: 'Collection', path: '/collection' },
      { name: 'Men', path: '/collection/men' },
    ],
  },

  'wedding-guest': {
    path: '/occasion/wedding-guest',
    title: 'Wedding guest dresses in silk, made to measure',
    h1: 'Wedding guest dresses in silk, made to measure',
    description: (r) =>
      `Wedding-guest dresses in 100% silk, made to your measurements. Order 6 weeks ahead in Europe: 2–4 weeks to make, plus delivery.${from(r)}`,
    intro: () =>
      `A silk dress made to your measurements suits the day: it moves, it breathes through a long ceremony, and it is ready in 2–4 weeks from your confirmed sheet. Order about six weeks before a wedding in Europe, or eight weeks before one further away, and choose from LINSILK’s wrap, midi and flutter-sleeve dresses in ${COLOURS.silk} silk colours.`,
    sections: [
      {
        h2: 'Timing',
        body: 'Making takes 2–4 weeks from your confirmed measurements; delivery is 2–3 days within Switzerland, 3–6 days to the EU and UK, and 5–10 days elsewhere, once dispatched.',
      },
      {
        h2: 'By dress code',
        body: 'Black tie: the silk halter and high-neck gowns. Cocktail: the midi wrap and flutter-sleeve dresses. Daytime and garden: a silk midi skirt with a silk blouse.',
      },
      {
        h2: 'Making it yours',
        body: 'Choose from plain, jacquard or brocade silks, and set the length yourself with your own length measurement.',
      },
    ],
    faqs: [
      {
        q: 'What should a guest wear to a wedding?',
        a: 'A dress that suits the dress code and the season, in a cloth that breathes through a long day. Silk midi and wrap dresses suit most weddings, and silk gowns suit black tie.',
      },
      {
        q: 'Is silk comfortable in summer heat?',
        a: 'Yes. Silk breathes and rests lightly on the skin, and it keeps you comfortable when the temperature drops as well as when it rises.',
      },
      {
        q: 'Can I order six weeks before the date?',
        a: 'Yes, in Europe: 2–4 weeks to make from your confirmed sheet, then 2–6 days to arrive. Allow eight weeks for a wedding further away.',
      },
    ],
    pick: (p) => isWomen(p) && p.cloth === 'silk' && garmentType(p) === 'dress',
    crumb: [{ name: 'Collection', path: '/collection' }],
  },
};

/** The /collection/[group]/[edit] routes, as params. */
export const GROUP_EDITS: { group: Group; edit: string }[] = [
  { group: 'women', edit: 'silk' },
  { group: 'women', edit: 'silk-separates' },
  { group: 'women', edit: 'linen' },
  { group: 'men', edit: 'shirts' },
  { group: 'men', edit: 'trousers' },
];

export const EDIT_PATHS = Object.values(EDITS).map((e) => e.path);
