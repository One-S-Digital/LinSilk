'use client';

/* The cart.
 *
 * Every line is a made-to-measure garment: quantity is always one, and the
 * line carries the whole brief — cloth, measurement sheet, and for a
 * commission the silhouette and the client's note. That payload is what
 * reaches the bench, so it lives on the line rather than in a side table.
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

export type CartLine = {
  /** Unique per line — two commissions can share a silhouette. */
  id: string;
  kind: 'piece' | 'commission';
  /** Catalogue id for a seasonal piece; absent on a commission. */
  pieceId?: string;
  name: string;
  material: string;
  /** Whole Swiss francs. A commission price is an estimate until confirmed. */
  price: number;
  estimate?: boolean;
  fabricKey: string;
  fabricName: string;
  measurements: Measurements;
  unit: Unit;
  /* How many measurements this garment required. A coat asks for a finished
     length on top of the eleven body zones; a trouser does not. Stored on the
     line so the cart can report "12 of 12" without re-deriving the garment. */
  zoneCount: number;
  silhouette?: string;
  note?: string;
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
  hasEstimate: boolean;
};

const CartContext = createContext<CartState | null>(null);
const KEY = 'ayla.cart.v1';

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) setLines(JSON.parse(raw) as CartLine[]);
    } catch {
      // Storage unavailable or unreadable; an empty cart is the safe start.
    }
    setReady(true);
  }, []);

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
      hasEstimate: lines.some((l) => l.estimate),
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
