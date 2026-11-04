import { describe, expect, it } from 'vitest';
import { LOCALES } from './i18n';
import { contactText } from './i18n-contact';

describe('contact form copy', () => {
  it('is written in every language', () => {
    for (const lang of ['en', ...LOCALES] as const) {
      for (const text of Object.values(contactText(lang))) expect(text.length).toBeGreaterThan(0);
    }
    expect(contactText('de').title).not.toBe(contactText('fr').title);
  });
});
