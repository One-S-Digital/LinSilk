import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ChalkMark, ClothWipe, Reveal } from '@/components/motion';
import { ShotFrame } from '@/components/shot';
import { PieceOrderPanel } from '@/components/piece-order-panel';
import { PIECES, findPiece, money } from '@/lib/catalog';
import styles from './piece.module.css';

export function generateStaticParams() {
  return PIECES.map((piece) => ({ id: piece.id }));
}

export async function generateMetadata(
  props: PageProps<'/piece/[id]'>,
): Promise<Metadata> {
  const { id } = await props.params;
  const piece = findPiece(id);
  if (!piece) return {};
  return {
    title: piece.name,
    description: `${piece.material}. Cut to your measurements in the Hội An atelier and made in a capped run for Collection IV.`,
  };
}

export default async function PiecePage(props: PageProps<'/piece/[id]'>) {
  const { id } = await props.params;
  const piece = findPiece(id);
  if (!piece) notFound();

  const weave = piece.group === 'men' ? 'sand' : 'bone';
  const label = piece.group === 'men' ? 'Men' : 'Women';

  return (
    <div className={styles.page}>
      <p className={styles.crumb}>
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
        , Autumn IV
      </p>

      <div className={styles.layout}>
        {/* ---- Gallery ---- */}
        <div className={styles.gallery}>
          <ClothWipe>
            <ShotFrame note={piece.shot} weave={weave} ratio="4 / 5">
              <ChalkMark
                label="sleeve · 63"
                style={{ position: 'absolute', right: -8, top: '34%' }}
              />
            </ShotFrame>
          </ClothWipe>

          <div className={styles.details}>
            <ClothWipe delay={0.08}>
              <ShotFrame note="hand-rolled hem" weave={weave} ratio="1" />
            </ClothWipe>
            <ClothWipe delay={0.16}>
              <ShotFrame note="cloth, raking light" weave={weave} ratio="1" />
            </ClothWipe>
          </div>
        </div>

        {/* ---- Detail ---- */}
        <div className={styles.detail}>
          <Reveal y={18}>
            <h1 className={styles.title}>{piece.name}</h1>

            <div className={styles.metaRow}>
              <span className={styles.material}>{piece.material}</span>
              <span className={styles.price}>{money(piece.price)}</span>
            </div>

            <p className={styles.description}>
              Cut flat by hand from a pattern drawn to your sheet, then closed on the
              machine and finished at the bench — hem, facings and lining by hand. The
              cloth is logged with its mill and its date, and that record is sewn into
              the seam allowance. Made in a capped run for Collection IV and not made
              again.
            </p>

            <div className={styles.run}>
              <span>capped run · Collection IV</span>
              <span>three to five weeks</span>
              <span>alterations free for one year</span>
            </div>
          </Reveal>

          <PieceOrderPanel piece={piece} />
        </div>
      </div>
    </div>
  );
}
