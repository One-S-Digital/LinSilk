import type { Metadata } from 'next';
import { CommissionFlow } from '@/components/commission-flow';
import { getFabricCatalogues, getSilhouettes } from '@/lib/medusa';
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
  const [silhouettes, catalogues] = await Promise.all([
    getSilhouettes(),
    getFabricCatalogues(),
  ]);

  if (!silhouettes?.length) {
    return (
      <div className={styles.page}>
        <h1 className={styles.title}>Design your own</h1>
        <p className={styles.lede}>
          Commissions cannot be sent just now — the atelier’s desk is unreachable. Write
          to <a href="mailto:hello@maisonayla.ch">hello@maisonayla.ch</a> and a tailor
          will take your brief by email instead.
        </p>
      </div>
    );
  }

  return <CommissionFlow silhouettes={silhouettes} catalogues={catalogues ?? []} />;
}
