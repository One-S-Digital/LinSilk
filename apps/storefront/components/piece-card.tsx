import Link from 'next/link';
import { ShotFrame } from '@/components/shot';
import { isOrderable, money, type Piece } from '@/lib/catalog';
import { imageAlt } from '@/lib/garments';
import { Approx } from '@/lib/currency';
import type { Lang } from '@/lib/i18n';
import { pieceName } from '@/lib/piece-names';
import { altIn, piecePathIn, pieceText } from '@/lib/piece-i18n';
import styles from './piece-card.module.css';

export function PieceCard({
  piece,
  index = 0,
  showView = true,
  ratio = '3 / 4',
  lang = 'en',
}: {
  piece: Piece;
  /** Drives the rail-hung vertical offset across a grid. */
  index?: number;
  showView?: boolean;
  ratio?: string;
  /** The language of the page the card sits on: name, link and label follow it. */
  lang?: Lang;
}) {
  const name = pieceName(piece.name, lang);
  return (
    <Link
      href={piecePathIn(lang, piece)}
      className={styles.card}
      data-offset={index % 3}
    >
      <ShotFrame
        className={styles.frame}
        src={piece.images[0]}
        alt={
          piece.images[0]
            ? lang === 'en'
              ? imageAlt(piece, piece.images[0], 0)
              : altIn(lang, piece, piece.images[0], 0)
            : name
        }
        note={piece.images.length ? undefined : piece.shot}
        weave={piece.group === 'men' ? 'sand' : 'bone'}
        ratio={ratio}
        zoom
      />

      <div className={styles.meta}>
        <span className={styles.name}>{name}</span>
        {/* An archived piece is not for sale, so it carries no price. */}
        {isOrderable(piece) && (
          <span className={styles.price}>
            {money(piece.price)}
            <Approx chf={piece.price} className={styles.approx} />
          </span>
        )}
      </div>
      <div className={styles.material}>{piece.material}</div>
      {showView && <span className={styles.view}>{pieceText(lang).view}</span>}
    </Link>
  );
}
