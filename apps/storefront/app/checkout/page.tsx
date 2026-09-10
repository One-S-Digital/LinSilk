'use client';

import { useMemo, useState } from 'react';
import { ShotFrame } from '@/components/shot';
import { Button, ButtonLink } from '@/components/ui/button';
import { useCart } from '@/lib/cart';
import { findPiece, money } from '@/lib/catalog';
import styles from './checkout.module.css';

/* Shipping is quoted from Zürich. Duty is included inside Switzerland and the
   EU, as the house states; everywhere else it is payable on arrival and we say
   so rather than surprising someone at the door. */
const SHIPPING = [
  { key: 'ch', name: 'Switzerland', note: 'Two to three days, duty included.', price: 0 },
  { key: 'eu', name: 'European Union', note: 'Three to six days, duty included.', price: 0 },
  {
    key: 'row',
    name: 'Rest of world',
    note: 'Five to ten days. Duties and import tax are payable on arrival.',
    price: 60,
  },
] as const;

const COUNTRIES = [
  'Switzerland', 'Austria', 'Belgium', 'Denmark', 'France', 'Germany', 'Ireland',
  'Italy', 'Luxembourg', 'Netherlands', 'Portugal', 'Spain', 'Sweden',
  'United Kingdom', 'United States', 'Singapore', 'Japan', 'Australia',
];

type Details = {
  email: string;
  firstName: string;
  lastName: string;
  address1: string;
  address2: string;
  postcode: string;
  city: string;
  country: string;
  phone: string;
};

const EMPTY: Details = {
  email: '', firstName: '', lastName: '', address1: '', address2: '',
  postcode: '', city: '', country: 'Switzerland', phone: '',
};

const REQUIRED: (keyof Details)[] = [
  'email', 'firstName', 'lastName', 'address1', 'postcode', 'city', 'country', 'phone',
];

const LABELS: Record<keyof Details, string> = {
  email: 'Email', firstName: 'First name', lastName: 'Last name',
  address1: 'Address', address2: 'Apartment, floor (optional)',
  postcode: 'Postcode', city: 'City', country: 'Country',
  phone: 'Telephone',
};

