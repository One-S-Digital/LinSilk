import type { Metadata } from 'next';
import { DesignView } from '@/components/pages/design-view';
import { pagesText } from '@/lib/i18n-pages';
import { languagesFor } from '@/lib/locale-routes';

const t = pagesText('en').design;

export const metadata: Metadata = {
  title: t.title,
  description: t.description,
  alternates: { canonical: '/design', languages: languagesFor('/design') },
};

/* The silhouettes and their opening figures are set in the backend, so the
   house can change a price without a deploy. Re-read every few minutes. */
export const revalidate = 300;

export default function DesignPage() {
  return <DesignView lang="en" />;
}
