/* The backend, as the storefront sees it.
 *
 * Only what a browser may know lives here: the publishable key identifies the
 * sales channel and is meant to be public. Anything secret stays server-side.
 */

export const MEDUSA_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ?? 'http://localhost:9000';

export const MEDUSA_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ?? '';

export const medusaHeaders = (): Record<string, string> =>
  MEDUSA_KEY ? { 'x-publishable-api-key': MEDUSA_KEY } : {};

/* A read that never takes the page down with it: if the backend is unreachable
   — during a build, or in a moment of bad luck — the caller renders what it
   can and says plainly that the rest is missing. */
export async function medusaGet<T>(path: string, revalidate = 60): Promise<T | null> {
  try {
    const response = await fetch(`${MEDUSA_URL}${path}`, {
      headers: medusaHeaders(),
      next: { revalidate },
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

/** A shape the house will cut to order, with the figure it opens at. */
export type ApiSilhouette = {
  key: string;
  name: string;
  note: string | null;
  /** Whole Swiss francs, set in the admin. Null if it has no price yet. */
  estimate: number | null;
  currency_code: string;
  length_kinds: string[];
};

/** A cloth catalogue the client reads before naming the cloth they want. */
export type ApiFabricCatalogue = {
  id: string;
  title: string;
  description: string | null;
  url: string;
  mime_type: string;
  size: number | null;
};

export const getSilhouettes = async () =>
  (await medusaGet<{ silhouettes: ApiSilhouette[] }>('/store/silhouettes'))?.silhouettes ?? null;

export const getFabricCatalogues = async () =>
  (await medusaGet<{ fabric_catalogues: ApiFabricCatalogue[] }>('/store/fabric-catalogues'))
    ?.fabric_catalogues ?? null;

/* The browser's own calls: the cart, and paying for it. These carry no
   `next` options — they are live, not cached — and they turn the backend's
   refusal into an Error the page can show, because the house's refusals are
   written to be read ("The atelier cannot cut ... from a partial sheet"). */
export async function medusaFetch<T>(
  path: string,
  init: RequestInit & { json?: unknown } = {},
): Promise<T> {
  const { json, ...rest } = init;
  const response = await fetch(`${MEDUSA_URL}${path}`, {
    ...rest,
    headers: {
      ...medusaHeaders(),
      ...(json ? { 'content-type': 'application/json' } : {}),
      ...(rest.headers ?? {}),
    },
    ...(json ? { body: JSON.stringify(json) } : {}),
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(
      (body as { message?: string } | null)?.message ??
        'The house could not be reached. Try again in a moment.',
    );
  }
  return body as T;
}

/** Prices come back in the cart's own currency, already tax-inclusive. */
export const formatMoney = (amount: number, currency: string) =>
  `${currency.toUpperCase()} ${amount.toLocaleString('de-CH')}`;

/* The backend's id for a piece, looked up by the handle the catalogue uses.
   Read on the server when a piece page renders, so the browser is handed the
   id rather than having to go and find it. */
export async function getVariantId(handle: string): Promise<string | null> {
  const body = await medusaGet<{ products: { variants: { id: string }[] }[] }>(
    `/store/products?handle=${encodeURIComponent(handle)}&fields=variants.id`,
  );
  return body?.products?.[0]?.variants?.[0]?.id ?? null;
}
