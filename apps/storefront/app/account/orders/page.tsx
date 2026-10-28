import Link from 'next/link';
import type { Metadata } from 'next';
import { accountText } from '@/lib/i18n-account';
import { serverLang } from '@/lib/server-lang';
import { redirect } from 'next/navigation';
import { DocPage } from '@/components/doc-page';
import { formatMoney } from '@/lib/medusa';
import { authedFetch } from '@/lib/session';
import styles from '../account.module.css';

export async function generateMetadata(): Promise<Metadata> {
  const t = accountText(await serverLang()).orders;
  return { title: t.metaTitle, description: t.metaDescription };
}

type ApiOrder = {
  id: string;
  display_id?: number;
  status: string;
  currency_code: string;
  total: number;
};

export default async function OrdersPage() {
  const a = accountText(await serverLang());
  const t = a.orders;
  const body = await authedFetch<{ orders: ApiOrder[] }>(
    '/store/orders?fields=id,display_id,status,currency_code,total&order=-created_at',
  );
  if (!body) redirect('/account');

  return (
    <DocPage
      eyebrow={a.yourAccount}
      title={t.title}
      lead={
        body.orders.length ? t.lead : t.none
      }
    >
      <div className={styles.orders}>
        {body.orders.map((order) => (
          <Link key={order.id} href={`/order/${order.id}`} className={styles.orderRow}>
            <span>{t.order(order.display_id ? t.no(order.display_id) : order.id)}</span>
            <span className={styles.orderMeta}>
              {formatMoney(order.total, order.currency_code)} · {order.status}
            </span>
          </Link>
        ))}
      </div>
    </DocPage>
  );
}
