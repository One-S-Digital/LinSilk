/* The blocks a collection page is divided into, in the order they read.
 *
 * A section is a garment type the shopper can recognise, so each page reads
 * as a range rather than one long grid. Sleepwear is the last block, set apart
 * by the sleep flag. The jump links and the blocks come from one list, so a
 * block cannot appear without its link, or the other way round. */

import type { Group, Piece } from './catalog';
import { garmentType, type GarmentType } from './garments';

export type Section = 'dresses' | 'skirts' | 'blouses' | 'linenSets' | 'shirts' | 'pants' | 'ties';

export type Block = { id: Section | 'sleepwear'; pieces: Piece[] };

const ORDER: Record<Group, Section[]> = {
  women: ['dresses', 'skirts', 'blouses', 'linenSets', 'pants'],
  men: ['shirts', 'pants', 'linenSets', 'ties'],
};

/* Every garment type has a home, so a new type is a compile error here until
   it is placed, rather than a piece that is quietly left off the page. */
const SECTION_OF: Record<GarmentType, Section | 'sleepwear'> = {
  gown: 'dresses',
  dress: 'dresses',
  skirt: 'skirts',
  blouse: 'blouses',
  'linen-set': 'linenSets',
  shirt: 'shirts',
  trousers: 'pants',
  'cashmere-pants': 'pants',
  tie: 'ties',
  sleepwear: 'sleepwear',
};

/** The non-sleep pieces of a group, split into its sections in reading order.
    An empty section is left out. */
export function sectionsFor(group: Group, pieces: Piece[]): Block[] {
  return ORDER[group]
    .map((section) => ({
      id: section,
      pieces: pieces.filter((p) => SECTION_OF[garmentType(p)] === section),
    }))
    .filter((s) => s.pieces.length > 0);
}

/** Every block a page shows: the sections, then sleepwear if there is any. */
export function pageBlocks(group: Group, main: Piece[], sleep: Piece[]): Block[] {
  const blocks = sectionsFor(group, main);
  return sleep.length > 0 ? [...blocks, { id: 'sleepwear', pieces: sleep }] : blocks;
}
