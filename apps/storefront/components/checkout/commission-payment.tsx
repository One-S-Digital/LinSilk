'use client';

import { useEffect, useState } from 'react';
import { CheckoutFlow } from '@/components/checkout/checkout-flow';
import { Button } from '@/components/ui/button';
import { cartToResume } from '@/lib/checkout';
import { medusaFetch, formatMoney } from '@/lib/medusa';
import styles from '@/app/checkout/checkout.module.css';

/* Accepting a quote.
 *
 * The client has an email with a figure and a link. Where the piece is going
 * decides the currency and the shipping, so it is the first thing asked —
 * and the cart is built once that is known, in the region that applies. */

type ApiCommission = {
  id: string;
  status: string;
  name: string;
  silhouette_title: string;
  fabric: string;
  note: string | null;
  quote_amount: number | null;
  currency_code: string;
  cart_id: string | null;
  paid_at: string | null;
};

/* The only statuses a quote is still open to being paid at. Every other
   status is refused, `quote_amount` notwithstanding, because a status can
   outlive the figure that was set when it was reached — a declined
   commission still carries whatever `quote_amount` it had before it was
   declined. apps/medusa/src/lib/archive.ts carries the same list, for the
   same reason, on the route this page calls into. */
const PAYABLE_STATUSES = ['quoted', 'approved'];

const COUNTRIES: { code: string; name: string }[] = [
  { code: 'ch', name: 'Switzerland' },
  { code: 'at', name: 'Austria' },
  { code: 'be', name: 'Belgium' },
  { code: 'de', name: 'Germany' },
  { code: 'dk', name: 'Denmark' },
  { code: 'es', name: 'Spain' },
  { code: 'fr', name: 'France' },
  { code: 'ie', name: 'Ireland' },
  { code: 'it', name: 'Italy' },
  { code: 'lu', name: 'Luxembourg' },
  { code: 'nl', name: 'Netherlands' },
  { code: 'pt', name: 'Portugal' },
  { code: 'se', name: 'Sweden' },
  { code: 'gb', name: 'United Kingdom' },
  { code: 'us', name: 'United States' },
  { code: 'sg', name: 'Singapore' },
  { code: 'jp', name: 'Japan' },
  { code: 'au', name: 'Australia' },
];

export function CommissionPayment({ token }: { token: string }) {
  const [commission, setCommission] = useState<ApiCommission | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const [country, setCountry] = useState('ch');
  const [cartId, setCartId] = useState<string | null>(null);
  const [opening, setOpening] = useState(false);

  useEffect(() => {
    medusaFetch<{ commission: ApiCommission }>(`/store/commissions/${token}`)
      .then(({ commission: found }) => {
        setCommission(found);
        /* Back from confirming a payment elsewhere (TWINT, a bank): the cart
           behind it is the one to finish, in the region it was made in.
           Asking where the piece is going again would replace that cart. */
        setCartId(cartToResume(found.cart_id, window.location.search));
      })
      .catch((error) => setProblem((error as Error).message));
  }, [token]);

  const open = async () => {
    setOpening(true);
    setProblem(null);
    try {
      const { cart_id } = await medusaFetch<{ cart_id: string }>(
        `/store/commissions/${token}/cart`,
        { method: 'POST', json: { country_code: country } },
      );
      setCartId(cart_id);
    } catch (error) {
      setProblem((error as Error).message);
    } finally {
      setOpening(false);
    }
  };

  if (problem && !commission) {
    return (
      <p className={styles.answer}>
        {problem} If you believe this is a mistake, write to hello@linsilk.ch.
      </p>
    );
  }
  if (!commission) return null;

  if (commission.paid_at) {
    return (
      <p className={styles.answer}>
        This commission is paid for and is with the bench. Four to six weeks from the
        day it was settled. Write to hello@linsilk.ch if anything needs changing.
      </p>
    );
  }

  if (!commission.quote_amount) {
    return (
      <p className={styles.answer}>
        A tailor is still reading your brief. The figure comes by email, usually
        within two working days.
      </p>
    );
  }

  if (!PAYABLE_STATUSES.includes(commission.status)) {
    return (
      <p className={styles.answer}>
        {commission.status === 'declined'
          ? 'This commission was declined. Write to hello@linsilk.ch if you believe this is a mistake.'
          : 'This commission is not ready to pay for yet. Write to hello@linsilk.ch if you expected otherwise.'}
      </p>
    );
  }

  const brief = (
    <section className={styles.section}>
      <div className={styles.sectionHead}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionNum}>00</span> What was agreed
        </h2>
      </div>
      <p className={styles.answer}>
        {commission.silhouette_title} in {commission.fabric}, cut to the sheet you sent.
        {commission.note ? ` “${commission.note}”` : ''}
        <br />
        Quoted at {formatMoney(commission.quote_amount, commission.currency_code)}. That
        figure does not change; where the piece is sent decides the currency and the
        shipping.
      </p>
    </section>
  );

  if (!cartId) {
    return (
      <div className={styles.layout}>
        <div>
          {brief}
          <section className={styles.section}>
            <div className={styles.sectionHead}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionNum}>01</span> Where is it going
              </h2>
            </div>
            <div className={styles.body}>
              <div className={styles.fields}>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="commission-country">Country</label>
                  <select
                    id="commission-country"
                    className={styles.select}
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    autoComplete="country"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              {problem && <p className={styles.fieldError}>{problem}</p>}
              <div className={styles.continue}>
                <Button onClick={open} disabled={opening}>
                  {opening ? 'One moment…' : 'Accept and continue'}
                </Button>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return <CheckoutFlow cartId={cartId} intro={brief} allowRegionChange={false} />;
}
