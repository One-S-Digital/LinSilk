import { describe, expect, it } from 'vitest';
import type { Piece } from './catalog';
import { bodyZonesFor, garmentZonesFor } from './catalog';
import { CATEGORY, QUESTIONS, garmentType, imageAlt } from './garments';
import { coloursOf, fibre } from './house';
import { productLd } from './jsonld';
import { pieceName } from './piece-names';

const base: Piece = {
  id: 'c1', slug: 'x', collection: 'autumn-iv', group: 'women', name: 'Cashmere high-waist wide-leg pants',
  material: '', cloth: 'cashmere', price: 169, shot: '', images: [], orderable: true, collectionTitle: 'Autumn',
  lengthKinds: ['trouser'],
};
const tie: Piece = {
  ...base, id: 't1', group: 'men', name: 'Silk tie', cloth: 'silk', price: 65, lengthKinds: undefined,
  noMeasurements: true, swatches: ['LS-S01', 'LS-S02', 'LS-S03'],
};

describe('cashmere pants', () => {
  it('are their own kind for women and for men, with their own questions', () => {
    expect(garmentType(base)).toBe('cashmere-pants');
    expect(garmentType({ ...base, group: 'men' })).toBe('cashmere-pants');
    const text = JSON.stringify(QUESTIONS['cashmere-pants']);
    expect(text).not.toMatch(/linen|silk/i);
    expect(text).toContain('cashmere');
  });

  it('keep the pants sheet: no upper body', () => {
    const keys = bodyZonesFor(base).map((z) => z.key);
    expect(keys).not.toContain('neck');
    expect(keys).toContain('rise');
    expect(garmentZonesFor(base)).toHaveLength(1);
  });

  it('say cashmere, with no percentage until the composition is confirmed', () => {
    expect(fibre('cashmere')).toBe('cashmere');
    expect(fibre('silk')).toBe('100% silk');
    expect(coloursOf(base)).toBe(12);
    const ld = productLd(base);
    expect(ld.material).toBe('Cashmere');
    expect(ld.description).toContain('made to measure in cashmere');
    expect(ld.description).not.toContain('100%');
  });

  it('are called pants everywhere', () => {
    expect(CATEGORY.trousers.label).toBe('Pants');
    expect(pieceName('Cashmere pressed straight pants', 'de')).toBe('Gerade Kaschmirhose mit Bügelfalte');
    /* A title not yet renamed in the catalogue still finds its translation. */
    expect(pieceName('Linen gurkha trousers', 'fr')).toBe(pieceName('Linen gurkha pants', 'fr'));
  });
});

describe('a tie', () => {
  it('is its own kind, asks for no sheet and is not made to measure', () => {
    expect(garmentType(tie)).toBe('tie');
    expect(bodyZonesFor(tie)).toEqual([]);
    expect(garmentZonesFor(tie)).toEqual([]);
    const ld = productLd(tie);
    expect(ld.description).toContain('ordered by colour alone');
    expect(ld.description).not.toContain('made to measure');
    expect(coloursOf(tie)).toBe(3);
  });

  it('describes its photographs as a tie, not a model', () => {
    expect(imageAlt(tie, 'https://f.test/LINSILK_075_05_BACK-AB12.jpg', 0)).toBe(
      'Silk tie, back of the tie with the LINSILK label',
    );
    expect(imageAlt(tie, 'https://f.test/LINSILK_075_02_ANGLE_ROLL-AB12.jpg', 1)).toBe(
      'Silk tie, rolled tie, angled view',
    );
  });
});
