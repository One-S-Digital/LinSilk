import Link from 'next/link';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { DocPage } from '@/components/doc-page';
import { formatMoney } from '@/lib/medusa';
import { authedFetch } from '@/lib/session';
import styles from '../account.module.css';

export const metadata: Metadata = {
  title: 'Your orders',
  description: 'Every reservation and commission, and where it stands.',
};

type ApiOrder = {
  id: string;
  display_id?: number;
  status: string;
  currency_code: string;
  total: number;
};

export default async function OrdersPage() {
  const body = await authedFetch<{ orders: ApiOrder[] }>(
    '/store/orders?fields=id,display_id,status,currency_code,total&order=-created_at',
  );
  if (!body) redirect('/account');

  return (
    <DocPage
      eyebrow="Your account"
      title="Your orders"
      lead={
        body.orders.length
          ? 'Every reservation and commission you have paid for, oldest last.'
          : 'Nothing yet — a reservation or an accepted commission will appear here.'
      }
    >
      <div className={styles.orders}>
        {body.orders.map((order) => (
          <Link key={order.id} href={`/order/${order.id}`} className={styles.orderRow}>
            <span>Order {order.display_id ? `no. ${order.display_id}` : order.id}</span>
            <span className={styles.orderMeta}>
              {formatMoney(order.total, order.currency_code)} · {order.status}
            </span>
          </Link>
        ))}
      </div>
    </DocPage>
  );
}
