import { describe, expect, it } from 'vitest';
import type { Group, Piece } from './catalog';
import { pageBlocks, sectionsFor } from './collection-sections';

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
  sections.map((s) => [s.id, s.pieces.map((p) => p.name)]);

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
    expect(sections.map((s) => s.id)).toEqual(['dresses']);
    expect(sections.flatMap((s) => s.pieces)).toHaveLength(pieces.length);
  });

  /* One piece of every kind a group can carry. If a kind is ever placed in a
     section its group does not list, the piece vanishes from the page; this
     keeps that from happening silently. */
  it.each<[Group, Partial<Piece>[]]>([
    ['women', [
      { name: 'Silk gown' },
      { name: 'Silk midi dress' },
      { name: 'Silk midi skirt' },
      { name: 'Silk blouse' },
      { name: 'Linen waistcoat set', cloth: 'linen', lengthKinds: ['top', 'trouser'] },
      { name: 'Cashmere pants', cloth: 'cashmere', lengthKinds: ['trouser'] },
    ]],
    ['men', [
      { name: 'Linen shirt', cloth: 'linen', lengthKinds: ['top'] },
      { name: 'Linen pants', cloth: 'linen', lengthKinds: ['trouser'] },
      { name: 'Cashmere pants', cloth: 'cashmere', lengthKinds: ['trouser'] },
      { name: 'Linen set', cloth: 'linen', lengthKinds: ['top', 'skirt'] },
      { name: 'Silk tie', cloth: 'silk', noMeasurements: true },
    ]],
  ])('keeps every %s piece on the page', (group, samples) => {
    const pieces = samples.map((s) => piece(s.name ?? '', { group, ...s }));
    const blocks = pageBlocks(group, pieces, []);
    expect(blocks.flatMap((b) => b.pieces)).toHaveLength(pieces.length);
  });
});

describe('pageBlocks', () => {
  it('puts sleepwear last, after the sections, when there is any', () => {
    const main = [piece('gown', { name: 'Silk gown' })];
    const sleep = [piece('pj', { name: 'Silk pyjama set', sleep: true })];
    const blocks = pageBlocks('women', main, sleep);
    expect(blocks.map((b) => b.id)).toEqual(['dresses', 'sleepwear']);
    expect(blocks[1].pieces).toEqual(sleep);
  });

  it('has no sleepwear block when there are no sleep pieces', () => {
    const blocks = pageBlocks('women', [piece('gown', { name: 'Silk gown' })], []);
    expect(blocks.map((b) => b.id)).toEqual(['dresses']);
  });
});
