'use client';

import { useEffect, useMemo, useState } from 'react';
import { loadStripe, type Stripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import type { ApiPaymentSession } from '@/lib/checkout';
import styles from '@/app/checkout/checkout.module.css';

/* Payment.
 *
 * Card details are entered inside Stripe's own frame and never touch this
 * origin, which is the whole reason the fields are not ours to build. Which
 * methods appear — card, TWINT, Apple and Google Pay, Klarna — is decided by
 * the Stripe account for the currency and the amount, not here.
 *
 * Before Stripe has keys the backend offers its system provider, which
 * authorises without charging. That is how checkout is worked on; it can
 * never appear in production, because a region with a real provider drops the
 * system one. */

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '';

let stripePromise: Promise<Stripe | null> | null = null;
const stripeClient = () => {
  if (!publishableKey) return null;
  stripePromise ??= loadStripe(publishableKey);
  return stripePromise;
};

export function PaymentPanel({
  session,
  amountLabel,
  onPaid,
}: {
  session: ApiPaymentSession;
  amountLabel: string;
  /** Runs once the money is authorised; completing the cart is the caller's. */
  onPaid: () => Promise<void>;
}) {
  const isStripe = session.provider_id.includes('stripe');
  const clientSecret = session.data?.client_secret as string | undefined;
  const stripe = useMemo(() => (isStripe ? stripeClient() : null), [isStripe]);

  if (isStripe && stripe && clientSecret) {
    return (
      <Elements
        stripe={stripe}
        options={{
          clientSecret,
          appearance: {
            theme: 'flat',
            variables: {
              colorBackground: '#EDE6D9',
              colorText: '#2A2620',
              colorPrimary: '#9C7A44',
              fontFamily: 'Archivo, system-ui, sans-serif',
              borderRadius: '0px',
            },
          },
        }}
      >
        <StripeFields amountLabel={amountLabel} onPaid={onPaid} />
      </Elements>
    );
  }

  if (isStripe) {
    return (
      <p className={styles.answer}>
        Payment is not configured on this storefront yet. Write to
        hello@linsilk.ch and the atelier will take it from here.
      </p>
    );
  }

  return <SystemFields amountLabel={amountLabel} onPaid={onPaid} />;
}

function StripeFields({
  amountLabel,
  onPaid,
}: {
  amountLabel: string;
  onPaid: () => Promise<void>;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [paying, setPaying] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  const pay = async () => {
    if (!stripe || !elements) return;
    setPaying(true);
    setProblem(null);

    /* `if_required` keeps the client here for a card, and hands them to their
       bank or their wallet only when that method needs it. */
    const { error } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
      confirmParams: { return_url: `${window.location.origin}${window.location.pathname}` },
    });

    if (error) {
      setProblem(error.message ?? 'The payment was not taken. Nothing has been charged.');
      setPaying(false);
      return;
    }

    try {
      await onPaid();
    } catch (completion) {
      setProblem((completion as Error).message);
      setPaying(false);
    }
  };

  return (
    <>
      <div className={styles.paymentMount} id="stripe-payment-element">
        <PaymentElement options={{ layout: 'tabs' }} />
      </div>
      {problem && <p className={styles.fieldError}>{problem}</p>}
      <div className={styles.continue}>
        <Button onClick={pay} disabled={!stripe || paying}>
          {paying ? 'Taking payment…' : `Pay ${amountLabel}`}
        </Button>
      </div>
    </>
  );
}

/* The system provider: no money moves. Only reachable while the house has no
   Stripe keys. */
function SystemFields({
  amountLabel,
  onPaid,
}: {
  amountLabel: string;
  onPaid: () => Promise<void>;
}) {
  const [paying, setPaying] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  useEffect(() => {
    console.warn('Checkout is using Medusa’s system provider: no payment is taken.');
  }, []);

  const pay = async () => {
    setPaying(true);
    setProblem(null);
    try {
      await onPaid();
    } catch (error) {
      setProblem((error as Error).message);
      setPaying(false);
    }
  };

  return (
    <>
      <div className={styles.paymentMount}>
        <span className={styles.paymentTag}>no card is charged</span>
        <div className={styles.paymentTitle}>Standing in for Stripe</div>
        <p className={styles.paymentBody}>
          The house has no payment keys on this environment, so the order is placed
          without money moving. This cannot happen in production: a region with a real
          payment provider stops offering this one.
        </p>
      </div>
      {problem && <p className={styles.fieldError}>{problem}</p>}
      <div className={styles.continue}>
        <Button onClick={pay} disabled={paying}>
          {paying ? 'Placing…' : `Place the order — ${amountLabel}`}
        </Button>
      </div>
    </>
  );
}
