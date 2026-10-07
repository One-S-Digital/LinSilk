/* The house's colour library, one list for each cloth.
 *
 * Nothing here is sold by colour: a piece is made in silk or in linen, and the
 * client chooses the colour from that cloth's swatches. So the library is
 * keyed by cloth, and a piece offers only its own. There is no satin: the
 * silks are silks, whatever the weave — plain, jacquard or brocade.
 *
 * The key is the library code the bench uses (LS-S silk plain, LS-J jacquard,
 * LS-B brocade, LS-L linen). It travels on the order line, so a swatch keeps
 * its code when its name or its photograph changes. Photographs are the
 * library's clean renders, resized, in public/swatches/<cloth>/.
 */

import type { Cloth } from './catalog';

export type Swatch = {
  key: string;
  cloth: Cloth;
  /** The colour's own name, without the cloth: 'Cobalt'. */
  name: string;
  /** Silk only: the weave the colour comes in. */
  group?: string;
  /** The photograph of the cloth. */
  image: string;
};

const silk = (prefix: string, group: string, rows: [string, string][]): Swatch[] =>
  rows.map(([code, name]) => ({
    key: `LS-${prefix}${code}`,
    cloth: 'silk',
    name,
    group,
    image: `/swatches/silk/LS-${prefix}${code}.webp`,
  }));

const SILK: Swatch[] = [
  ...silk('S', 'Plain', [
    ['01', 'Silver Lilac'], ['02', 'Cobalt'], ['03', 'Olive'], ['04', 'Navy'], ['05', 'Crimson'],
    ['06', 'Black'], ['07', 'Champagne'], ['08', 'Vermilion'], ['09', 'Ivory'], ['10', 'Sky'],
    ['11', 'Chocolate'], ['12', 'Burgundy'], ['13', 'Aubergine'], ['14', 'Powder Blue'], ['15', 'Caramel'],
  ]),
  ...silk('J', 'Jacquard', [
    ['01', 'Emerald Rose'], ['02', 'Lime Rose'], ['03', 'Aqua Mist'], ['04', 'Peacock Rose'],
    ['05', 'Royal Rose'], ['06', 'Mint Floral'], ['07', 'Teal Ring'], ['08', 'Apple Green'],
    ['09', 'Peach Rose'], ['10', 'Cobalt Dragon'], ['11', 'Apricot Lantern'], ['12', 'Electric Blue Scroll'],
    ['13', 'Hot Pink'], ['14', 'Black Dragon'], ['15', 'Periwinkle Paisley'], ['16', 'Pearl Paisley'],
    ['17', 'White Dragon'], ['18', 'Raspberry Lantern'], ['19', 'Midnight Dragon'], ['20', 'Deep Teal'],
  ]),
  ...silk('B', 'Brocade', [
    ['01', 'Slate Gold Dragon'], ['02', 'Crimson Phoenix'], ['03', 'Olive Gold Dragon'],
    ['04', 'Turquoise Gold Dragon'], ['05', 'Stone Gold Dragon'], ['06', 'Mist Gold Lantern'],
    ['07', 'Sunflower Lantern'], ['08', 'Coral Sky Lantern'], ['09', 'Emerald Magenta Leaf'],
    ['10', 'Violet Red Lantern'], ['11', 'Slate Silver Dragon'], ['12', 'Plum Magenta Lantern'],
    ['13', 'Champagne Gold Dragon'],
  ]),
];

const LINEN: Swatch[] = (
  [
    ['01', 'White'], ['02', 'Ivory'], ['03', 'Off-White Slub'], ['04', 'Oatmeal'],
    ['05', 'Sand'], ['06', 'Pale Stone'], ['07', 'Light Grey'], ['08', 'Charcoal'],
    ['09', 'Black'], ['10', 'Ink Navy'], ['11', 'Navy'], ['12', 'Marine Blue'],
    ['13', 'Royal Blue'], ['14', 'Azure'], ['15', 'Cornflower'], ['16', 'Denim'],
    ['17', 'Turquoise'], ['18', 'Petrol Teal'], ['19', 'Slate Violet'], ['20', 'Pine Green'],
    ['21', 'Sage'], ['22', 'Jade'], ['23', 'Moss Green'], ['24', 'Olive'],
    ['25', 'Khaki'], ['26', 'Mustard'], ['27', 'Ochre'], ['28', 'Amber'],
    ['29', 'Camel'], ['30', 'Rust'], ['31', 'Walnut'], ['32', 'Cocoa'],
    ['33', 'Umber'], ['34', 'Mocha Taupe'], ['35', 'Chocolate'], ['36', 'Espresso'],
    ['37', 'Red'], ['38', 'Dusty Rose'], ['39', 'Burgundy'], ['40', 'Blush Lilac'],
  ] as [string, string][]
).map(([code, name]) => ({
  key: `LS-L${code}`,
  cloth: 'linen' as const,
  name,
  image: `/swatches/linen/LS-L${code}.webp`,
}));

export const SWATCHES: Record<Cloth, Swatch[]> = { silk: SILK, linen: LINEN };

export const swatchesFor = (cloth: Cloth) => SWATCHES[cloth];

export const findSwatch = (cloth: Cloth, key: string) =>
  SWATCHES[cloth].find((s) => s.key === key);

/** What the order line, the cart and the bench call the cloth: 'Cobalt silk'. */
export const swatchLabel = (swatch: Swatch) => `${swatch.name} ${swatch.cloth}`;

export const CLOTH_NAME: Record<Cloth, string> = { silk: 'Silk', linen: 'Linen' };
