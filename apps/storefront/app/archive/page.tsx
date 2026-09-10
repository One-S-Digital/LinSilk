import Link from 'next/link';
import type { Metadata } from 'next';
import { DragRail } from '@/components/drag-rail';
import { Reveal } from '@/components/motion';
import { ShotFrame } from '@/components/shot';
import { ButtonLink } from '@/components/ui/button';
import { COLLECTIONS, pastCollections, piecesIn, roman } from '@/lib/catalog';
import styles from './archive.module.css';

export const metadata: Metadata = {
  title: 'Past collections',
  description:
    'An archive of closed seasons. These designs are not made again — the record of what the house has made is kept because it is part of what the house is.',
};

export default function ArchivePage() {
  const past = pastCollections();

  /* Until a season has actually closed there is no archive, and a rail of
     empty frames would be a worse answer than saying so. */
  if (past.length === 0) {
    return (
      <div className={styles.page}>
        <div className={styles.head}>
          <h1 className={styles.title}>Past collections</h1>
          <p className={styles.lede}>
            No season has closed yet. When Collection IV is archived in February its
            designs will be kept here — the record of what the house has made is part
            of what it is.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 34 }}>
            <ButtonLink href="/collection" variant="outline">
              See what is open now
            </ButtonLink>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.head}>
        <h1 className={styles.title}>Past collections</h1>
        <Reveal y={18}>
          <p className={styles.lede}>
            An archive, not a shop. These designs closed with their season and are not
            made again. They are kept here because the record of what the house has
            made is part of what it is.
          </p>
        </Reveal>
      </div>

      <div className={styles.rail}>
        <DragRail label="Season archive">
          {COLLECTIONS.map((collection) => {
            const pieces = piecesIn(collection.slug);
            const open = collection.status === 'current';
            const href = open ? '/collection' : `/archive/${collection.slug}`;

            return (
              <article key={collection.slug} className={styles.season}>
                <Link href={href} className={styles.seasonLink}>
                  <ShotFrame
                    note="season campaign image"
                    weave={open ? 'bone' : 'sand'}
                    ratio="16 / 10"
                    zoom
                  />

                  <div className={styles.seasonMeta}>
                    <h2 className={styles.seasonName}>{collection.title}</h2>
                    <span className={styles.state}>
                      {open ? `open until ${collection.closes}` : 'archived'}
                    </span>
                  </div>

                  <p className={styles.seasonNote}>
                    {collection.note} {roman(pieces.length)} designs.
                  </p>

                  <div className={styles.thumbs} aria-hidden="true">
                    {pieces.slice(0, 4).map((piece) => (
                      <ShotFrame
                        key={piece.id}
                        weave={piece.group === 'men' ? 'sand' : 'bone'}
                        ratio="3 / 4"
                      />
                    ))}
                  </div>

                  <span className={styles.enter}>
                    {open ? 'Enter the collection' : `See all ${pieces.length} designs`}
                  </span>
                </Link>
              </article>
            );
          })}
        </DragRail>
      </div>

      <div className={styles.foot}>
        <span className={styles.footRule} aria-hidden="true" />
        <span className={styles.footHint}>
          Drag, scroll or use the arrows through the archive
        </span>
      </div>
    </div>
  );
}
