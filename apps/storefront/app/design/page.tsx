import type { Metadata } from 'next';
import { CommissionFlow } from '@/components/commission-flow';
import { getFabricCatalogues, getSilhouettes } from '@/lib/medusa';
import { fromLineItemMetadata } from '@/lib/measurements';
import { getCustomer } from '@/lib/session';
import styles from './design.module.css';

export const metadata: Metadata = {
  title: 'Design your own',
  description:
    'A commission, not a configurator: a shape, a cloth, a note and your measurements. A tailor reads the brief and writes back with a price.',
};

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
    <CommissionFlow
      silhouettes={silhouettes}
      catalogues={catalogues ?? []}
      initialMeasurements={profile?.values}
      initialUnit={profile?.unit}
    />
  );
}
