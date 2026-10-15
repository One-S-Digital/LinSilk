'use client';

/* The cart.
 *
 * Seasonal pieces only, each at the price the house set. A commission never
 * enters the cart: its price is not known until a tailor has read the brief,
 * so Design Your Own asks for a quote instead and the house writes back.
 *
 * Every line is a made-to-measure garment: quantity is always one, and the
 * line carries the whole brief — cloth and measurement sheet. That payload is
 * what reaches the bench, so it lives on the line rather than in a side table.
 *
 * The cart itself lives in the backend. Only its id is kept in this browser,
 * which is what lets someone close the tab and come back to it — and what
 * puts the house's own rules between a client and a garment: a piece from a
 * closed season, a partial sheet or a second of the same piece is refused
 * there, in words meant to be read, and shown here as they were written.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { addWithRecovery } from './cart-recovery';
import { medusaFetch } from './medusa';
import type { Zone } from './catalog';
import { toLineItemMetadata, type Measurements, type Unit } from './measurements';
import { useHydrated } from './use-hydrated';

export type CartLine = {
  /** The backend's line id. */
  id: string;
  /** Catalogue id of the seasonal piece — the product's handle. */
  pieceId: string;
  name: string;
  material: string;
  /** In the cart's currency, as the house set it. */
  price: number;
  fabricKey: string;
  fabricName: string;
  measurements: Measurements;
  unit: Unit;
  /* How many measurements this garment required. A coat asks for a finished
     length on top of the fifteen body zones, a set asks for two, a scarf asks
     for none. */
  zoneCount: number;
  /* Art direction and group, carried off the product so the line can draw the
     placeholder frame without going back to a catalogue of its own. */
  shot?: string;
  group?: string;
  /** The piece's photograph, as the backend holds it on the line. */
  thumbnail?: string;
};

/** What a piece page hands over when a client orders. */
export type Reservation = {
  variantId: string;
  pieceId: string;
  fabricKey: string;
  fabricName: string;
  measurements: Measurements;
  unit: Unit;
  /* Every zone this garment asked for, garment lengths included — a coat asks
     for one, a set for two. The sheet is written from these, so a piece whose
     length was left out of the list would reach the bench without it. */
  zones: Zone[];
};

type CartState = {
  lines: CartLine[];
  ready: boolean;
  /** Throws with the house's own words when the atelier refuses the line. */
  add: (reservation: Reservation) => Promise<void>;
  remove: (id: string) => Promise<void>;
  clear: () => void;
  count: number;
  subtotal: number;
  currency: string;
  cartId: string | null;
};

const CartContext = createContext<CartState | null>(null);

/* v3 keeps a backend cart id rather than the cart itself. */
const KEY = 'linsilk.cart.v3';

const remember = (id: string | null) => {
  try {
    if (id) window.localStorage.setItem(KEY, id);
    else window.localStorage.removeItem(KEY);
  } catch {
    // Private mode. The cart still works for this visit.
  }
};

const recall = () => {
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
};

type ApiItem = {
  id: string;
  title: string;
  subtitle?: string | null;
  thumbnail?: string | null;
  unit_price: number;
  product_handle?: string | null;
  variant?: {
    product?: {
      handle?: string | null;
      subtitle?: string | null;
      thumbnail?: string | null;
      metadata?: Record<string, unknown> | null;
    } | null;
  } | null;
  metadata?: Record<string, unknown> | null;
};

type ApiCart = {
  id: string;
  currency_code: string;
  item_total?: number;
  completed_at?: string | null;
  items?: ApiItem[] | null;
};

/* The sheet travels as `measure_<zone>_cm`, which is what the bench reads and
   what the backend checks; the cart reads it back out the same way. */
function readLine(item: ApiItem): CartLine {
  const metadata = item.metadata ?? {};
  const measurements: Measurements = {};
  for (const [key, value] of Object.entries(metadata)) {
    const zone = key.match(/^measure_(.+)_cm$/)?.[1];
    if (zone) measurements[zone] = Number(value);
  }

  return {
    id: item.id,
    pieceId: String(metadata.piece_id ?? item.variant?.product?.handle ?? item.product_handle ?? ''),
    name: item.title,
    /* Medusa puts the variant's title on the line; the cloth and the
       construction live on the product, which is what belongs here. */
    material: String(item.variant?.product?.subtitle ?? item.subtitle ?? ''),
    price: Number(item.unit_price),
    fabricKey: String(metadata.fabric_key ?? ''),
    fabricName: String(metadata.fabric_name ?? ''),
    measurements,
    unit: metadata.measurement_unit === 'in' ? 'in' : 'cm',
    zoneCount: Number(metadata.zone_count ?? Object.keys(measurements).length),
    shot: item.variant?.product?.metadata?.shot as string | undefined,
    group: item.variant?.product?.metadata?.group as string | undefined,
    thumbnail: item.thumbnail ?? item.variant?.product?.thumbnail ?? undefined,
  };
}

