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
 * State is held here and mirrored to localStorage. When Medusa is wired, this
 * module's internals become Store API calls against a real cart id and every
 * consumer stays unchanged.
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
import type { Measurements, Unit } from './measurements';
import { useHydrated } from './use-hydrated';

export type CartLine = {
  /** Unique per line — the same piece can be cut twice from one sheet. */
  id: string;
  /** Catalogue id of the seasonal piece. */
  pieceId: string;
  name: string;
  material: string;
  /** Whole Swiss francs, as the house set it. */
  price: number;
  fabricKey: string;
  fabricName: string;
  measurements: Measurements;
  unit: Unit;
  /* How many measurements this garment required. A coat asks for a finished
     length on top of the fifteen body zones, a set asks for two, a scarf asks
     for none. Stored on the line so the cart can report "16 of 16" without
     re-deriving the garment. */
  zoneCount: number;
  addedAt: number;
};

type CartState = {
  lines: CartLine[];
  ready: boolean;
  add: (line: Omit<CartLine, 'id' | 'addedAt'>) => void;
  remove: (id: string) => void;
  clear: () => void;
  count: number;
  subtotal: number;
};

const CartContext = createContext<CartState | null>(null);
/* v2 dropped commission lines from the cart. A cart saved under v1 could
   still hold one, and it must never reach a payment. */
const KEY = 'ayla.cart.v2';

function readStored(): CartLine[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as CartLine[];
  } catch {
    // Storage unavailable or unreadable; an empty cart is the safe start.
  }
  return [];
}

export function CartProvider({ children }: { children: ReactNode }) {
  const hydrated = useHydrated();
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  if (hydrated && !ready) {
    setReady(true);
    setLines(readStored());
  }

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(lines));
    } catch {
      // Nothing to do — the cart still works for this session.
    }
  }, [lines, ready]);

  const add = useCallback((line: Omit<CartLine, 'id' | 'addedAt'>) => {
    setLines((current) => [
      ...current,
      { ...line, id: crypto.randomUUID(), addedAt: Date.now() },
    ]);
  }, []);

  const remove = useCallback((id: string) => {
    setLines((current) => current.filter((l) => l.id !== id));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CartState>(
    () => ({
      lines,
      ready,
      add,
      remove,
      clear,
      count: lines.length,
      subtotal: lines.reduce((sum, l) => sum + l.price, 0),
    }),
    [lines, ready, add, remove, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside <CartProvider>');
  return context;
}
