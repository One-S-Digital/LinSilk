import { describe, expect, it } from 'vitest';
import { sitemapPaths } from './sitemap-paths';
import type { Collection, Piece } from './catalog';

const season = (slug: string) => ({ slug }) as Collection;
const piece = (slug: string, retired = false) => ({ slug, retired }) as Piece;

describe('sitemapPaths', () => {
  const paths = sitemapPaths([season('autumn-iii'), season('summer-ii')], [piece('silk-cowl-halter-gown'), piece('a b'), piece('linen-old-shirt', true)]);

  it('lists the public pages, the groups, every archived season and every piece', () => {
    expect(paths).toEqual(
      expect.arrayContaining([
        '/', '/collection', '/collection/women', '/collection/men', '/archive', '/cloth', '/design',
        '/made-to-measure', '/about', '/contact', '/uae',
        '/care/measuring', '/care/questions', '/care/returns', '/care/shipping',
        '/collection/women/silk', '/collection/sleepwear', '/occasion/wedding-guest',
        '/archive/autumn-iii', '/archive/summer-ii', '/piece/silk-cowl-halter-gown', '/piece/a%20b',
      ]),
    );
  });

  it('never lists private, per-visitor or noindex pages', () => {
    const banned = ['/cart', '/checkout', '/account', '/order', '/admin', '/commission', '/legal', '/season-letter'];
    expect(paths.filter((p) => banned.some((b) => p === b || p.startsWith(`${b}/`)))).toEqual([]);
  });

  it('leaves out a retired piece, which redirects', () => {
    expect(paths).not.toContain('/piece/linen-old-shirt');
  });

  it('lists a page once', () => {
    expect(new Set(paths).size).toBe(paths.length);
  });
});
