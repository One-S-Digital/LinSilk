'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShotFrame } from '@/components/shot';
import { Button } from '@/components/ui/button';
import { PaymentPanel, stripeClient } from '@/components/checkout/payment-panel';
import {
  applyPromoCode,
  chooseShipping,
  completeCart,
  getCart,
  getPaymentProviders,
  getShippableCountries,
  getShippingOptions,
  PAYMENT_RETURN_PARAM,
  removePromoCode,
  startPayment,
  updateCart,
  type ShippableCountry,
  type ApiCheckoutCart,
  type ApiPaymentSession,
  type ApiShippingOption,
} from '@/lib/checkout';
import { formatMoney } from '@/lib/medusa';
import styles from '@/app/checkout/checkout.module.css';

/* Checkout, in three sections: where it goes, how it travels, and paying for
   it. The same flow serves a season's orders and a commission a tailor
   has already priced — the difference is only what is in the cart.

   Every figure comes from the backend. Nothing here adds a total up itself. */

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
  postcode: '', city: '', country: '', phone: '',
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

export function CheckoutFlow({
  cartId,
  onOrdered,
  intro,
  /* A cart of seasonal pieces can follow the client to another region: its
     lines are rebuilt from their variants, keeping their sheets and taking
     that region's prices. A commission cannot — its line is a run of one, and
     Medusa drops what it cannot rebuild — so its country is settled before
     the cart is made and cannot be changed here. */
  allowRegionChange = true,
}: {
  cartId: string;
  /** Runs once the order exists — the seasonal cart forgets itself here. */
  onOrdered?: () => void;
  intro?: React.ReactNode;
  allowRegionChange?: boolean;
}) {
  const router = useRouter();
  const [cart, setCart] = useState<ApiCheckoutCart | null>(null);
  const [options, setOptions] = useState<ApiShippingOption[]>([]);
  const [session, setSession] = useState<ApiPaymentSession | null>(null);
  const [details, setDetails] = useState<Details>(EMPTY);
  const [open, setOpen] = useState(0);
  const [touched, setTouched] = useState(false);
  const [working, setWorking] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [promoInput, setPromoInput] = useState('');
  const [promoProblem, setPromoProblem] = useState<string | null>(null);
  const [shippable, setShippable] = useState<ShippableCountry[]>([]);
  /** True only while a redirect-based payment method's return is being read
      back; see the effect below. Never true on an ordinary page load. */
  const [resuming, setResuming] = useState(false);

  useEffect(() => {
    if (!allowRegionChange) return;
    getShippableCountries()
      .then(setShippable)
      .catch(() => setShippable([]));
  }, [allowRegionChange]);

  useEffect(() => {
    getCart(cartId)
      .then((found) => {
        setCart(found);
        setDetails((current) => ({
          ...current,
          email: found.email ?? current.email,
          firstName: found.shipping_address?.first_name ?? current.firstName,
          lastName: found.shipping_address?.last_name ?? current.lastName,
          address1: found.shipping_address?.address_1 ?? current.address1,
          address2: found.shipping_address?.address_2 ?? current.address2,
          postcode: found.shipping_address?.postal_code ?? current.postcode,
          city: found.shipping_address?.city ?? current.city,
          phone: found.shipping_address?.phone ?? current.phone,
          country:
            found.shipping_address?.country_code ??
            found.region?.countries?.[0]?.iso_2 ??
            current.country,
        }));
      })
      .catch((error) => setProblem((error as Error).message));
  }, [cartId]);

  const countries =
    allowRegionChange && shippable.length
      ? shippable
      : (cart?.region?.countries ?? []).map((c) => ({ ...c, region_id: cart!.region!.id }));

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
  const money = (amount: number) => formatMoney(amount, cart?.currency_code ?? 'chf');

  const saveDetails = async () => {
    setTouched(true);
    if (!detailsValid || !cart) return;
    setWorking(true);
    setProblem(null);
    const address = {
      first_name: details.firstName,
      last_name: details.lastName,
      address_1: details.address1,
      address_2: details.address2 || undefined,
      postal_code: details.postcode,
      city: details.city,
      country_code: details.country,
      phone: details.phone,
    };
    try {
      /* Where it goes decides the currency and the shipping, so the cart
         follows the address before the address is saved to it. */
      const destination = countries.find((c) => c.iso_2 === details.country);
      if (allowRegionChange && destination && destination.region_id !== cart.region?.id) {
        await updateCart(cart.id, { region_id: destination.region_id });
      }

      const updated = await updateCart(cart.id, {
        email: details.email,
        shipping_address: address,
        billing_address: address,
      });
      setCart(updated);
      setOptions(await getShippingOptions(updated.id));
      setOpen(1);
    } catch (error) {
      setProblem((error as Error).message);
    } finally {
      setWorking(false);
    }
  };

  /* A code changes the total, so it is settled before payment starts: once a
     payment session exists its amount is fixed, and going back to an earlier
     section and forward again is what refreshes it. */
  const applyPromo = async () => {
    const code = promoInput.trim();
    if (!code || !cart) return;
    setWorking(true);
    setPromoProblem(null);
    try {
      const updated = await applyPromoCode(cart.id, code);
      if (updated.promotions?.some((p) => p.code?.toLowerCase() === code.toLowerCase())) {
        setCart(updated);
        setPromoInput('');
      } else {
        setPromoProblem('That code is not valid for this order.');
      }
    } catch (error) {
      setPromoProblem((error as Error).message);
    } finally {
      setWorking(false);
    }
  };

  const dropPromo = async (code: string) => {
    if (!cart) return;
    setWorking(true);
    setPromoProblem(null);
    try {
      setCart(await removePromoCode(cart.id, code));
    } catch (error) {
      setPromoProblem((error as Error).message);
    } finally {
      setWorking(false);
    }
  };

  const pickShipping = async (optionId: string) => {
    if (!cart) return;
    setWorking(true);
    setProblem(null);
    try {
      setCart(await chooseShipping(cart.id, optionId));
    } catch (error) {
      setProblem((error as Error).message);
    } finally {
      setWorking(false);
    }
  };

  const toPayment = async () => {
    if (!cart) return;
    setWorking(true);
    setProblem(null);
    try {
      /* Stripe when the house has it; the system provider only while it does
         not, and never alongside. The Stripe plugin also registers
         single-method providers (Bancontact, iDEAL...) that accept euros
         only, so it is the main one, by id, and never "any with stripe in
         the name": a franc cart sent to Bancontact fails at Stripe. */
      const providers = await getPaymentProviders(cart.region!.id);
      const preferred =
        providers.find((p) => p.id === 'pp_stripe_stripe')?.id ??
        providers.find((p) => !p.id.includes('stripe'))?.id;
      if (!preferred) {
        throw new Error('The house cannot take payment on this region yet.');
      }
      setSession(await startPayment(cart, preferred));
      setOpen(2);
    } catch (error) {
      setProblem((error as Error).message);
    } finally {
      setWorking(false);
    }
  };

  /* The money is authorised; now the cart becomes an order. */
  const placeOrder = useCallback(async () => {
    const result = await completeCart(cartId);
    if (result.type !== 'order') {
      throw new Error(
        result.error?.message ?? 'The order could not be placed. Nothing has been charged.',
      );
    }
    onOrdered?.();
    router.push(`/order/${result.order.id}`);
  }, [cartId, onOrdered, router]);

  /* A card stays on this page to pay; TWINT, a bank or a wallet sends the
     client away to confirm and back again — Stripe's `return_url` is this
     same page. That is a fresh page load: this component remounts with no
     memory of having been mid-payment, `open` starts at 0, and without this,
     the client would simply see the address form again while the money sits
     authorised and no order exists to show for it. The PaymentIntent Stripe
     hands back in the URL is the only record that survived the trip, so it
     is read back and the cart is completed from it before anything else
     renders — `completeCart` is the same call the in-page flow makes, so a
     client who gets here twice (a refresh, a second tab) is no worse off
     than retrying any other step. */
  useEffect(() => {
    const clientSecret = new URLSearchParams(window.location.search).get(PAYMENT_RETURN_PARAM);
    if (!clientSecret) return;

    (async () => {
      setResuming(true);
      window.history.replaceState(null, '', window.location.pathname);
      try {
        const stripe = await stripeClient();
        const retrieved = await stripe?.retrievePaymentIntent(clientSecret);
        const status = retrieved?.paymentIntent?.status;
        if (status === 'succeeded' || status === 'processing') {
          await placeOrder();
          return;
        }
        setProblem(
          retrieved?.error?.message ?? 'The payment was not completed. Nothing has been charged.',
        );
      } catch (error) {
        setProblem((error as Error).message);
      } finally {
        setResuming(false);
      }
    })();
  }, [placeOrder]);

  if (resuming) {
    return <p className={styles.answer}>Confirming your payment…</p>;
  }

  if (problem && !cart) {
    return <p className={styles.answer}>{problem}</p>;
  }
  if (!cart) return null;

  const chosenShipping = cart.shipping_methods?.[0];
  const promoCodes = (cart.promotions ?? []).flatMap((p) => (p.code ? [p.code] : []));
  /* The promotion's cut of the pieces alone: `discount_total` also counts a
     discount on shipping, which `shipping_total` already shows. */
  const discount =
    cart.original_item_total != null
      ? Math.max(cart.original_item_total - cart.item_total, 0)
      : (cart.discount_total ?? 0);

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
        onChange={(e) => setDetails((d) => ({ ...d, [key]: e.target.value }))}
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

  return (
    <div className={styles.layout}>
      <div>
        {intro}

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
                    onChange={(e) => setDetails((d) => ({ ...d, country: e.target.value }))}
                    autoComplete="country"
                  >
                    {countries.map((c) => (
                      <option key={c.iso_2} value={c.iso_2}>
                        {c.display_name}
                      </option>
                    ))}
                  </select>
                </div>
                {field('phone', 'tel')}
              </div>
              <p className={styles.answer}>
                A telephone number is required by the courier for customs clearance.
                It is not used for anything else.
              </p>
              <div className={styles.continue}>
                <Button onClick={saveDetails} disabled={working}>
                  {working ? 'Saving…' : 'Continue to shipping'}
                </Button>
              </div>
            </div>
          ) : (
            detailsValid && (
              <p className={styles.answer}>
                {details.firstName} {details.lastName} · {details.address1}
                {details.address2 ? `, ${details.address2}` : ''} · {details.postcode}{' '}
                {details.city} · {countries.find((c) => c.iso_2 === details.country)?.display_name}
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
                {options.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={chosenShipping?.name === option.name}
                    className={styles.choice}
                    onClick={() => pickShipping(option.id)}
                  >
                    <span className={styles.radio} aria-hidden="true" />
                    <span>
                      <span className={styles.choiceName}>{option.name}</span>
                      <span className={styles.choiceNote}>{option.type?.description}</span>
                    </span>
                    <span className={styles.choicePrice}>
                      {option.amount === 0 ? 'Included' : money(option.amount)}
                    </span>
                  </button>
                ))}
                {options.length === 0 && (
                  <p className={styles.answer}>
                    The house does not ship to that address yet. Write to
                    hello@bylinsilk.com and the atelier will arrange it.
                  </p>
                )}
              </div>
              <div className={styles.continue}>
                <Button onClick={toPayment} disabled={!chosenShipping || working}>
                  {working ? 'One moment…' : 'Continue to payment'}
                </Button>
              </div>
            </div>
          ) : (
            open > 1 &&
            chosenShipping && (
              <p className={styles.answer}>
                {chosenShipping.name} —{' '}
                {chosenShipping.amount === 0 ? 'included' : money(chosenShipping.amount)}
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

          {open === 2 && session && (
            <div className={styles.body}>
              <PaymentPanel
                session={session}
                amountLabel={money(cart.total)}
                onPaid={placeOrder}
              />
            </div>
          )}
        </section>

        {problem && <p className={styles.fieldError}>{problem}</p>}
      </div>

      {/* ---- What is being paid for ---- */}
      <aside className={styles.aside}>
        <div className={styles.asideHead}>Your order</div>

        <div className={styles.asideLines}>
          {(cart.items ?? []).map((item) => (
            <div key={item.id} className={styles.asideLine}>
              <ShotFrame
                src={item.thumbnail ?? item.variant?.product?.thumbnail ?? undefined}
                alt={item.title}
                ratio="3 / 4"
              />
              <div>
                <div className={styles.asideName}>{item.title}</div>
                <div className={styles.asideMeta}>
                  {/* The cloth: chosen from a picker for a seasonal piece,
                      written in their own words for a commission. */}
                  {String(
                    item.metadata?.fabric_name ??
                      item.variant?.product?.subtitle ??
                      item.subtitle ??
                      '',
                  )}
                </div>
              </div>
              <span className={styles.asidePrice}>{money(item.total)}</span>
            </div>
          ))}
        </div>

        <div className={styles.promo}>
          {promoCodes.map((code) => (
            <div key={code} className={styles.promoApplied}>
              <span>Code {code}</span>
              {open !== 2 && (
                <button
                  type="button"
                  className={styles.edit}
                  onClick={() => dropPromo(code)}
                  disabled={working}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          {promoCodes.length === 0 && open !== 2 && (
            <form
              className={styles.promoForm}
              onSubmit={(e) => {
                e.preventDefault();
                void applyPromo();
              }}
            >
              <label className={styles.label} htmlFor="co-promo">
                Promo code
              </label>
              <div className={styles.promoRow}>
                <input
                  id="co-promo"
                  className={styles.input}
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  aria-invalid={Boolean(promoProblem)}
                />
                <button
                  type="submit"
                  className={styles.edit}
                  disabled={working || !promoInput.trim()}
                >
                  Apply
                </button>
              </div>
            </form>
          )}
          {promoProblem && <span className={styles.fieldError}>{promoProblem}</span>}
        </div>

        <div className={styles.totals}>
          <div className={styles.totalRow}>
            <span>Subtotal</span>
            <span className={styles.totalValue}>
              {money(cart.original_item_total ?? cart.item_total)}
            </span>
          </div>
          {discount > 0 && (
            <div className={styles.totalRow}>
              <span>Discount</span>
              <span className={styles.totalValue}>−{money(discount)}</span>
            </div>
          )}
          <div className={styles.totalRow}>
            <span>Shipping{chosenShipping ? ` — ${chosenShipping.name}` : ''}</span>
            <span className={styles.totalValue}>
              {cart.shipping_total === 0 ? 'Included' : money(cart.shipping_total)}
            </span>
          </div>
          <div className={`${styles.totalRow} ${styles.grand}`}>
            <span>Total</span>
            <span className={styles.totalValue}>{money(cart.total)}</span>
          </div>
        </div>

        <p className={styles.reassure}>
          Nothing is cut until the atelier has confirmed your measurement sheet in
          writing.
        </p>
      </aside>
    </div>
  );
}
