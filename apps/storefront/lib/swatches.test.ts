import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { SWATCHES, findSwatch, swatchLabel, swatchesFor } from './swatches';

/* The colour a client chooses travels on the order line and reaches the bench
   by its code, so the library has to hold together: no code twice, nothing in
   the wrong cloth, and nothing drawn from a photograph that is not there. */

const all = [...SWATCHES.silk, ...SWATCHES.linen];

describe('the colour library', () => {
  it('holds each cloth in its own list and no code twice', () => {
    expect(SWATCHES.silk.every((s) => s.cloth === 'silk')).toBe(true);
    expect(SWATCHES.linen.every((s) => s.cloth === 'linen')).toBe(true);
    expect(new Set(all.map((s) => s.key)).size).toBe(all.length);
    expect(SWATCHES.silk).toHaveLength(48);
    expect(SWATCHES.linen).toHaveLength(40);
  });

  it('sells silk and linen only: no swatch is called satin', () => {
    expect(all.filter((s) => /satin/i.test(`${s.name} ${s.group ?? ''}`))).toEqual([]);
  });

  it('draws every swatch from a photograph that exists', () => {
    const missing = all.filter((s) => !existsSync(join(process.cwd(), 'public', s.image)));
    expect(missing.map((s) => s.key)).toEqual([]);
  });

  it('offers a piece only the swatches of its own cloth, and finds one by its code', () => {
    expect(swatchesFor('linen').some((s) => s.key.startsWith('LS-S'))).toBe(false);
    expect(findSwatch('silk', 'LS-S02')?.name).toBe('Cobalt');
    expect(findSwatch('linen', 'LS-S02')).toBeUndefined();
  });

  it('labels a choice with its colour and its cloth', () => {
    expect(swatchLabel(findSwatch('silk', 'LS-S02')!)).toBe('Cobalt silk');
    expect(swatchLabel(findSwatch('linen', 'LS-L04')!)).toBe('Oatmeal linen');
  });
});
