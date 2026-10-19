import type { Collection, Piece } from './catalog';

export const SITE_URL = 'https://bylinsilk.com';

/* The pages a visitor may land on from a search. Left out on purpose: the cart,
   checkout, account, order and commission pages (private or per-visitor), the
   Payload admin, and the legal pages, which carry `noindex`. */
const STATIC_PATHS = [
  '/',
  '/collection',
  '/collection/women',
  '/collection/men',
  '/archive',
  '/cloth',
  '/design',
  '/contact',
  '/season-letter',
  '/care/measuring',
  '/care/questions',
  '/care/returns',
  '/care/shipping',
];

export function sitemapPaths(past: Collection[], pieces: Piece[]): string[] {
  return [
    ...STATIC_PATHS,
    ...past.map((c) => `/archive/${encodeURIComponent(c.slug)}`),
    ...pieces.map((p) => `/piece/${encodeURIComponent(p.id)}`),
  ];
}
