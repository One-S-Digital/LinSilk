import type { Metadata } from 'next';
import { commissionText } from '@/lib/i18n-commission';
import { serverLang } from '@/lib/server-lang';
import { CommissionPayment } from '@/components/checkout/commission-payment';
import styles from '@/app/checkout/checkout.module.css';

export async function generateMetadata(): Promise<Metadata> {
  const t = commissionText(await serverLang()).pay;
  return {
    title: t.title,
    description: t.metaDescription,
    /* A link that carries someone's measurements has no business in an index. */
    robots: { index: false, follow: false },
  };
}

export default async function CommissionPage(props: PageProps<'/commission/[token]'>) {
  const { token } = await props.params;
  const t = commissionText(await serverLang()).pay;
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{t.title}</h1>
      <CommissionPayment token={token} />
    </div>
  );
}
