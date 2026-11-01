import { notFound, permanentRedirect } from 'next/navigation';
import type { Metadata } from 'next';
import { PieceView } from '@/components/piece-view';
import { collectionBySlug, findPiece, getPieces, isOrderable, money, type Piece } from '@/lib/catalog';
import { coloursOf, fibre } from '@/lib/house';
import { pieceAlternates, pieceText } from '@/lib/piece-i18n';

export async function generateStaticParams() {
  return (await getPieces()).map((piece) => ({ id: piece.slug }));
}

/* The title tag keeps the cloth, the piece and "made to measure"; the
   suffix shortens before any of those do (COPY-PAGES §0). */
function titleFor(piece: Piece) {
  const core = piece.noMeasurements ? piece.name : `${piece.name}, made to measure`;
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
  const cloth = piece.cloth ?? 'silk';
  const colours = `${coloursOf(piece)} ${cloth}`;
  const t = pieceText('en');
  return {
    title: { absolute: titleFor(piece) },
    description: isOrderable(piece)
      ? piece.noMeasurements
        ? t.tie.meta(piece.name, fibre(cloth), colours, money(piece.price))
        : t.meta(piece.name, fibre(cloth), colours, money(piece.price))
      : t.metaClosed(piece.name, fibre(cloth), (await collectionBySlug(piece.collection))?.title ?? 'a past collection'),
    alternates: { canonical: `/piece/${piece.slug}`, languages: pieceAlternates(piece) },
    openGraph: piece.images[0] ? { images: [piece.images[0]] } : undefined,
  };
}

export default async function PiecePage(props: PageProps<'/piece/[id]'>) {
  const { id } = await props.params;
  return <PieceView piece={await resolve(id)} lang="en" />;
}
