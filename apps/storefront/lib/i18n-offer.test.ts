import { describe, expect, it } from 'vitest';
import { LOCALES } from './i18n';
import { offerText } from './i18n-offer';

describe('first-order offer copy', () => {
  it('is written in every language and names 20%', () => {
    for (const lang of ['en', ...LOCALES] as const) {
      const t = offerText(lang);
      for (const text of Object.values(t)) expect(text.length).toBeGreaterThan(0);
      expect(t.title).toContain('20%');
    }
  });

  it('differs by language, and the German market spells Maß-style words with ß', () => {
    expect(offerText('fr').cta).not.toBe(offerText('en').cta);
    expect(offerText('de-ch').cta).toBe('Kollektion entdecken');
    expect(offerText('de-ch').close).toBe('Schliessen');
    expect(offerText('de').close).toBe('Schließen');
  });

  it('says no colour name, satin or trousers', () => {
    for (const lang of ['en', ...LOCALES] as const) {
      expect(JSON.stringify(offerText(lang))).not.toMatch(/satin|trouser|hose/i);
    }
  });
});
