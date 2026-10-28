'use client';

import { MeasurementSheet } from '@/components/measure/measurement-sheet';
import { saveMeasurementProfileAction } from '@/lib/account-actions';
import type { Measurements, Unit } from '@/lib/measurements';
import { accountText } from '@/lib/i18n-account';
import { useLang } from '@/lib/use-lang';

export function MeasurementProfile({
  initialValues,
  initialUnit,
}: {
  initialValues: Measurements;
  initialUnit: Unit;
}) {
  const t = accountText(useLang()).measures;
  return (
    <MeasurementSheet
      group="women"
      title={t.profile}
      showIntro={false}
      initialValues={initialValues}
      initialUnit={initialUnit}
      onSave={saveMeasurementProfileAction}
    />
  );
}
