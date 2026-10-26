import Link from 'next/link';
import type { Metadata } from 'next';
import { CommissionFlow } from '@/components/commission-flow';
import { JsonLd } from '@/components/json-ld';
import { SeoText } from '@/components/seo-text';
import listing from '@/app/collection/[group]/listing.module.css';
import type { QA } from '@/lib/garments';
import { faqLd } from '@/lib/jsonld';
import { getFabricCatalogues, getSilhouettes } from '@/lib/medusa';
import { fromLineItemMetadata } from '@/lib/measurements';
import { getCustomer } from '@/lib/session';
import styles from './design.module.css';

export const metadata: Metadata = {
  title: 'Design your own dress or shirt in silk or linen',
  description:
    'Design your own piece: choose a base silhouette and the cloth, write a brief, add your measurements. A tailor reads it and replies with a price. Silk or linen only.',
  alternates: { canonical: '/design' },
};

/* Owns the commission cluster only; the made-to-measure process lives on
   /made-to-measure (SEO-GEO-PLAN §5). */
const FAQ: QA[] = [
  {
    q: 'Can I design my own dress online?',
    a: 'Yes. Choose a base silhouette, choose the cloth, write a note to the tailor and enter your measurements. The atelier builds one garment to that brief.',
  },
  {
    q: 'How is a commission priced?',
    a: 'Each silhouette shows an opening figure. A tailor reads every brief and replies with the price for your piece before anything is cut.',
  },
  {
    q: 'How long does a commission take?',
    a: 'Two to four weeks at the bench from your confirmed measurement sheet, the same as a piece from the collection, plus delivery.',
  },
];

function About() {
  return (
    <div className={listing.page}>
      <JsonLd data={faqLd(FAQ)} />
      <SeoText>
        <h2>Design your own, made to your measurements</h2>
        <p>
          Design Your Own is LINSILK’s commission service: you choose a base silhouette
          and the cloth, write a brief to the tailor and submit your measurements; the
          atelier builds one garment to it and replies with a price before anything is
          cut. Every commission is made in 100% silk or 100% linen.
        </p>
        <p>
          Looking for a piece from the collection instead?{' '}
          <Link href="/made-to-measure">How made-to-measure works</Link>
        </p>
        <h2>Questions</h2>
        {FAQ.map(({ q, a }) => (
          <div key={q}>
            <h3>{q}</h3>
            <p>{a}</p>
          </div>
        ))}
      </SeoText>
    </div>
  );
}

/* The silhouettes and their opening figures are set in the backend, so the
   house can change a price without a deploy. Re-read every few minutes. */
export const revalidate = 300;

export default async function DesignPage() {
  const [silhouettes, catalogues, customer] = await Promise.all([
    getSilhouettes(),
    getFabricCatalogues(),
    getCustomer(),
  ]);
  /* A signed-in client's own measurements, if they saved any — carried into
     the sheet below so starting a commission on another device does not mean
     typing all fifteen points over again. Anonymous, this stays undefined,
     and the sheet falls back to whatever this browser has, as before. */
  const profile = customer ? fromLineItemMetadata(customer.metadata) : null;

  if (!silhouettes?.length) {
    return (
      <div className={styles.page}>
        <h1 className={styles.title}>Design your own</h1>
        <p className={styles.lede}>
          Commissions cannot be sent just now — the atelier’s desk is unreachable. Write
          to <a href="mailto:hello@bylinsilk.com">hello@bylinsilk.com</a> and a tailor
          will take your brief by email instead.
        </p>
      </div>
    );
  }

  return (
    <>
      <CommissionFlow
        silhouettes={silhouettes}
        catalogues={catalogues ?? []}
        initialMeasurements={profile?.values}
        initialUnit={profile?.unit}
      />
      <About />
    </>
  );
}
