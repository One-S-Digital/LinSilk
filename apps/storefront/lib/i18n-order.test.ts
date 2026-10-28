import { describe, expect, it } from 'vitest';
import { LENGTH_ZONE, ZONES } from './catalog';
import { NAMED_SWATCHES, fabricLabel, swatchLabelIn, swatchName, zoneText } from './i18n-order';
import { switchPath } from './locale-routes';
import { SWATCHES } from './swatches';

const ALL = [...SWATCHES.silk, ...SWATCHES.linen];

describe('translated ordering words', () => {
  it('names every colour in German and French', () => {
    expect(NAMED_SWATCHES.sort()).toEqual(ALL.map((s) => s.key).sort());
    expect(swatchLabelIn(ALL[1], 'fr')).toBe('Soie – Cobalt');
    expect(swatchLabelIn(ALL[1], 'de-ch')).toBe('Seide – Kobalt');
  });

  it('keeps the colour name English for the atelier and translates the display', () => {
    expect(fabricLabel('LS-S02', 'Cobalt silk', 'en')).toBe('Cobalt silk');
    expect(fabricLabel('LS-S02', 'Cobalt silk', 'fr-ch')).toBe('Soie – Cobalt');
    expect(fabricLabel('custom', 'Oyster charmeuse', 'fr')).toBe('Oyster charmeuse');
  });

  it('translates every measurement zone, label and hint', () => {
    for (const z of [...ZONES, ...Object.values(LENGTH_ZONE)]) {
      for (const l of ['de-ch', 'fr'] as const) {
        const t = zoneText(z, l);
        expect(t.label).not.toBe(z.label);
        expect(t.hint).not.toBe(z.hint);
      }
    }
  });
});

describe('new translated pages', () => {
  it('switches the same page between languages', () => {
    expect(switchPath('/design', 'en', 'de-ch')).toBe('/de-ch/selbst-entwerfen');
    expect(switchPath('/de-ch/versand', 'de-ch', 'fr')).toBe('/fr/livraison');
    expect(switchPath('/fr/collection/femmes', 'fr', 'en')).toBe('/collection/women');
    expect(switchPath('/care/measuring', 'en', 'de')).toBe('/de/masse-nehmen');
  });
});
