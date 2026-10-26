import { describe, expect, it } from 'vitest';
import { EDITS } from './edits';
import { editForSlug } from './edits-i18n';
import { LOCALES, suggestLocale } from './i18n';
import { enPathOf, languagesFor, ROUTES, switchPath, translatedPath } from './locale-routes';
import { PIECE_NAMES, pieceName } from './piece-names';
import { localSlug } from './piece-i18n';

const COLOUR_WORDS = /\b(satin|rouge|rot|noir|schwarz|ivoire|elfenbein|beige|bleu|blau|vert|grün)\b/i;

describe('translated pages', () => {
  it('finds a page by locale and slug, and nothing else', () => {
    expect(editForSlug('de-ch', 'schlafmode/seide')?.enPath).toBe('/collection/sleepwear');
    expect(editForSlug('fr', 'pyjamas/soie')?.path).toBe('/fr/pyjamas/soie');
    expect(editForSlug('fr', 'schlafmode/seide')).toBeUndefined();
    expect(enPathOf('de', 'nach-mass')).toBe('/made-to-measure');
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
    expect(languagesFor('/')['de-CH']).toBe('https://bylinsilk.com/de-ch');
  });

  it('translates every English category page into all four locales', () => {
    for (const e of Object.values(EDITS)) {
      expect(ROUTES[e.path]).toBeDefined();
      for (const l of LOCALES) expect(editForSlug(l, ROUTES[e.path][l.startsWith('de') ? 'de' : 'fr'])).toBeDefined();
    }
  });

  it('keeps colour words and satin out of every translated title and H1', () => {
    for (const e of Object.values(EDITS)) {
      for (const l of LOCALES) {
        const t = editForSlug(l, ROUTES[e.path][l.startsWith('de') ? 'de' : 'fr'])!;
        expect(`${t.title} ${t.h1}`).not.toMatch(COLOUR_WORDS);
      }
    }
  });

  it('has no duplicate slug within a language', () => {
    for (const fam of ['de', 'fr'] as const) {
      const slugs = Object.values(ROUTES).map((r) => r[fam]);
      expect(new Set(slugs).size).toBe(slugs.length);
    }
  });
});

describe('language switcher', () => {
  it('goes to the same page in another language, or that language home', () => {
    expect(switchPath('/made-to-measure', 'en', 'fr')).toBe('/fr/sur-mesure');
    expect(switchPath('/de-ch/nach-mass', 'de-ch', 'en')).toBe('/made-to-measure');
    expect(switchPath('/de-ch/nach-mass', 'de-ch', 'de')).toBe('/de/nach-mass');
    expect(switchPath('/uae', 'en', 'de-ch')).toBe('/de-ch');
    expect(translatedPath('fr-ch', '/')).toBe('/fr-ch');
  });
});

describe('piece names', () => {
  it('has a unique German and French name for every piece, with no colour word or satin', () => {
    const entries = Object.entries(PIECE_NAMES);
    for (const key of ['de', 'fr'] as const) {
      const names = entries.map(([, n]) => n[key]);
      expect(new Set(names).size).toBe(names.length);
      for (const n of names) expect(n).not.toMatch(COLOUR_WORDS);
      expect(new Set(names.map((n) => localSlug(key === 'de' ? 'de-ch' : 'fr', n))).size).toBe(names.length);
    }
  });

  it('falls back to the English title when a piece is not listed', () => {
    expect(pieceName('Silk mock-neck blouse', 'fr')).toBe('Chemisier en soie à col montant');
    expect(pieceName('Unlisted piece', 'de')).toBe('Unlisted piece');
  });
});

describe('language suggestion', () => {
  it('maps a browser language to the nearest locale, and offers nothing for English', () => {
    expect(suggestLocale('de-CH')).toBe('de-ch');
    expect(suggestLocale('de-AT')).toBe('de');
    expect(suggestLocale('fr-CH')).toBe('fr-ch');
    expect(suggestLocale('fr')).toBe('fr');
    expect(suggestLocale('en-GB')).toBeNull();
  });
});
