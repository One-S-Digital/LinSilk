import type { Metadata } from 'next';
import { MeasuringView } from '@/components/pages/care-views';
import { pagesText } from '@/lib/i18n-pages';
import { languagesFor } from '@/lib/locale-routes';

const t = pagesText('en').measuring;

export const metadata: Metadata = {
  title: t.metaTitle,
  description: t.description,
  alternates: { canonical: '/care/measuring', languages: languagesFor('/care/measuring') },
};

export default function MeasuringPage() {
  return <MeasuringView lang="en" />;
}
