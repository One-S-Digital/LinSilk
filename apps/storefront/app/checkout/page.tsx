'use client';

import { CheckoutFlow } from '@/components/checkout/checkout-flow';
import { ButtonLink } from '@/components/ui/button';
import { useCart } from '@/lib/cart';
import { shopText } from '@/lib/i18n-shop';
import { localHref } from '@/lib/locale-routes';
import { useLang } from '@/lib/use-lang';
import styles from './checkout.module.css';

export default function CheckoutPage() {
  const { cartId, count, ready, clear } = useCart();
  const lang = useLang();
  const t = shopText(lang).checkout;
  const c = shopText(lang).cart;

  if (!ready) {
    return (
      <div className={styles.page}>
        <h1 className={styles.title}>{t.title}</h1>
      </div>
    );
  }

  if (!cartId || count === 0) {
    return (
      <div className={styles.page}>
        <h1 className={styles.title}>{t.title}</h1>
        <div className={styles.empty}>
          <p
            style={{
              fontSize: 'var(--t-body)',
              color: 'var(--ink-secondary)',
              maxWidth: '40ch',
              lineHeight: 1.8,
            }}
          >
            {t.nothing}
          </p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 28 }}>
            <ButtonLink href={localHref(lang, '/collection')} variant="outline">{c.enter}</ButtonLink>
            <ButtonLink href={localHref(lang, '/design')} variant="rule">{t.begin}</ButtonLink>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{t.title}</h1>
      <CheckoutFlow cartId={cartId} onOrdered={clear} />
    </div>
  );
}
