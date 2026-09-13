'use client';

import { MeasurementSheet } from '@/components/measure/measurement-sheet';
import { saveMeasurementProfileAction } from '@/lib/account-actions';
import type { Measurements, Unit } from '@/lib/measurements';

export function MeasurementProfile({
  initialValues,
  initialUnit,
}: {
  initialValues: Measurements;
  initialUnit: Unit;
}) {
  return (
    <MeasurementSheet
      group="women"
      title="Your saved profile"
      showIntro={false}
      initialValues={initialValues}
      initialUnit={initialUnit}
      onSave={saveMeasurementProfileAction}
    />
  );
}
