import { afterEach, describe, expect, it, vi } from 'vitest';
import { byGroup, currentCollection, getCollections, getPieces, piecesIn } from './catalog';

/* The catalogue is now a translation of what Medusa returns, and the
   translation is where it can go wrong: a season the house has not opened
   leaking into the shop, a commission product appearing on a collection page,
   a piece sorting into the wrong place once a season passes nine designs. */

const collection = (handle: string, metadata: Record<string, unknown>) => ({
  handle,
  title: `${metadata.season} — Collection ${metadata.number}`,
  metadata,
});

const product = (
  handle: string,
  collectionHandle: string,
  metadata: Record<string, unknown> = {},
  extra: Record<string, unknown> = {},
) => ({
  handle,
  title: `Piece ${handle}`,
  subtitle: 'Sand silk twill',
  metadata: { group: 'women', shot: 'stone doorway', ...metadata },
  collection: { handle: collectionHandle },
  variants: [{ calculated_price: { calculated_amount: 1980 } }],
  ...extra,
});

const BACKEND = {
  regions: [{ id: 'reg_ch', name: 'Switzerland' }, { id: 'reg_eu', name: 'Europe' }],
  collections: [
    collection('autumn-iv', { status: 'current', season: 'Autumn', number: 4, note: 'Sand silk.', closes: 'February' }),
    collection('winter-i', { status: 'past', season: 'Winter', number: 1, note: 'Burgundy crepe.' }),
    /* Neither is a season: one holds quoted commissions, one holds the
       opening figures for Design Your Own. */
    { handle: 'commissions', title: 'Commissions', metadata: { status: 'commission' } },
    { handle: 'silhouettes', title: 'Commission silhouettes', metadata: { status: 'silhouettes' } },
  ],
  products: [
    product('w10', 'autumn-iv'),
    product('w2', 'autumn-iv', {}, { thumbnail: 'https://cdn/w2-a.jpg', images: [{ url: 'https://cdn/w2-a.jpg' }, { url: 'https://cdn/w2-b.jpg' }] }),
    product('m1', 'autumn-iv', { group: 'men' }),
    product('w8', 'autumn-iv', { sleep: true, length_kinds: ['top', 'trouser'] }),
    product('i1', 'winter-i'),
    product('commission-shirt', 'silhouettes', { silhouette: 'shirt' }),
  ],
};

const serve = (overrides: Partial<typeof BACKEND> = {}) => {
  const data = { ...BACKEND, ...overrides };
  vi.stubGlobal('fetch', vi.fn(async (url: string) => {
    const key = url.includes('/store/regions')
      ? 'regions'
      : url.includes('/store/collections')
        ? 'collections'
        : 'products';
    return { ok: true, json: async () => ({ [key]: data[key as keyof typeof data] }) };
  }));
};

afterEach(() => vi.unstubAllGlobals());

describe('the catalogue, read from the backend', () => {
  it('keeps only the seasons the house has opened', async () => {
    serve();
    expect((await getCollections()).map((c) => c.slug)).toEqual(['autumn-iv', 'winter-i']);
  });

  it('leads with the open collection and reads the archive back down the years', async () => {
    serve();
    expect((await currentCollection())?.slug).toBe('autumn-iv');
    expect((await getCollections())[0].status).toBe('current');
  });

  it('never lets a commission silhouette into the shop', async () => {
    serve();
    const handles = (await getPieces()).map((p) => p.id);
    expect(handles).not.toContain('commission-shirt');
  });

  it('orders a season by its handle as a person would count it', async () => {
    serve();
    expect((await piecesIn('autumn-iv')).map((p) => p.id)).toEqual(['m1', 'w2', 'w8', 'w10']);
  });

  it('carries the collection onto the piece, so the order panel can ask', async () => {
    serve();
    const [open, archived] = [await piecesIn('autumn-iv'), await piecesIn('winter-i')];
    expect(open[0].orderable).toBe(true);
    expect(open[0].collectionTitle).toBe('Autumn — Collection 4');
    expect(archived[0].orderable).toBe(false);
  });

  it('reads the sheet a piece asks for, and the cloth it is cut from', async () => {
    serve();
    const set = (await getPieces()).find((p) => p.id === 'w8')!;
    expect(set.sleep).toBe(true);
    expect(set.lengthKinds).toEqual(['top', 'trouser']);
    expect(set.material).toBe('Sand silk twill');
    expect(set.price).toBe(1980);
  });

  it('leads with the thumbnail and does not repeat it', async () => {
    serve();
    const shot = (await getPieces()).find((p) => p.id === 'w2')!;
    expect(shot.images).toEqual(['https://cdn/w2-a.jpg', 'https://cdn/w2-b.jpg']);
    /* A piece with no photography carries none, which is what tells the frame
       to draw the placeholder weave from its art direction instead. */
    expect((await getPieces()).find((p) => p.id === 'm1')!.images).toEqual([]);
  });

  it('splits a collection page the way it is presented', async () => {
    serve();
    expect((await byGroup('women')).map((p) => p.id)).toEqual(['w2', 'w10']);
    expect((await byGroup('women', true)).map((p) => p.id)).toEqual(['w8']);
    expect((await byGroup('men')).map((p) => p.id)).toEqual(['m1']);
  });

  it('prices the shop in francs', async () => {
    serve();
    await getPieces();
    const urls = (fetch as unknown as { mock: { calls: string[][] } }).mock.calls.map((c) => c[0]);
    expect(urls.some((u) => u.includes('region_id=reg_ch'))).toBe(true);
  });

  it('says the season is empty rather than throwing when the house is unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('ECONNREFUSED'); }));
    expect(await getCollections()).toEqual([]);
    expect(await getPieces()).toEqual([]);
    expect(await currentCollection()).toBeUndefined();
  });
});
