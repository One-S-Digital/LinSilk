/* The sections a collection page is divided into, in the order they read.
 *
 * A section is a garment type the shopper can recognise, so each page reads
 * as a range rather than one long grid. Sleepwear is not a section here: the
 * page sets it apart as its own block, from the sleep flag. */

import type { Group, Piece } from './catalog';
import { garmentType } from './garments';

export type Section = 'dresses' | 'skirts' | 'blouses' | 'linenSets' | 'shirts' | 'pants' | 'ties';

const ORDER: Record<Group, Section[]> = {
  women: ['dresses', 'skirts', 'blouses', 'linenSets', 'pants'],
  men: ['shirts', 'pants', 'linenSets', 'ties'],
};

const SECTION_OF: Partial<Record<ReturnType<typeof garmentType>, Section>> = {
  gown: 'dresses',
  dress: 'dresses',
  skirt: 'skirts',
  blouse: 'blouses',
  'linen-set': 'linenSets',
  shirt: 'shirts',
  trousers: 'pants',
  'cashmere-pants': 'pants',
  tie: 'ties',
};

/** The non-sleep pieces of a group, split into its sections in reading order.
    An empty section is left out. */
export function sectionsFor(group: Group, pieces: Piece[]) {
  return ORDER[group]
    .map((section) => ({
      section,
      pieces: pieces.filter((p) => SECTION_OF[garmentType(p)] === section),
    }))
    .filter((s) => s.pieces.length > 0);
}
