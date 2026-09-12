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
