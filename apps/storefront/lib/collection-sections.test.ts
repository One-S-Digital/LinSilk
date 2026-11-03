import { describe, expect, it } from 'vitest';
import type { Piece } from './catalog';
import { sectionsFor } from './collection-sections';

const piece = (name: string, extra: Partial<Piece> = {}): Piece => ({
  id: name,
  slug: name,
  collection: 'autumn',
  group: 'women',
  name,
  material: '',
  cloth: 'silk',
  price: 0,
  shot: '',
  images: [],
  orderable: true,
  collectionTitle: 'Autumn',
  ...extra,
});

const titles = (sections: ReturnType<typeof sectionsFor>) =>
  sections.map((s) => [s.section, s.pieces.map((p) => p.name)]);

describe('sectionsFor', () => {
  it('splits a women’s page into dresses, skirts, blouses, linen sets and pants, in that order', () => {
    const sections = sectionsFor('women', [
      piece('blouse', { name: 'Silk ruffle-front blouse' }),
      piece('linen', { name: 'Linen waistcoat set', cloth: 'linen', lengthKinds: ['top', 'trouser'] }),
      piece('pants', { name: 'Cashmere pants', cloth: 'cashmere', lengthKinds: ['trouser'] }),
      piece('skirt', { name: 'Silk bias-cut midi skirt' }),
      piece('gown', { name: 'Silk cowl halter gown' }),
    ]);
    expect(titles(sections)).toEqual([
      ['dresses', ['Silk cowl halter gown']],
      ['skirts', ['Silk bias-cut midi skirt']],
      ['blouses', ['Silk ruffle-front blouse']],
      ['linenSets', ['Linen waistcoat set']],
      ['pants', ['Cashmere pants']],
    ]);
  });

  it('splits a men’s page into shirts, pants, linen sets and ties', () => {
    const sections = sectionsFor('men', [
      piece('tie', { group: 'men', name: 'Silk tie', cloth: 'silk', noMeasurements: true }),
      piece('shirt', { group: 'men', name: 'Linen spread-collar shirt', cloth: 'linen', lengthKinds: ['top'] }),
      piece('trousers', { group: 'men', name: 'Linen pleated trousers', cloth: 'linen', lengthKinds: ['trouser'] }),
      piece('set', { group: 'men', name: 'Linen shirt and shorts set', cloth: 'linen', lengthKinds: ['top', 'skirt'] }),
      piece('cashmere', { group: 'men', name: 'Cashmere drawstring pants', cloth: 'cashmere', lengthKinds: ['trouser'] }),
    ]);
    expect(titles(sections)).toEqual([
      ['shirts', ['Linen spread-collar shirt']],
      ['pants', ['Linen pleated trousers', 'Cashmere drawstring pants']],
      ['linenSets', ['Linen shirt and shorts set']],
      ['ties', ['Silk tie']],
    ]);
  });

  it('leaves out an empty section and keeps every piece in exactly one', () => {
    const pieces = [
      piece('gown', { name: 'Silk gown' }),
      piece('gown2', { name: 'Silk halter dress' }),
    ];
    const sections = sectionsFor('women', pieces);
    expect(sections.map((s) => s.section)).toEqual(['dresses']);
    expect(sections.flatMap((s) => s.pieces)).toHaveLength(pieces.length);
  });
});
