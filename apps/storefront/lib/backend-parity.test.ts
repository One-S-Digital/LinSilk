import { describe, expect, it } from 'vitest';
import {
  BODY_ZONES,
  LENGTH_LABELS,
  missingMeasurements,
} from '../../medusa/src/lib/measurements';
import { toLineItemMetadata } from './measurements';
import { LENGTH_ZONE, ZONES, type LengthKind } from './catalog';

/* The backend refuses a cart line whose sheet is incomplete, using its own
   copy of the zones (apps/medusa/src/lib/measurements.ts). This file pins
   that copy to the storefront's, so a zone added or renamed here cannot
   silently leave the backend asking for a different sheet. */

describe('backend measurement sheet', () => {
  it('asks for the same fifteen body measurements, in the same words', () => {
    expect(BODY_ZONES).toEqual(ZONES.map(({ key, label }) => ({ key, label })));
  });

  it('names the same garment lengths', () => {
    expect(LENGTH_LABELS).toEqual(
      Object.fromEntries(Object.entries(LENGTH_ZONE).map(([kind, zone]) => [kind, zone.label])),
    );
  });

  it('accepts the complete sheet the storefront sends, for every kind of piece', () => {
    for (const kind of Object.keys(LENGTH_ZONE) as LengthKind[]) {
      const zones = [...ZONES, LENGTH_ZONE[kind]];
      const values = Object.fromEntries(zones.map((z, i) => [z.key, 30 + i]));
      expect(missingMeasurements(toLineItemMetadata(values, 'in', zones), kind)).toEqual([]);
    }
    const values = Object.fromEntries(ZONES.map((z, i) => [z.key, 30 + i]));
    expect(missingMeasurements(toLineItemMetadata(values, 'cm', ZONES), null)).toEqual([]);
  });

  it('refuses the partial sheet the storefront would never send', () => {
    const values = Object.fromEntries(ZONES.slice(1).map((z, i) => [z.key, 30 + i]));
    expect(missingMeasurements(toLineItemMetadata(values, 'cm', ZONES), 'dress')).toEqual([
      'Neck',
      'Dress length',
    ]);
  });
});
