import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { EditPage, editMetadata } from '@/components/edit-page';
import {
  AboutTranslated,
  ClothTranslated,
  MadeToMeasureTranslated,
  QuestionsTranslated,
} from '@/components/pages/translated';
import { PieceView } from '@/components/piece-view';
import { collectionBySlug, getPieces, isOrderable, money, type Piece } from '@/lib/catalog';
import { editForSlug, fromIn } from '@/lib/edits-i18n';
import { COLOURS, priceRange } from '@/lib/house';
import { isLocale, type Locale } from '@/lib/i18n';
import { localeMetadata } from '@/lib/locale-meta';
import { enPathOf, familyOf, PIECE_SEGMENT } from '@/lib/locale-routes';
import { aboutCopy, bankCopy, clothCopy, mtmCopy } from '@/lib/pages-i18n';
import { localSlug, pieceAlternates, piecePathIn, pieceText } from '@/lib/piece-i18n';
import { pieceName } from '@/lib/piece-names';
import { OG_LOCALE } from '@/lib/i18n';

/* Every translated page below the home page, at /{locale}/{translated-slug}
   (docs/seo/SEO-GEO-PLAN.md §6.7). An unknown locale or slug is a 404. */

type Target =
  | { kind: 'piece'; locale: Locale; piece: Piece }
  | { kind: 'edit'; locale: Locale; slug: string }
  | { kind: 'page'; locale: Locale; enPath: string };

async function resolve(props: PageProps<'/[locale]/[...path]'>): Promise<Target | undefined> {
  const { locale, path } = await props.params;
  if (!isLocale(locale)) return undefined;

  if (path.length === 2 && path[0] === PIECE_SEGMENT[familyOf(locale)]) {
    const piece = (await getPieces()).find(
      (p) => !p.retired && localSlug(locale, p.name) === path[1],
    );
    return piece ? { kind: 'piece', locale, piece } : undefined;
  }

  const slug = path.join('/');
  const enPath = enPathOf(locale, slug);
  if (!enPath || enPath === '/') return undefined;
  if (editForSlug(locale, slug)) return { kind: 'edit', locale, slug };
  return { kind: 'page', locale, enPath };
}

export async function generateMetadata(props: PageProps<'/[locale]/[...path]'>): Promise<Metadata> {
  const t = await resolve(props);
  if (!t) return {};

  if (t.kind === 'edit') return editMetadata(editForSlug(t.locale, t.slug)!);

  if (t.kind === 'piece') {
    const { locale, piece } = t;
    const x = pieceText(locale);
    const name = pieceName(piece.name, locale);
    const cloth = x.cloth[piece.cloth === 'linen' ? 'linen' : 'silk'];
    const colours =
      piece.cloth === 'linen'
        ? `${COLOURS.linen} ${locale.startsWith('de') ? 'Leinenfarben' : 'coloris de lin'}`
        : `${COLOURS.silk} ${locale.startsWith('de') ? 'Seidenfarben' : 'coloris de soie'}`;
    return {
      title: { absolute: x.title(name) },
      description: isOrderable(piece)
        ? x.meta(name, cloth, colours, money(piece.price))
        : x.metaClosed(name, cloth, (await collectionBySlug(piece.collection))?.title ?? ''),
      alternates: { canonical: piecePathIn(locale, piece), languages: pieceAlternates(piece) },
      openGraph: { locale: OG_LOCALE[locale], images: piece.images[0] ? [piece.images[0]] : undefined },
    };
  }

  const { locale, enPath } = t;
  const low = priceRange(await getPieces())?.from;
  switch (enPath) {
    case '/made-to-measure': {
      const c = mtmCopy(locale);
      return localeMetadata(locale, enPath, c.title, c.description(fromIn(low, locale)));
    }
    case '/about': {
      const c = aboutCopy(locale);
      return localeMetadata(locale, enPath, c.title, c.description);
    }
    case '/cloth': {
      const c = clothCopy(locale);
      return localeMetadata(locale, enPath, c.title, c.description);
    }
    case '/care/questions': {
      const c = bankCopy(locale);
      return localeMetadata(locale, enPath, c.title, c.description);
    }
    default:
      return {};
  }
}

export default async function LocalePage(props: PageProps<'/[locale]/[...path]'>) {
  const t = await resolve(props);
  if (!t) notFound();

  if (t.kind === 'piece') return <PieceView piece={t.piece} lang={t.locale} />;
  if (t.kind === 'edit') return <EditPage edit={editForSlug(t.locale, t.slug)!} />;

  switch (t.enPath) {
    case '/made-to-measure':
      return <MadeToMeasureTranslated locale={t.locale} />;
    case '/about':
      return <AboutTranslated locale={t.locale} />;
    case '/cloth':
      return <ClothTranslated locale={t.locale} />;
    case '/care/questions':
      return <QuestionsTranslated locale={t.locale} />;
    default:
      notFound();
  }
}
