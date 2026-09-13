import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { DocPage } from '@/components/doc-page';
import { MeasurementProfile } from '@/components/account/measurement-profile';
import { fromLineItemMetadata } from '@/lib/measurements';
import { getCustomer } from '@/lib/session';

export const metadata: Metadata = {
  title: 'Your measurements',
  description: 'The fifteen-point sheet the atelier keeps for you.',
};

export default async function MeasurementsPage() {
  const customer = await getCustomer();
  if (!customer) redirect('/account');

  const { unit, values } = fromLineItemMetadata(customer.metadata);

  return (
    <DocPage
      eyebrow="Your account"
      title="Your measurements"
      lead="Saved here once, so you never type them again — from a piece page, from Design Your Own, or here."
    >
      <MeasurementProfile initialValues={values} initialUnit={unit} />
    </DocPage>
  );
}
