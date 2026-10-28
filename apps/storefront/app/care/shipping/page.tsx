import type { Metadata } from 'next';
import { ShippingView } from '@/components/pages/care-views';
import { pagesText } from '@/lib/i18n-pages';
import { languagesFor } from '@/lib/locale-routes';

const t = pagesText('en').shipping;

export const metadata: Metadata = {
  title: t.title,
  description: t.description,
  alternates: { canonical: '/care/shipping', languages: languagesFor('/care/shipping') },
};

export default function ShippingPage() {
  return <ShippingView lang="en" />;
}
