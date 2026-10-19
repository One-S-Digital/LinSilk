import { describe, expect, it } from 'vitest';
import { sitemapPaths } from './sitemap-paths';
import type { Collection, Piece } from './catalog';

const season = (slug: string) => ({ slug }) as Collection;
const piece = (id: string) => ({ id }) as Piece;

describe('sitemapPaths', () => {
  const paths = sitemapPaths([season('autumn-iii'), season('summer-ii')], [piece('001'), piece('a b')]);

  it('lists the public pages, the groups, every archived season and every piece', () => {
    expect(paths).toEqual(
      expect.arrayContaining([
        '/', '/collection', '/collection/women', '/collection/men', '/archive', '/cloth', '/design',
        '/contact', '/season-letter', '/care/measuring', '/care/questions', '/care/returns', '/care/shipping',
        '/archive/autumn-iii', '/archive/summer-ii', '/piece/001', '/piece/a%20b',
      ]),
    );
  });

  it('never lists private, per-visitor or noindex pages', () => {
    const banned = ['/cart', '/checkout', '/account', '/order', '/admin', '/commission', '/legal'];
    expect(paths.filter((p) => banned.some((b) => p === b || p.startsWith(`${b}/`)))).toEqual([]);
  });

  it('lists a page once', () => {
    expect(new Set(paths).size).toBe(paths.length);
  });
});
