import { describe, expect, it } from 'vitest';
import type { Piece } from './catalog';
import { googleFeed, inFeed, openaiFeed } from './feed';

const piece = (over: Partial<Piece> = {}): Piece => ({
  id: '004',
  slug: 'silk-cowl-halter-gown',
  collection: 'autumn-iv',
  group: 'women',
  name: 'Silk cowl halter gown',
  material: '',
  cloth: 'silk',
  price: 319,
  shot: '',
  images: ['https://files.bylinsilk.com/LINSILK_004_01_FULL_FRONT-X.jpg', 'https://files.bylinsilk.com/b.jpg'],
  orderable: true,
  collectionTitle: 'Autumn — Collection IV',
  ...over,
});

describe('googleFeed', () => {
  const xml = googleFeed([piece(), piece({ id: '005', retired: true })]);

  it('quotes the live whole-franc price and the slug address', () => {
    expect(xml).toContain('<g:price>319.00 CHF</g:price>');
    expect(xml).toContain('https://bylinsilk.com/piece/silk-cowl-halter-gown?utm_source=google&amp;utm_medium=feed');
  });

  it('says made to measure and never a colour or satin', () => {
    expect(xml).toContain('<g:title>Silk cowl halter gown, made to measure</g:title>');
    expect(xml).not.toMatch(/satin|g:color/i);
  });

  it('leaves out a retired piece', () => {
    expect(xml).not.toContain('<g:id>005</g:id>');
  });
});

describe('inFeed', () => {
  it('needs a price, a photograph, a cloth and an open collection', () => {
    expect(inFeed(piece())).toBe(true);
    expect(inFeed(piece({ price: 0 }))).toBe(false);
    expect(inFeed(piece({ images: [] }))).toBe(false);
    expect(inFeed(piece({ cloth: null }))).toBe(false);
    expect(inFeed(piece({ orderable: false }))).toBe(false);
  });
});

describe('openaiFeed', () => {
  const lines = openaiFeed([piece(), piece({ id: '005', retired: true })]).trim().split('\n');

  it('is one JSON record per line, retired pieces left out', () => {
    expect(lines).toHaveLength(1);
    const r = JSON.parse(lines[0]);
    expect(r.item_id).toBe('004');
    expect(r.price).toBe('319.00 CHF');
    expect(r.availability).toBe('in_stock');
  });

  it('carries every required discovery field, search only', () => {
    const r = JSON.parse(lines[0]);
    for (const k of ['item_id', 'title', 'description', 'url', 'brand', 'seller_name', 'image_url', 'availability', 'price']) {
      expect(r[k]).toBeTruthy();
    }
    expect(r.is_eligible_checkout).toBe(false);
    expect(JSON.stringify(r)).not.toMatch(/satin|"color"/i);
  });
});
