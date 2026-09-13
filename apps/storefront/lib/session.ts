/* A signed-in customer, read on the server.
 *
 * Unlike the cart id, a session is a bearer credential — the Medusa JWT
 * itself — so it never reaches client JS. It lives in an httpOnly cookie on
 * this origin, set by the actions in `account-actions.ts`, and read here by
 * Server Components. `next/headers` refuses to run outside a server context,
 * which is what keeps this file off the client bundle.
 */

import { cookies } from 'next/headers';
import { MEDUSA_URL, medusaHeaders } from './medusa';

const COOKIE = 'ayla_session';
const DEFAULT_MAX_AGE = 60 * 60 * 24; // Medusa's own default token lifetime.

/** Reads a JWT's `exp` claim without verifying it — the token just came
    from Medusa over our own request, so there is nothing here to check it
    against. Used only to size the cookie; an unreadable token still works,
    it just falls back to the default lifetime. */
function jwtMaxAge(token: string): number {
  try {
    const payload = token.split('.')[1];
    const { exp } = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      exp: number;
    };
    const seconds = Math.floor(exp - Date.now() / 1000);
    return seconds > 0 ? seconds : DEFAULT_MAX_AGE;
  } catch {
    return DEFAULT_MAX_AGE;
  }
}

export async function setSession(token: string) {
  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: jwtMaxAge(token),
  });
}

export async function clearSession() {
  const store = await cookies();
  store.delete(COOKIE);
}

export async function getToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(COOKIE)?.value ?? null;
}

export type ApiCustomer = {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  metadata?: Record<string, unknown> | null;
};

export type ApiAddress = {
  id: string;
  address_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  company?: string | null;
  address_1?: string | null;
  address_2?: string | null;
  city?: string | null;
  province?: string | null;
  postal_code?: string | null;
  country_code?: string | null;
  phone?: string | null;
  is_default_shipping?: boolean;
};

/** A signed-in request to the Store API. Null if there is no session, the
    call fails, or the token no longer checks out — Medusa's own refusal,
    read the same way `medusaFetch` reads the house's. */
export async function authedFetch<T>(
  path: string,
  init: RequestInit & { json?: unknown } = {},
): Promise<T | null> {
  const token = await getToken();
  if (!token) return null;

  const { json, ...rest } = init;
  const response = await fetch(`${MEDUSA_URL}${path}`, {
    ...rest,
    headers: {
      ...medusaHeaders(),
      authorization: `Bearer ${token}`,
      ...(json ? { 'content-type': 'application/json' } : {}),
      ...(rest.headers ?? {}),
    },
    ...(json ? { body: JSON.stringify(json) } : {}),
    cache: 'no-store',
  });
  if (!response.ok) return null;
  return (await response.json()) as T;
}

/** The signed-in customer, for a Server Component to render around — or to
    redirect away from, on a page that needs one. */
export async function getCustomer(): Promise<ApiCustomer | null> {
  const body = await authedFetch<{ customer: ApiCustomer }>('/store/customers/me');
  return body?.customer ?? null;
}

/** Every address the customer has saved — a shipping address book, kept on
    the account rather than typed fresh at every checkout. */
export async function getAddresses(): Promise<ApiAddress[]> {
  const body = await authedFetch<{ addresses: ApiAddress[] }>('/store/customers/me/addresses');
  return body?.addresses ?? [];
}
