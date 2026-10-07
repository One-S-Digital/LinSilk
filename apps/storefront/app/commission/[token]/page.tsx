import type { Metadata } from 'next';
import { CommissionPayment } from '@/components/checkout/commission-payment';
import styles from '@/app/checkout/checkout.module.css';

export const metadata: Metadata = {
  title: 'Your commission',
  description: 'The figure a tailor set for your commission, and how to accept it.',
  /* A link that carries someone's measurements has no business in an index. */
  robots: { index: false, follow: false },
};

export default async function CommissionPage(props: PageProps<'/commission/[token]'>) {
  const { token } = await props.params;
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Your commission</h1>
      <CommissionPayment token={token} />
    </div>
  );
}
