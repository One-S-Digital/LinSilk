import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ChalkMark, ClothWipe, Reveal } from '@/components/motion';
import { ShotFrame } from '@/components/shot';
import { PieceOrderPanel } from '@/components/piece-order-panel';
import { collectionBySlug, findPiece, getPieces, isOrderable, money, roman } from '@/lib/catalog';
import { Approx } from '@/lib/currency';
import { getVariantId } from '@/lib/medusa';
import styles from './piece.module.css';

export async function generateStaticParams() {
  return (await getPieces()).map((piece) => ({ id: piece.id }));
}

export async function generateMetadata(
  props: PageProps<'/piece/[id]'>,
): Promise<Metadata> {
  const { id } = await props.params;
  const piece = await findPiece(id);
  if (!piece) return {};
  const collection = (await collectionBySlug(piece.collection))!;
  return {
    title: piece.name,
    description: isOrderable(piece)
      ? `${piece.material}. Cut to your measurements and made in a capped run for Collection ${roman(collection.number)}.`
      : `${piece.material}. From ${collection.title}, now in the archive and not made again.`,
  };
}

export default async function PiecePage(props: PageProps<'/piece/[id]'>) {
  const { id } = await props.params;
  const piece = await findPiece(id);
  if (!piece) notFound();

  const weave = piece.group === 'men' ? 'sand' : 'bone';
  const label = piece.group === 'men' ? 'Men' : 'Women';

  /* A piece from a closed season is a record, not a product: no price, no
     lead time, and the way back leads to the archive it belongs to. */
  const collection = (await collectionBySlug(piece.collection))!;
  const orderable = isOrderable(piece);
  const numeral = roman(collection.number);

  return (
    <div className={styles.page}>
      <p className={styles.crumb}>
        {orderable ? (
          <>
            <Link href="/collection" style={{ color: 'var(--ink-muted)' }}>
              Collection
            </Link>{' '}
            —{' '}
            <Link
              href={`/collection/${piece.group}`}
              style={{ color: 'var(--ink-muted)' }}
            >
              {label}
            </Link>
            , {collection.season} {numeral}
          </>
        ) : (
          <>
            <Link href="/archive" style={{ color: 'var(--ink-muted)' }}>
              Archive
            </Link>{' '}
            —{' '}
            <Link
              href={`/archive/${collection.slug}`}
              style={{ color: 'var(--ink-muted)' }}
            >
              {collection.title}
            </Link>
          </>
        )}
      </p>

      <div className={styles.layout}>
        {/* ---- Gallery ---- */}
        <div className={styles.gallery}>
          <ClothWipe>
            <ShotFrame
              src={piece.images[0]}
              alt={piece.name}
              note={piece.images.length ? undefined : piece.shot}
              weave={weave}
              ratio="4 / 5"
            >
              <ChalkMark
                label="sleeve · 63"
                style={{ position: 'absolute', right: -8, top: '34%' }}
              />
            </ShotFrame>
          </ClothWipe>

          <div className={styles.details}>
            <ClothWipe delay={0.08}>
              <ShotFrame
                src={piece.images[1]}
                alt={piece.name}
                note={piece.images[1] ? undefined : 'hand-rolled hem'}
                weave={weave}
                ratio="1"
              />
            </ClothWipe>
            <ClothWipe delay={0.16}>
              <ShotFrame
                src={piece.images[2]}
                alt={piece.name}
                note={piece.images[2] ? undefined : 'cloth, raking light'}
                weave={weave}
                ratio="1"
              />
            </ClothWipe>
          </div>
        </div>

        {/* ---- Detail ---- */}
        <div className={styles.detail}>
          <Reveal y={18}>
            <h1 className={styles.title}>{piece.name}</h1>

            <div className={styles.metaRow}>
              <span className={styles.material}>{piece.material}</span>
              {orderable && (
                <span className={styles.price}>
                  {money(piece.price)}
                  <Approx chf={piece.price} className={styles.approx} />
                </span>
              )}
            </div>

            <p className={styles.description}>
              Cut flat by hand from a pattern drawn to your sheet, then closed on the
              machine and finished at the bench — hem, facings and lining by hand. Made in
              a capped run for Collection {numeral} and not
              made again.
            </p>

            <div className={styles.run}>
              <span>capped run · Collection {numeral}</span>
              {orderable ? (
                <span>two to four weeks</span>
              ) : (
                <span>closed · not made again</span>
              )}
            </div>
          </Reveal>

          <PieceOrderPanel
            piece={piece}
            variantId={orderable ? await getVariantId(piece.id) : null}
          />
        </div>
      </div>
    </div>
  );
}
