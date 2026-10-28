'use client';

import { useEffect, useState } from 'react';
import { CheckoutFlow } from '@/components/checkout/checkout-flow';
import { Button } from '@/components/ui/button';
import { cartToResume } from '@/lib/checkout';
import { commissionText } from '@/lib/i18n-commission';
import { accountText } from '@/lib/i18n-account';
import { medusaFetch, formatMoney } from '@/lib/medusa';
import { useLang } from '@/lib/use-lang';
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

const COUNTRY_CODES = ['ch', 'at', 'be', 'de', 'dk', 'es', 'fr', 'ie', 'it', 'lu', 'nl', 'pt', 'se', 'gb', 'us', 'sg', 'jp', 'au'];

export function CommissionPayment({ token }: { token: string }) {
  const lang = useLang();
  const t = commissionText(lang).pay;
  const countries = accountText(lang).address.countries;
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
        {problem} {t.mistake}
      </p>
    );
  }
  if (!commission) return null;

  if (commission.paid_at) {
    return (
      <p className={styles.answer}>
        {t.paid}
      </p>
    );
  }

  if (!commission.quote_amount) {
    return (
      <p className={styles.answer}>
        {t.reading}
      </p>
    );
  }

  if (!PAYABLE_STATUSES.includes(commission.status)) {
    return (
      <p className={styles.answer}>
        {commission.status === 'declined' ? t.declined : t.notReady}
      </p>
    );
  }

  const brief = (
    <section className={styles.section}>
      <div className={styles.sectionHead}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionNum}>00</span> {t.agreed}
        </h2>
      </div>
      <p className={styles.answer}>
        {t.summary(commission.silhouette_title, commission.fabric, commission.note ?? '')}
        <br />
        {t.quoted(formatMoney(commission.quote_amount, commission.currency_code))}
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
                <span className={styles.sectionNum}>01</span> {t.where}
              </h2>
            </div>
            <div className={styles.body}>
              <div className={styles.fields}>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="commission-country">{t.country}</label>
                  <select
                    id="commission-country"
                    className={styles.select}
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    autoComplete="country"
                  >
                    {COUNTRY_CODES.map((code) => (
                      <option key={code} value={code}>{countries[code]}</option>
                    ))}
                  </select>
                </div>
              </div>
              {problem && <p className={styles.fieldError}>{problem}</p>}
              <div className={styles.continue}>
                <Button onClick={open} disabled={opening}>
                  {opening ? t.moment : t.accept}
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
