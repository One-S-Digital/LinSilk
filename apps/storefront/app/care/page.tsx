import type { Metadata } from 'next';
import { CarePage } from '@/components/care/care-page';
import { careCopy } from '@/lib/care-guide';
import { languagesFor } from '@/lib/locale-routes';

/* bylinsilk.com/care — the address printed as the QR code on every box.
   It must never move. German is /de/pflege and French /fr/entretien. */

const { PAGE } = careCopy('en');

export const metadata: Metadata = {
  title: PAGE.metaTitle,
  description: PAGE.description,
  alternates: { canonical: '/care', languages: languagesFor('/care') },
};

export default function Page() {
  return <CarePage lang="en" />;
}
