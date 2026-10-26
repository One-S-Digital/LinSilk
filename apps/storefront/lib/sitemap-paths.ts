import type { Collection, Piece } from './catalog';
import { EDIT_PATHS } from './edits';

export { SITE_URL } from './house';

/* The pages a visitor may land on from a search. Left out on purpose: the cart,
   checkout, account, order and commission pages (private or per-visitor), the
   Payload admin, and the legal and season-letter pages, which carry
   `noindex`. A retired piece redirects, so it is not listed either. */
const STATIC_PATHS = [
  '/',
  '/collection',
  '/collection/women',
  '/collection/men',
  '/archive',
  '/cloth',
  '/made-to-measure',
  '/design',
  '/about',
  '/contact',
  '/uae',
  '/de/ballkleid-seide',
  '/care/measuring',
  '/care/questions',
  '/care/returns',
  '/care/shipping',
];

export function sitemapPaths(
  past: Collection[],
  pieces: Pick<Piece, 'slug' | 'retired'>[],
): string[] {
  return [
    ...STATIC_PATHS,
    ...EDIT_PATHS,
    ...past.map((c) => `/archive/${encodeURIComponent(c.slug)}`),
    ...pieces.filter((p) => !p.retired).map((p) => `/piece/${encodeURIComponent(p.slug)}`),
  ];
}