const CART_FIELDS =
  'fields=id,currency_code,item_total,completed_at,*items,*items.variant.product';

export function CartProvider({ children }: { children: ReactNode }) {
  const hydrated = useHydrated();
  const [cart, setCart] = useState<ApiCart | null>(null);
  const [ready, setReady] = useState(false);

  /* Pick the cart up where it was left, unless it has since been paid for.
     Reading it is the one thing that must finish before the cart can say it
     is empty, or someone with three pieces held sees an empty page. */
  useEffect(() => {
    if (!hydrated) return;
    let cancelled = false;

    const restore = async () => {
      const id = recall();
      if (id) {
        try {
          const { cart: found } = await medusaFetch<{ cart: ApiCart }>(
            `/store/carts/${id}?${CART_FIELDS}`,
          );
          if (cancelled) return;
          if (found.completed_at) remember(null);
          else setCart(found);
        } catch {
          remember(null);
        }
      }
      if (!cancelled) setReady(true);
    };

    void restore();
    return () => {
      cancelled = true;
    };
  }, [hydrated]);

  const startCart = useCallback(async (): Promise<string> => {
    /* The house prices in francs, so a cart opens in Switzerland; where the
       piece is going is settled at checkout. */
    const { regions } = await medusaFetch<{ regions: { id: string; name: string }[] }>(
      '/store/regions',
    );
    const region = regions.find((r) => r.name === 'Switzerland') ?? regions[0];
    if (!region) {
      throw new Error('The house is not open for orders just now. Try again in a moment.');
    }
    const { cart: created } = await medusaFetch<{ cart: ApiCart }>('/store/carts', {
      method: 'POST',
      json: { region_id: region.id },
    });
    remember(created.id);
    setCart(created);
    return created.id;
  }, []);

  const ensureCart = useCallback(
    async (): Promise<string> => cart?.id ?? recall() ?? startCart(),
    [cart?.id, startCart],
  );

  const add = useCallback(
    async (reservation: Reservation) => {
      const post = (id: string) =>
        medusaFetch<{ cart: ApiCart }>(`/store/carts/${id}/line-items?${CART_FIELDS}`, {
          method: 'POST',
          json: {
            variant_id: reservation.variantId,
            quantity: 1,
            metadata: {
              /* Unique per line: two of the same piece on the same sheet are
                 two garments, and Medusa merges identical lines without it. */
              line_id: crypto.randomUUID(),
              piece_id: reservation.pieceId,
              fabric_key: reservation.fabricKey,
              fabric_name: reservation.fabricName,
              zone_count: reservation.zones.length,
              ...toLineItemMetadata(
                reservation.measurements,
                reservation.unit,
                reservation.zones,
              ),
            },
          },
        });

      const { cart: updated } = await addWithRecovery({
        cartId: await ensureCart(),
        post,
        isCompleted: (id) =>
          medusaFetch<{ cart: ApiCart }>(`/store/carts/${id}?fields=completed_at`).then(
            ({ cart: found }) => Boolean(found.completed_at),
            () => false,
          ),
        startCart: () => {
          remember(null);
          return startCart();
        },
      });
      setCart(updated);
    },
    [ensureCart, startCart],
  );

  const remove = useCallback(
    async (lineId: string) => {
      const id = cart?.id ?? recall();
      if (!id) return;
      await medusaFetch(`/store/carts/${id}/line-items/${lineId}`, { method: 'DELETE' });
      const { cart: updated } = await medusaFetch<{ cart: ApiCart }>(
        `/store/carts/${id}?${CART_FIELDS}`,
      );
      setCart(updated);
    },
    [cart?.id],
  );

  const clear = useCallback(() => {
    remember(null);
    setCart(null);
  }, []);

  const value = useMemo<CartState>(() => {
    const lines = (cart?.items ?? []).map(readLine);
    return {
      lines,
      ready,
      add,
      remove,
      clear,
      count: lines.length,
      subtotal: Number(cart?.item_total ?? lines.reduce((sum, l) => sum + l.price, 0)),
      currency: cart?.currency_code ?? 'chf',
      cartId: cart?.id ?? null,
    };
  }, [cart, ready, add, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside <CartProvider>');
  return context;
}
