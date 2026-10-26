import { describe, expect, it } from 'vitest';
import { EDITS } from './edits';
import { editForSlug, languagesFor, LOCALE_PAGES } from './edits-i18n';
import type { Locale } from './i18n';

describe('translated pages', () => {
  it('finds a page by locale and slug, and nothing else', () => {
    expect(editForSlug('de-ch', 'schlafmode/seide')?.enPath).toBe('/collection/sleepwear');
    expect(editForSlug('fr', 'pyjamas/soie')?.path).toBe('/fr/pyjamas/soie');
    expect(editForSlug('fr', 'schlafmode/seide')).toBeUndefined();
  });

  it('writes /de/ with Maß and /de-ch/ with Mass', () => {
    const range = { from: 159, to: 359 };
    expect(editForSlug('de-ch', 'schlafmode/seide')!.intro(range)).toContain('nach Ihren Massen gefertigt, aus');
    const de = editForSlug('de', 'schlafmode/seide')!;
    expect(de.intro(range)).toContain('nach Ihren Maßen');
    expect(de.intro(range)).not.toContain('innert');
    expect(de.intro(range)).toContain('ab CHF 159 bis CHF 359');
  });

  it('lists every language with the English root as x-default', () => {
    const l = languagesFor('/collection/sleepwear');
    expect(l['x-default']).toBe('https://bylinsilk.com/collection/sleepwear');
    expect(l['de-AT']).toBe('https://bylinsilk.com/de/schlafmode/seide');
    expect(l['de-LI']).toBe(l['de-CH']);
    expect(l['fr-LU']).toBe('https://bylinsilk.com/fr/pyjamas/soie');
    expect(languagesFor('/uae')).toEqual({});
  });

  it('translates every English category page into all four locales', () => {
    expect(LOCALE_PAGES).toHaveLength(Object.keys(EDITS).length * 4);
    for (const e of Object.values(EDITS)) expect(Object.keys(languagesFor(e.path))).toContain('de-AT');
  });

  it('keeps colour words and satin out of every translated title and H1', () => {
    for (const { path } of LOCALE_PAGES) {
      const [, locale, ...slug] = path.split('/') as [string, Locale, ...string[]];
      const e = editForSlug(locale, slug.join('/'))!;
      expect(`${e.title} ${e.h1}`).not.toMatch(/\b(satin|rouge|rot|noir|schwarz|ivoire|elfenbein)\b/i);
    }
  });

  it('has no duplicate slug within a locale', () => {
    const paths = LOCALE_PAGES.map((p) => p.path);
    expect(new Set(paths).size).toBe(paths.length);
  });
});
