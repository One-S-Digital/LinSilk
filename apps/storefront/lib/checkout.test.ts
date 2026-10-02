import { describe, expect, it } from 'vitest';
import { PAYMENT_RETURN_PARAM, cartToResume } from './checkout';

/* A TWINT or bank payment sends the client away to confirm and back to the
   page they left. A commission page that forgets the cart on the way back
   shows the country form again, and asking for the default country replaces
   the cart the payment belongs to when the piece was going anywhere else. */

describe('cartToResume', () => {
  const returned = `?${PAYMENT_RETURN_PARAM}=pi_3Q_secret_abc&redirect_status=succeeded`;

  it('picks the cart up again when the client is back from confirming a payment', () => {
    /* A commission going to Germany: its cart is in the euro region, not the
       Swiss one the country form would default to. */
    expect(cartToResume('cart_eur_de', returned)).toBe('cart_eur_de');
  });

  it('asks where the piece is going when the link is opened afresh', () => {
    expect(cartToResume('cart_eur_de', '')).toBeNull();
    expect(cartToResume('cart_eur_de', '?utm_source=email')).toBeNull();
  });

  it('has nothing to pick up when no cart was ever opened', () => {
    expect(cartToResume(null, returned)).toBeNull();
  });
});
