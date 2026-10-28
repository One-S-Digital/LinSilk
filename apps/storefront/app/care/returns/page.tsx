import type { Metadata } from 'next';
import { ReturnsView } from '@/components/pages/care-views';
import { pagesText } from '@/lib/i18n-pages';
import { languagesFor } from '@/lib/locale-routes';

const t = pagesText('en').returns;

export const metadata: Metadata = {
  title: t.title,
  description: t.description,
  alternates: { canonical: '/care/returns', languages: languagesFor('/care/returns') },
};

export default function ReturnsPage() {
  return <ReturnsView lang="en" />;
}
