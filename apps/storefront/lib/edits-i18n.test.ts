import { describe, expect, it } from 'vitest';
import { EDITS } from './edits';
import { editForSlug } from './edits-i18n';
import { LOCALES, suggestLocale } from './i18n';
import { slugify } from './slug';
import { enPathOf, languagesFor, ROUTES, switchPath, translatedPath } from './locale-routes';
import { PIECE_NAMES, pieceName } from './piece-names';
import { localSlug } from './piece-i18n';

const COLOUR_WORDS = /\b(satin|rouge|rot|noir|schwarz|ivoire|elfenbein|beige|bleu|blau|vert|grün)\b/i;

describe('translated pages', () => {
  it('finds a page by locale and slug, and nothing else', () => {
    expect(editForSlug('de', 'schlafmode/seide')?.enPath).toBe('/collection/sleepwear');
    expect(editForSlug('fr', 'pyjamas/soie')?.path).toBe('/fr/pyjamas/soie');
    expect(editForSlug('fr', 'schlafmode/seide')).toBeUndefined();
    expect(enPathOf('de', 'nach-mass')).toBe('/made-to-measure');
  });

  it('writes /de/ in Swiss standard German, with Mass', () => {
    const range = { from: 159, to: 359 };
    const de = editForSlug('de', 'schlafmode/seide')!;
    expect(de.intro(range)).toContain('nach Ihren Massen');
    expect(de.intro(range)).toContain('innert 2–4 Wochen');
    expect(de.intro(range)).toContain('ab CHF 159 bis CHF 359');
  });

  it('lists every language with the English root as x-default', () => {
    const l = languagesFor('/collection/sleepwear');
    expect(l['x-default']).toBe('https://bylinsilk.com/collection/sleepwear');
    expect(l['de-AT']).toBe('https://bylinsilk.com/de/schlafmode/seide');
    expect(l['de-LI']).toBe(l['de-CH']);
    expect(l['fr-LU']).toBe('https://bylinsilk.com/fr/pyjamas/soie');
    expect(languagesFor('/uae')).toEqual({});
    expect(languagesFor('/')['de-CH']).toBe('https://bylinsilk.com/de');
  });

  it('translates every English category page into both locales', () => {
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
    expect(switchPath('/de/nach-mass', 'de', 'en')).toBe('/made-to-measure');
    expect(switchPath('/de/nach-mass', 'de', 'fr')).toBe('/fr/sur-mesure');
    expect(switchPath('/uae', 'en', 'de')).toBe('/de');
    expect(translatedPath('fr', '/')).toBe('/fr');
  });

  it('keeps the same piece when the language changes', () => {
    expect(switchPath('/piece/silk-slip-mini-dress', 'en', 'de')).toBe('/de/stueck/seiden-slip-minikleid');
    expect(switchPath('/de/stueck/seiden-slip-minikleid', 'de', 'fr')).toBe('/fr/piece/mini-robe-nuisette-en-soie');
    expect(switchPath('/fr/piece/mini-robe-nuisette-en-soie', 'fr', 'en')).toBe('/piece/silk-slip-mini-dress');
    expect(switchPath('/piece/not-a-known-piece', 'en', 'fr')).toBe('/fr');
  });
});

describe('piece names', () => {
  it('has a unique German and French name for every piece, with no colour word or satin', () => {
    const entries = Object.entries(PIECE_NAMES);
    for (const key of ['de', 'fr'] as const) {
      const names = entries.map(([, n]) => n[key]);
      expect(new Set(names).size).toBe(names.length);
      for (const n of names) expect(n).not.toMatch(COLOUR_WORDS);
      expect(new Set(names.map((n) => localSlug(key, n))).size).toBe(names.length);
    }
  });

  it('falls back to the English title when a piece is not listed', () => {
    expect(pieceName('Silk mock-neck blouse', 'fr')).toBe('Chemisier en soie à col montant');
    expect(pieceName('Unlisted piece', 'de')).toBe('Unlisted piece');
  });
});

describe('slugs', () => {
  it('transliterates œ and æ rather than leaving a hyphen', () => {
    expect(slugify('gilet cache-cœur à nouer')).toBe('gilet-cache-coeur-a-nouer');
    expect(slugify('Schräg geschnittener Rock')).toBe('schraeg-geschnittener-rock');
  });
});

describe('language suggestion', () => {
  it('maps a browser language to the nearest locale, and offers nothing for English', () => {
    expect(suggestLocale('de-CH')).toBe('de');
    expect(suggestLocale('de-AT')).toBe('de');
    expect(suggestLocale('fr-CH')).toBe('fr');
    expect(suggestLocale('fr')).toBe('fr');
    expect(suggestLocale('en-GB')).toBeNull();
  });
});

describe('German-market copy', () => {
  it('leaves text handed to a message exactly as it was', async () => {
    const { accountText } = await import('./i18n-account');
    const note = accountText('de').verify.bannerNote('gross@example.com');
    expect(note).toContain('gross@example.com');
    expect(note).not.toContain('groß@');
    expect(accountText('de').orders.status.completed).toBe('Abgeschlossen');
  });
});
