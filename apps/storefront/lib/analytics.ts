/* Umami custom events (docs/seo/SEO-GEO-PLAN.md §6.10). Umami is cookieless,
 * so nothing here needs consent. When the script is not loaded (no website id
 * set, an ad blocker, local development) every call does nothing. */

declare global {
  interface Window {
    umami?: { track: (name: string, data?: Record<string, string | number>) => void };
  }
}

export type EventName =
  | 'piece_view'
  | 'select_colour'
  | 'sheet_started'
  | 'sheet_confirmed'
  | 'order_placed';

export function track(name: EventName, data?: Record<string, string | number>) {
  if (typeof window === 'undefined') return;
  try {
    window.umami?.track(name, data);
  } catch {
    /* Measuring must never break a page. */
  }
}