export default function CheckoutPage() {
  const { lines, ready, subtotal, hasEstimate } = useCart();
  const [open, setOpen] = useState(0);
  const [details, setDetails] = useState<Details>(EMPTY);
  const [touched, setTouched] = useState(false);
  const [shipping, setShipping] = useState<string>('ch');

  const method = SHIPPING.find((s) => s.key === shipping)!;
  const total = subtotal + method.price;

  const errors = useMemo(() => {
    const out: Partial<Record<keyof Details, string>> = {};
    for (const key of REQUIRED) {
      if (!details[key].trim()) out[key] = 'Required';
    }
    if (details.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email)) {
      out.email = 'Check this address';
    }
    return out;
  }, [details]);

  const detailsValid = Object.keys(errors).length === 0;

  const set = (key: keyof Details) => (value: string) =>
    setDetails((d) => ({ ...d, [key]: value }));

  const field = (key: keyof Details, type = 'text', full = false) => (
    <div className={`${styles.field}${full ? ` ${styles.full}` : ''}`}>
      <label className={styles.label} htmlFor={`co-${key}`}>
        {LABELS[key]}
      </label>
      <input
        id={`co-${key}`}
        className={styles.input}
        type={type}
        value={details[key]}
        onChange={(e) => set(key)(e.target.value)}
        aria-invalid={touched && Boolean(errors[key])}
        autoComplete={
          key === 'email' ? 'email'
            : key === 'firstName' ? 'given-name'
            : key === 'lastName' ? 'family-name'
            : key === 'address1' ? 'address-line1'
            : key === 'address2' ? 'address-line2'
            : key === 'postcode' ? 'postal-code'
            : key === 'city' ? 'address-level2'
            : key === 'phone' ? 'tel'
            : 'off'
        }
      />
      {touched && errors[key] && <span className={styles.fieldError}>{errors[key]}</span>}
    </div>
  );

  if (ready && lines.length === 0) {
    return (
      <div className={styles.page}>
        <h1 className={styles.title}>Checkout</h1>
        <div className={styles.empty}>
          <p style={{ fontSize: 'var(--t-body)', color: 'var(--ink-secondary)', maxWidth: '40ch', lineHeight: 1.8 }}>
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

      <div className={styles.layout}>
        <div>
          {/* ---- 01 · Where it goes ---- */}
          <section className={styles.section}>
            <div className={styles.sectionHead}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionNum}>01</span> Where it goes
              </h2>
              {open !== 0 && detailsValid && (
                <button type="button" className={styles.edit} onClick={() => setOpen(0)}>
                  Edit
                </button>
              )}
            </div>

            {open === 0 ? (
              <div className={styles.body}>
                <div className={styles.fields}>
                  {field('email', 'email', true)}
                  {field('firstName')}
                  {field('lastName')}
                  {field('address1', 'text', true)}
                  {field('address2', 'text', true)}
                  {field('postcode')}
                  {field('city')}
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="co-country">Country</label>
                    <select
                      id="co-country"
                      className={styles.select}
                      value={details.country}
                      onChange={(e) => set('country')(e.target.value)}
                      autoComplete="country-name"
                    >
                      {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  {field('phone', 'tel')}
                </div>
                <p className={styles.answer}>
                  A telephone number is required by the courier for customs clearance
                  out of Việt Nam. It is not used for anything else.
                </p>
                <div className={styles.continue}>
                  <Button
                    onClick={() => {
                      setTouched(true);
                      if (detailsValid) setOpen(1);
                    }}
                  >
                    Continue to shipping
                  </Button>
                </div>
              </div>
            ) : (
              detailsValid && (
                <p className={styles.answer}>
                  {details.firstName} {details.lastName} · {details.address1}
                  {details.address2 ? `, ${details.address2}` : ''} · {details.postcode}{' '}
                  {details.city} · {details.country}
                  <br />
                  {details.email}
                </p>
              )
            )}
          </section>

          {/* ---- 02 · How it travels ---- */}
          <section className={styles.section}>
            <div className={styles.sectionHead}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionNum}>02</span> How it travels
              </h2>
              {open !== 1 && open > 1 && (
                <button type="button" className={styles.edit} onClick={() => setOpen(1)}>
                  Edit
                </button>
              )}
            </div>

            {open === 1 ? (
              <div className={styles.body}>
                <div className={styles.choices} role="radiogroup" aria-label="Shipping">
                  {SHIPPING.map((option) => (
                    <button
                      key={option.key}
                      type="button"
                      role="radio"
                      aria-checked={shipping === option.key}
                      className={styles.choice}
                      onClick={() => setShipping(option.key)}
                    >
                      <span className={styles.radio} aria-hidden="true" />
                      <span>
                        <span className={styles.choiceName}>{option.name}</span>
                        <span className={styles.choiceNote}>{option.note}</span>
                      </span>
                      <span className={styles.choicePrice}>
                        {option.price === 0 ? 'Included' : money(option.price)}
                      </span>
                    </button>
                  ))}
                </div>
                <div className={styles.continue}>
                  <Button onClick={() => setOpen(2)}>Continue to payment</Button>
                </div>
              </div>
            ) : (
              open > 1 && (
                <p className={styles.answer}>
                  {method.name} — {method.price === 0 ? 'included' : money(method.price)}
                </p>
              )
            )}
          </section>

          {/* ---- 03 · Payment ---- */}
          <section className={styles.section}>
            <div className={styles.sectionHead}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionNum}>03</span> Payment
              </h2>
            </div>

            {open === 2 && (
              <div className={styles.body}>
                {/* Card details are never handled by this application. Stripe
                    Elements mounts here and the card fields live inside Stripe's
                    own iframe, so no card number ever touches our origin. */}
                <div className={styles.paymentMount} id="stripe-payment-element">
                  <span className={styles.paymentTag}>stripe elements mounts here</span>
                  <div className={styles.paymentTitle}>Card, TWINT or Apple&nbsp;Pay</div>
                  <p className={styles.paymentBody}>
                    Payment is taken through Stripe. Card details are entered inside
                    Stripe’s own secure frame and are never sent to, stored by, or
                    visible to Maison Ayla.
                  </p>
                  <p className={styles.paymentBody}>
                    Awaiting the Medusa payment session — this panel activates once the
                    backend is connected.
                  </p>
                </div>

                {hasEstimate && (
                  <p className={styles.answer}>
                    Your order contains a commission quoted as an estimate. Only the
                    confirmed seasonal pieces are charged now; the commission is
                    invoiced separately once the tailor has written to you and you have
                    agreed the figure.
                  </p>
                )}

                <div className={styles.continue}>
                  <Button disabled>Pay {money(total)}</Button>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* ---- Order summary ---- */}
        <aside className={styles.aside}>
          <div className={styles.asideHead}>Your order</div>

          <div className={styles.asideLines}>
            {lines.map((line) => {
              const piece = line.pieceId ? findPiece(line.pieceId) : undefined;
              return (
                <div key={line.id} className={styles.asideLine}>
                  <ShotFrame
                    weave={piece?.group === 'men' ? 'sand' : 'bone'}
                    ratio="3 / 4"
                  />
                  <div>
                    <div className={styles.asideName}>{line.name}</div>
                    <div className={styles.asideMeta}>
                      {line.fabricName}
                      {line.estimate ? ' · estimate' : ''}
                    </div>
                  </div>
                  <span className={styles.asidePrice}>{money(line.price)}</span>
                </div>
              );
            })}
          </div>

          <div className={styles.totals}>
            <div className={styles.totalRow}>
              <span>Subtotal</span>
              <span className={styles.totalValue}>{money(subtotal)}</span>
            </div>
            <div className={styles.totalRow}>
              <span>Shipping — {method.name}</span>
              <span className={styles.totalValue}>
                {method.price === 0 ? 'Included' : money(method.price)}
              </span>
            </div>
            <div className={`${styles.totalRow} ${styles.grand}`}>
              <span>Total</span>
              <span className={styles.totalValue}>{money(total)}</span>
            </div>
          </div>

          <p className={styles.reassure}>
            Nothing is cut until the atelier has confirmed your measurement sheet in
            writing. Alterations to a piece the house made are free for the first year.
          </p>
        </aside>
      </div>
    </div>
  );
}
