/* The shapes checkout works in, and the calls it makes.
 *
 * Every figure shown to a client comes back from the backend: totals are
 * worked out where the prices live, not added up again in a browser. */

import { medusaFetch } from './medusa';

export type ApiAddress = {
  first_name?: string | null;
  last_name?: string | null;
  address_1?: string | null;
  address_2?: string | null;
  postal_code?: string | null;
  city?: string | null;
  country_code?: string | null;
  phone?: string | null;
};

export type ApiShippingOption = {
  id: string;
  name: string;
  amount: number;
  type?: { description?: string | null } | null;
};

export type ApiPaymentSession = { id: string; provider_id: string; data?: Record<string, unknown> };

export type ApiCheckoutCart = {
  id: string;
  email?: string | null;
  currency_code: string;
  region?: { id: string; name: string; countries?: { iso_2: string; display_name: string }[] } | null;
  items?: {
    id: string;
    title: string;
    subtitle?: string | null;
    unit_price: number;
    total: number;
    variant?: { product?: { subtitle?: string | null } | null } | null;
    metadata?: Record<string, unknown> | null;
  }[];
  shipping_address?: ApiAddress | null;
  shipping_methods?: { id: string; name: string; amount: number }[];
  item_total: number;
  shipping_total: number;
  total: number;
  completed_at?: string | null;
  payment_collection?: { id: string; payment_sessions?: ApiPaymentSession[] } | null;
};

const FIELDS = [
  'id', 'email', 'currency_code', 'item_total', 'shipping_total', 'total', 'completed_at',
  '*items', '*items.variant.product', '*shipping_address', '*shipping_methods',
  '*region', '*region.countries',
  '*payment_collection', '*payment_collection.payment_sessions',
].join(',');

export const getCart = async (id: string) =>
  (await medusaFetch<{ cart: ApiCheckoutCart }>(`/store/carts/${id}?fields=${FIELDS}`)).cart;

export const updateCart = async (id: string, json: Record<string, unknown>) =>
  (await medusaFetch<{ cart: ApiCheckoutCart }>(`/store/carts/${id}?fields=${FIELDS}`, {
    method: 'POST',
    json,
  })).cart;

export const getShippingOptions = async (cartId: string) =>
  (await medusaFetch<{ shipping_options: ApiShippingOption[] }>(
    `/store/shipping-options?cart_id=${cartId}`,
  )).shipping_options;

export const chooseShipping = async (cartId: string, optionId: string) =>
  (await medusaFetch<{ cart: ApiCheckoutCart }>(
    `/store/carts/${cartId}/shipping-methods?fields=${FIELDS}`,
    { method: 'POST', json: { option_id: optionId } },
  )).cart;

/* One payment collection per cart; asking twice returns the one that exists. */
export async function startPayment(cart: ApiCheckoutCart, providerId: string) {
  const collectionId =
    cart.payment_collection?.id ??
    (
      await medusaFetch<{ payment_collection: { id: string } }>('/store/payment-collections', {
        method: 'POST',
        json: { cart_id: cart.id },
      })
    ).payment_collection.id;

  const { payment_collection } = await medusaFetch<{
    payment_collection: { id: string; payment_sessions?: ApiPaymentSession[] };
  }>(`/store/payment-collections/${collectionId}/payment-sessions`, {
    method: 'POST',
    json: { provider_id: providerId },
  });

  return (payment_collection.payment_sessions ?? []).find((s) => s.provider_id === providerId)!;
}

export type Completion =
  | { type: 'order'; order: { id: string } }
  | { type: 'cart'; error?: { message?: string } };

export const completeCart = async (cartId: string) =>
  medusaFetch<Completion>(`/store/carts/${cartId}/complete`, { method: 'POST' });

/** Which providers a region offers, so checkout can prefer a real one. */
export const getPaymentProviders = async (regionId: string) =>
  (await medusaFetch<{ payment_providers: { id: string }[] }>(
    `/store/payment-providers?region_id=${regionId}`,
  )).payment_providers;

/** Every country the house ships to, and the region each belongs to. */
export type ShippableCountry = { iso_2: string; display_name: string; region_id: string };

export async function getShippableCountries(): Promise<ShippableCountry[]> {
  const { regions } = await medusaFetch<{
    regions: { id: string; countries?: { iso_2: string; display_name: string }[] }[];
  }>('/store/regions?fields=id,*countries');

  return regions
    .flatMap((region) =>
      (region.countries ?? []).map((country) => ({ ...country, region_id: region.id })),
    )
    .sort((a, b) => a.display_name.localeCompare(b.display_name));
}

/* Stripe's `return_url` is the page the client left, and a redirect-based
   method (TWINT, a bank, a wallet) comes back to it with the PaymentIntent
   in the query string. */
export const PAYMENT_RETURN_PARAM = 'payment_intent_client_secret';

/** The cart a page should pick up again, which is the one already behind the
    payment when the client has just come back from confirming it. Otherwise
    none: a client opening the link afresh is asked where the piece is going. */
export const cartToResume = (cartId: string | null, search: string) =>
  cartId && new URLSearchParams(search).has(PAYMENT_RETURN_PARAM) ? cartId : null;
