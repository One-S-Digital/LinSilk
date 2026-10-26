import { describe, expect, it } from 'vitest';
import type { Piece } from './catalog';
import { slugify } from './catalog';
import { garmentType, imageAlt, QUESTIONS } from './garments';
import { productLd } from './jsonld';

const p = (name: string, over: Partial<Piece> = {}) =>
  ({ name, group: 'women', cloth: 'silk', ...over }) as Piece;

describe('slugify', () => {
  it('reads the public title into an address', () => {
    expect(slugify('Silk cowl halter gown')).toBe('silk-cowl-halter-gown');
    expect(slugify('Silk three-piece set: kimono robe, cami and shorts')).toBe(
      'silk-three-piece-set-kimono-robe-cami-and-shorts',
    );
    expect(slugify('Robe à col bénitier')).toBe('robe-a-col-benitier');
  });
});

describe('garmentType', () => {
  it('reads the kind of garment from what the catalogue knows', () => {
    expect(garmentType(p('Silk cowl halter gown'))).toBe('gown');
    expect(garmentType(p('Silk wrap shirt dress'))).toBe('dress');
    expect(garmentType(p('Silk bias-cut midi skirt'))).toBe('skirt');
    expect(garmentType(p('Silk ruffle-front blouse'))).toBe('blouse');
    expect(garmentType(p('Linen shirt and wide-leg trousers set', { cloth: 'linen' }))).toBe('linen-set');
    expect(garmentType(p('Silk slip mini dress', { sleep: true }))).toBe('sleepwear');
    expect(garmentType(p('Linen popover shirt', { group: 'men', cloth: 'linen', lengthKinds: ['top'] }))).toBe('shirt');
    expect(garmentType(p('Linen gurkha trousers', { group: 'men', cloth: 'linen', lengthKinds: ['trouser'] }))).toBe('trousers');
    expect(
      garmentType(p('Linen camp-collar shirt and shorts set', { group: 'men', cloth: 'linen', lengthKinds: ['top', 'trouser'] })),
    ).toBe('linen-set');
  });

  it('never repeats the same question set across kinds', () => {
    const sets = Object.values(QUESTIONS).map((qs) => qs.map((q) => q.q).join('|'));
    expect(new Set(sets).size).toBe(sets.length);
  });
});

describe('imageAlt', () => {
  it('names the view from the pipeline file name, never a colour', () => {
    const gown = p('Silk cowl halter gown');
    expect(imageAlt(gown, 'https://files.bylinsilk.com/LINSILK_004_02_UPPER-01M4GTB8EW7W9HBPQJ7P0EMTBN.jpg', 1)).toBe(
      'Woman wearing a made-to-measure silk cowl halter gown, upper body detail',
    );
    expect(imageAlt(gown, '/images/other.webp', 2)).toBe(
      'Woman wearing a made-to-measure silk cowl halter gown, view 3',
    );
  });
});

describe('productLd', () => {
  const piece = {
    ...p('Silk cowl halter gown'),
    id: '004',
    slug: 'silk-cowl-halter-gown',
    price: 319,
    images: [],
    orderable: true,
  } as Piece;

  it('offers a made-to-order piece in whole francs at its slug address', () => {
    const ld = productLd(piece) as { offers: { price: string; availability: string; url: string; shippingDetails?: unknown } };
    expect(ld.offers.price).toBe('319');
    expect(ld.offers.availability).toBe('https://schema.org/MadeToOrder');
    expect(ld.offers.url).toBe('https://bylinsilk.com/piece/silk-cowl-halter-gown');
    /* No shipping rate is confirmed yet, so none is published. */
    expect(ld.offers.shippingDetails).toBeUndefined();
  });

  it('offers nothing for a retired or closed piece', () => {
    expect('offers' in productLd({ ...piece, retired: true })).toBe(false);
    expect('offers' in productLd({ ...piece, orderable: false })).toBe(false);
  });
});
