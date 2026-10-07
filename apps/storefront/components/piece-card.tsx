import Link from 'next/link';
import { ShotFrame } from '@/components/shot';
import { isOrderable, money, type Piece } from '@/lib/catalog';
import styles from './piece-card.module.css';

export function PieceCard({
  piece,
  index = 0,
  showView = true,
  ratio = '3 / 4',
}: {
  piece: Piece;
  /** Drives the rail-hung vertical offset across a grid. */
  index?: number;
  showView?: boolean;
  ratio?: string;
}) {
  return (
    <Link
      href={`/piece/${piece.id}`}
      className={styles.card}
      data-offset={index % 3}
    >
      <ShotFrame
        className={styles.frame}
        src={piece.images[0]}
        alt={piece.name}
        note={piece.images.length ? undefined : piece.shot}
        weave={piece.group === 'men' ? 'sand' : 'bone'}
        ratio={ratio}
        zoom
      />

      <div className={styles.meta}>
        <span className={styles.name}>{piece.name}</span>
        {/* An archived piece is not for sale, so it carries no price. */}
        {isOrderable(piece) && <span className={styles.price}>{money(piece.price)}</span>}
      </div>
      <div className={styles.material}>{piece.material}</div>
      {showView && <span className={styles.view}>View</span>}
    </Link>
  );
}
