import { notFound, permanentRedirect } from 'next/navigation';
import type { Metadata } from 'next';
import { PieceView } from '@/components/piece-view';
import { collectionBySlug, findPiece, getPieces, isOrderable, money, type Piece } from '@/lib/catalog';
import { COLOURS } from '@/lib/house';
import { pieceAlternates } from '@/lib/piece-i18n';

export async function generateStaticParams() {
  return (await getPieces()).map((piece) => ({ id: piece.slug }));
}

/* The title tag keeps the cloth, the piece and "made to measure"; the
   suffix shortens before any of those do (COPY-PAGES §0). */
function titleFor(piece: Piece) {
  const core = `${piece.name}, made to measure`;
  for (const suffix of [' | LINSILK Geneva', ' | LINSILK']) {
    if (core.length + suffix.length <= 62) return core + suffix;
  }
  return `${core} | LINSILK`;
}

/* A phased-out design, or the old numeric address, answers with a permanent
   redirect so its links and rankings move with it (SEO-GEO-PLAN §7). */
async function resolve(param: string) {
  const piece = await findPiece(param);
  if (!piece) notFound();
  if (piece.retired) {
    const successor = piece.successor ? await findPiece(piece.successor) : undefined;
    permanentRedirect(successor ? `/piece/${successor.slug}` : `/collection/${piece.group}`);
  }
  if (param !== piece.slug) permanentRedirect(`/piece/${piece.slug}`);
  return piece;
}

export async function generateMetadata(
  props: PageProps<'/piece/[id]'>,
): Promise<Metadata> {
  const { id } = await props.params;
  const piece = await findPiece(id);
  if (!piece) return {};
  const cloth = piece.cloth === 'linen' ? 'linen' : 'silk';
  const colours = cloth === 'linen' ? `${COLOURS.linen} linen` : `${COLOURS.silk} silk`;
  return {
    title: { absolute: titleFor(piece) },
    description: isOrderable(piece)
      ? `${piece.name} in 100% ${cloth}, cut and sewn to your measurements in 2–4 weeks. Choose from ${colours} colours. ${money(piece.price)}.`
      : `${piece.name} in 100% ${cloth}, from ${(await collectionBySlug(piece.collection))?.title ?? 'a past collection'}.`,
    alternates: { canonical: `/piece/${piece.slug}`, languages: pieceAlternates(piece) },
    openGraph: piece.images[0] ? { images: [piece.images[0]] } : undefined,
  };
}

export default async function PiecePage(props: PageProps<'/piece/[id]'>) {
  const { id } = await props.params;
  return <PieceView piece={await resolve(id)} lang="en" />;
}
