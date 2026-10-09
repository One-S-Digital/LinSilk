import { describe, expect, it } from 'vitest';
import {
  CM_PER_INCH,
  RANGES,
  formatValue,
  fromLineItemMetadata,
  isComplete,
  takenCount,
  toCm,
  toDisplay,
  toLineItemMetadata,
  validate,
} from './measurements';
import { LENGTH_ZONE, ZONES, garmentZonesFor, type LengthKind } from './catalog';

/* The sheet is the order. A measurement that converts wrongly does not produce
 * a rendering bug, it produces a garment cut to the wrong body — so the
 * conversion, the validation and the payload that reaches the bench are all
 * pinned here.
 */

describe('unit conversion', () => {
  it('stores inches as centimetres', () => {
    expect(toCm(38, 'in')).toBeCloseTo(38 * CM_PER_INCH, 10);
    expect(toCm(38, 'in')).toBeCloseTo(96.52, 2);
  });

  it('leaves centimetres alone', () => {
    expect(toCm(96, 'cm')).toBe(96);
  });

  it('round-trips a value through both units without drift', () => {
    const stored = toCm(38, 'in');
    expect(toDisplay(stored, 'in')).toBeCloseTo(38, 10);
    expect(toDisplay(stored, 'cm')).toBeCloseTo(96.52, 2);
  });

  /* The prototype relabelled cm/in without converting, so a 38 in chest was
     sent to the atelier as 38 cm. This is the regression guard for that. */
  it('does not treat a switched unit as the same number', () => {
    expect(toCm(38, 'in')).not.toBe(38);
  });
});

describe('display formatting', () => {
  it('shows centimetres to one decimal', () => {
    expect(formatValue(96.52, 'cm')).toBe('96.5');
    expect(formatValue(96, 'cm')).toBe('96');
  });

  it('shows inches to the nearest quarter, as a tape reads', () => {
    expect(formatValue(toCm(38.3, 'in'), 'in')).toBe('38.25');
    expect(formatValue(toCm(38, 'in'), 'in')).toBe('38');
    expect(formatValue(toCm(38.9, 'in'), 'in')).toBe('39');
  });
});

describe('validation', () => {
  it('accepts a plausible chest', () => {
    expect(validate('bust', 96, 'cm')).toBeNull();
  });

  it('flags a chest that is really inches typed into a cm field', () => {
    // 96 read as inches is 243 cm — well outside any body.
    expect(validate('bust', toCm(96, 'in'), 'in')).not.toBeNull();
  });

  it('flags a misplaced decimal point', () => {
    expect(validate('waist', 7.2, 'cm')).not.toBeNull();
    expect(validate('waist', 720, 'cm')).not.toBeNull();
  });

  it('quotes the range in whichever unit is on screen', () => {
    expect(validate('wrist', 300, 'cm')).toContain('cm');
    expect(validate('wrist', 300, 'in')).toContain('in');
  });

  it('has a range for every zone on the sheet', () => {
    for (const zone of ZONES) {
      expect(validate(zone.key, 1, 'cm'), `${zone.key} has no range`).not.toBeNull();
    }
  });
});

describe('the atelier chart', () => {
  it('carries every measurement on the chart', () => {
    const expected = [
      'neck', 'shoulder', 'bust', 'bustPoint', 'frontWaist', 'backWaist', 'waist',
      'hip', 'hipDepth', 'thigh', 'knee', 'sleeve', 'bicep', 'wrist', 'rise',
    ];
    const present = ZONES.map((z) => z.key);
    for (const key of expected) {
      expect(present, `chart measurement "${key}" is missing`).toContain(key);
    }
    expect(present).toHaveLength(expected.length);
  });

  it('gives every zone a label and a hint', () => {
    for (const zone of [...ZONES, ...Object.values(LENGTH_ZONE)]) {
      expect(zone.label.length, zone.key).toBeGreaterThan(0);
      expect(zone.hint.length, zone.key).toBeGreaterThan(10);
    }
  });

  it('keeps the four drop measurements, which girths cannot replace', () => {
    for (const key of ['bustPoint', 'frontWaist', 'backWaist', 'hipDepth']) {
      expect(ZONES.some((z) => z.key === key), `${key} missing`).toBe(true);
    }
  });

  it('takes a different garment length for each kind of garment', () => {
    expect(LENGTH_ZONE.dress.label).toBe('Dress length');
    expect(LENGTH_ZONE.trouser.label).toBe('Trouser length');
    expect(LENGTH_ZONE.skirt.label).toBe('Skirt length');
    expect(LENGTH_ZONE.robe.label).toBe('Robe length');
    // Each length has its own field, so a set can carry a top length and a
    // trouser length on one sheet, and each is range-checked.
    const keys = Object.values(LENGTH_ZONE).map((zone) => zone.key);
    expect(new Set(keys).size).toBe(keys.length);
    for (const key of keys) {
      expect(RANGES[key], key).toBeDefined();
    }
  });

  it('asks a set for both of its lengths', () => {
    const set = { lengthKinds: ['top', 'trouser'] as LengthKind[] };
    expect(garmentZonesFor(set).map((z) => z.label)).toEqual([
      'Desired length',
      'Trouser length',
    ]);
  });
});

describe('completeness', () => {
  const full = Object.fromEntries(ZONES.map((z) => [z.key, 80]));

  it('counts only the zones actually taken', () => {
    expect(takenCount({})).toBe(0);
    expect(takenCount({ neck: 38 })).toBe(1);
    expect(takenCount(full)).toBe(ZONES.length);
  });

  it('is complete only with all fifteen', () => {
    expect(isComplete({ neck: 38 })).toBe(false);
    expect(isComplete(full)).toBe(true);
  });
});

describe('line item payload', () => {
  it('sends centimetres to the bench regardless of the unit on screen', () => {
    const values = { bust: toCm(38, 'in') };
    const payload = toLineItemMetadata(values, 'in');
    expect(payload.measurement_unit).toBe('in');
    // The displayed unit is recorded, but the figure itself is metric.
    expect(Number(payload.measure_bust_cm)).toBeCloseTo(96.52, 2);
  });

  it('omits zones that were never taken', () => {
    const payload = toLineItemMetadata({ neck: 38 }, 'cm');
    expect(payload).toHaveProperty('measure_neck_cm');
    expect(payload).not.toHaveProperty('measure_waist_cm');
  });
});

describe('reading a sheet back out of metadata', () => {
  it('round-trips through the line item payload', () => {
    const values = { neck: 38, bust: 96 };
    const payload = toLineItemMetadata(values, 'in');
    expect(fromLineItemMetadata(payload)).toEqual({ unit: 'in', values });
  });

  it('ignores metadata that is not a measurement', () => {
    const { values } = fromLineItemMetadata({ fabric_name: 'Oyster silk', piece_id: 'w1' });
    expect(values).toEqual({});
  });

  it('defaults to centimetres, and to nothing at all, given nothing', () => {
    expect(fromLineItemMetadata(null)).toEqual({ unit: 'cm', values: {} });
  });
});
