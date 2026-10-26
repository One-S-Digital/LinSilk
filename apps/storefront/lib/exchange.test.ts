import { describe, expect, it } from 'vitest';
import { approximate, currencyForLocale, parseEcb } from './exchange';

const xml = `<gesmes:Envelope><Cube><Cube time='2026-10-14'>
  <Cube currency='USD' rate='1.1600'/>
  <Cube currency='CHF' rate='0.9300'/>
  <Cube currency='GBP' rate='0.8700'/>
</Cube></Cube></gesmes:Envelope>`;

describe('parseEcb', () => {
  it('works francs-to-currency out of the euro-based daily file', () => {
    const parsed = parseEcb(xml)!;
    expect(parsed.date).toBe('2026-10-14');
    expect(parsed.rates.EUR).toBeCloseTo(1 / 0.93, 6);
    expect(parsed.rates.GBP).toBeCloseTo(0.87 / 0.93, 6);
    expect(parsed.rates.USD).toBeCloseTo(1.16 / 0.93, 6);
  });

  it('works the dirham out of the dollar, which it is pegged to', () => {
    expect(parseEcb(xml)!.rates.AED).toBeCloseTo((1.16 / 0.93) * 3.6725, 6);
  });

  it('gives nothing when the file lacks a rate it needs', () => {
    expect(parseEcb(xml.replace("currency='CHF'", "currency='JPY'"))).toBeNull();
    expect(parseEcb('<html>down for maintenance</html>')).toBeNull();
  });
});

describe('approximate', () => {
  const { rates } = parseEcb(xml)!;

  it('shows whole units, marked as approximate', () => {
    expect(approximate(129, 'EUR', rates)).toBe('≈ €139');
    expect(approximate(129, 'GBP', rates)).toBe('≈ £121');
    expect(approximate(129, 'USD', rates)).toBe('≈ $161');
  });
});

describe('currencyForLocale', () => {
  it('suggests a currency from the browser language, and francs for a Swiss one', () => {
    expect(currencyForLocale('de-DE')).toBe('EUR');
    expect(currencyForLocale('fr-FR')).toBe('EUR');
    expect(currencyForLocale('en-GB')).toBe('GBP');
    expect(currencyForLocale('en-US')).toBe('USD');
    expect(currencyForLocale('ar-AE')).toBe('AED');
    expect(currencyForLocale('de-CH')).toBeNull();
    expect(currencyForLocale('en')).toBeNull();
    expect(currencyForLocale(undefined)).toBeNull();
  });
});
