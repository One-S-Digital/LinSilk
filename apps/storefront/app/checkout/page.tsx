'use client';

import { CheckoutFlow } from '@/components/checkout/checkout-flow';
import { ButtonLink } from '@/components/ui/button';
import { useCart } from '@/lib/cart';
import styles from './checkout.module.css';

export default function CheckoutPage() {
  const { cartId, count, ready, clear } = useCart();

  if (!ready) {
    return (
      <div className={styles.page}>
        <h1 className={styles.title}>Checkout</h1>
      </div>
    );
  }

  if (!cartId || count === 0) {
    return (
      <div className={styles.page}>
        <h1 className={styles.title}>Checkout</h1>
        <div className={styles.empty}>
          <p
            style={{
              fontSize: 'var(--t-body)',
              color: 'var(--ink-secondary)',
              maxWidth: '40ch',
              lineHeight: 1.8,
            }}
          >
            There is nothing to check out. Reserve a piece from the season, or begin a
            commission, and it will appear here.
          </p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 28 }}>
            <ButtonLink href="/collection" variant="outline">Enter the collection</ButtonLink>
            <ButtonLink href="/design" variant="rule">Begin a commission</ButtonLink>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Checkout</h1>
      <CheckoutFlow cartId={cartId} onOrdered={clear} />
    </div>
  );
}
