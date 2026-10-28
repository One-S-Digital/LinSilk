import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { DocPage, DocSection, DocP } from '@/components/doc-page';
import { ShotFrame } from '@/components/shot';
import { TrackEvent } from '@/components/track-event';
import { ButtonLink } from '@/components/ui/button';
import { fabricLabel } from '@/lib/i18n-order';
import { shopText } from '@/lib/i18n-shop';
import { localHref } from '@/lib/locale-routes';
import { medusaGet, formatMoney } from '@/lib/medusa';
import { pieceName } from '@/lib/piece-names';
import { serverLang } from '@/lib/server-lang';

export async function generateMetadata(): Promise<Metadata> {
  const t = shopText(await serverLang()).order;
  return { title: t.metaTitle, description: t.metaDescription };
}

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
  const lang = await serverLang();
  const t = shopText(lang).order;
  const body = await medusaGet<{ order: ApiOrder }>(
    `/store/orders/${id}?fields=id,display_id,email,currency_code,total,*items,*items.variant.product,*shipping_address`,
    0,
  );
  const order = body?.order;
  if (!order) notFound();

  const isCommission = (order.items ?? []).some((item) => item.metadata?.commission_id);

  return (
    <DocPage
      eyebrow={t.eyebrow}
      title={t.title}
      lead={
        isCommission ? t.leadCommission : t.lead
      }
      foot={
        <>
          <ButtonLink href={localHref(lang, '/collection')} variant="outline">{t.enter}</ButtonLink>
          <ButtonLink href={localHref(lang, '/care/questions')} variant="rule">{t.questions}</ButtonLink>
        </>
      }
    >
      <TrackEvent
        name="order_placed"
        once={`order-${order.id}`}
        data={{
          order: order.id,
          revenue: order.total,
          currency: order.currency_code.toUpperCase(),
        }}
      />
      <DocSection title={t.heading(order.display_id ? t.no(order.display_id) : order.id)}>
        {(order.items ?? []).map((item) => (
          <div
            key={item.id}
            style={{ display: 'grid', gridTemplateColumns: '54px 1fr', gap: 14, alignItems: 'start' }}
          >
            <ShotFrame
              src={item.thumbnail ?? item.variant?.product?.thumbnail ?? undefined}
              alt={pieceName(item.title, lang)}
              ratio="3 / 4"
            />
            <DocP>
              {pieceName(item.title, lang)} — {formatMoney(item.total, order.currency_code)}
              {item.metadata?.fabric_name
                ? ` · ${fabricLabel(String(item.metadata.fabric_key ?? ''), String(item.metadata.fabric_name), lang)}`
                : ''}
            </DocP>
          </div>
        ))}
        <DocP>
          {t.paid(formatMoney(order.total, order.currency_code), order.email ?? t.yourEmail)}
        </DocP>
      </DocSection>

      <DocSection title={t.next}>
        <DocP>
          {isCommission ? t.nextCommission : t.nextOrder}
        </DocP>
        <DocP>
          {t.change}{' '}
          <Link href={localHref(lang, '/contact')} style={{ borderBottom: '1px solid var(--gold-60)' }}>
            {t.theHouse}
          </Link>{' '}
          {t.quote}
        </DocP>
      </DocSection>
    </DocPage>
  );
}
