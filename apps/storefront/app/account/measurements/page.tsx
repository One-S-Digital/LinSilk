import type { Metadata } from 'next';
import { accountText } from '@/lib/i18n-account';
import { serverLang } from '@/lib/server-lang';
import { redirect } from 'next/navigation';
import { DocPage } from '@/components/doc-page';
import { MeasurementProfile } from '@/components/account/measurement-profile';
import { fromLineItemMetadata } from '@/lib/measurements';
import { getCustomer } from '@/lib/session';

export async function generateMetadata(): Promise<Metadata> {
  const t = accountText(await serverLang()).measures;
  return { title: t.metaTitle, description: t.metaDescription };
}

export default async function MeasurementsPage() {
  const a = accountText(await serverLang());
  const t = a.measures;
  const customer = await getCustomer();
  if (!customer) redirect('/account');

  const { unit, values } = fromLineItemMetadata(customer.metadata);

  return (
    <DocPage
      eyebrow={a.yourAccount}
      title={t.metaTitle}
      lead={t.lead}
    >
      <MeasurementProfile initialValues={values} initialUnit={unit} />
    </DocPage>
  );
}
