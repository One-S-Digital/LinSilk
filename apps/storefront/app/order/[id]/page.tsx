import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { DocPage, DocSection, DocP } from '@/components/doc-page';
import { ShotFrame } from '@/components/shot';
import { ButtonLink } from '@/components/ui/button';
import { medusaGet, formatMoney } from '@/lib/medusa';

export const metadata: Metadata = {
  title: 'Your order',
  description: 'What the atelier has, and what happens next.',
};

type ApiOrder = {
  id: string;
  display_id?: number;
  email?: string | null;
  currency_code: string;
  total: number;
  items?: { id: string; title: string; subtitle?: string | null; total: number; thumbnail?: string | null; variant?: { product?: { thumbnail?: string | null } | null } | null; metadata?: Record<string, unknown> | null }[];
  shipping_address?: { city?: string | null; country_code?: string | null } | null;
};

/* An order is readable by its id alone: the client has just been given it, and
   asking a guest to make an account to read their own receipt would be rude.
   The id is unguessable, and nothing here is worth guessing for. */
export default async function OrderPage(props: PageProps<'/order/[id]'>) {
  const { id } = await props.params;
  const body = await medusaGet<{ order: ApiOrder }>(
    `/store/orders/${id}?fields=id,display_id,email,currency_code,total,*items,*items.variant.product,*shipping_address`,
    0,
  );
  const order = body?.order;
  if (!order) notFound();

  const isCommission = (order.items ?? []).some((item) => item.metadata?.commission_id);

  return (
    <DocPage
      eyebrow="The house"
      title="Thank you — it is with the atelier"
      lead={
        isCommission
          ? 'Your commission is paid for and the bench has it. A pattern is drawn to your sheet before anything is cut.'
          : 'Your order is paid for. Nothing is cut until the atelier has read your sheet and written back to confirm it.'
      }
      foot={
        <>
          <ButtonLink href="/collection" variant="outline">Enter the collection</ButtonLink>
          <ButtonLink href="/care/questions" variant="rule">Questions</ButtonLink>
        </>
      }
    >
      <DocSection title={`Order ${order.display_id ? `no. ${order.display_id}` : order.id}`}>
        {(order.items ?? []).map((item) => (
          <div
            key={item.id}
            style={{ display: 'grid', gridTemplateColumns: '54px 1fr', gap: 14, alignItems: 'start' }}
          >
            <ShotFrame
              src={item.thumbnail ?? item.variant?.product?.thumbnail ?? undefined}
              alt={item.title}
              ratio="3 / 4"
            />
            <DocP>
              {item.title} — {formatMoney(item.total, order.currency_code)}
              {item.metadata?.fabric_name ? ` · ${String(item.metadata.fabric_name)}` : ''}
            </DocP>
          </div>
        ))}
        <DocP>
          Paid in full: {formatMoney(order.total, order.currency_code)}. A written
          confirmation is on its way to {order.email ?? 'your email'}.
        </DocP>
      </DocSection>

      <DocSection title="What happens next">
        <DocP>
          {isCommission
            ? 'Two to four weeks at the bench from today.'
            : 'The atelier writes within two days to confirm your measurement sheet. Cutting begins once you have agreed it, and takes two to four weeks.'}
        </DocP>
        <DocP>
          Anything to change, or a question about the sheet — write to{' '}
          <Link href="/contact" style={{ borderBottom: '1px solid var(--gold-60)' }}>
            the house
          </Link>{' '}
          and quote this order.
        </DocP>
      </DocSection>
    </DocPage>
  );
}
