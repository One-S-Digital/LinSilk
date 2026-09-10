import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Reveal, RuleDraw, Stagger } from '@/components/motion';
import { PieceCard } from '@/components/piece-card';
import { COLLECTIONS, collectionBySlug, piecesIn, roman } from '@/lib/catalog';
import styles from '../../collection/[group]/listing.module.css';

export function generateStaticParams() {
  return COLLECTIONS.filter((c) => c.status === 'past').map((c) => ({
    slug: c.slug,
  }));
}

export async function generateMetadata(
  props: PageProps<'/archive/[slug]'>,
): Promise<Metadata> {
  const { slug } = await props.params;
  const collection = collectionBySlug(slug);
  if (!collection) return {};
  return {
    title: collection.title,
    description: `${collection.note} An archived collection — these designs closed with their season and are not made again.`,
  };
}

export default async function ArchivedCollectionPage(
  props: PageProps<'/archive/[slug]'>,
) {
  const { slug } = await props.params;
  const collection = collectionBySlug(slug);

  // The current collection is shopped at /collection, not read in the archive.
  if (!collection || collection.status !== 'past') notFound();

  const pieces = piecesIn(slug);
  const women = pieces.filter((p) => p.group === 'women');
  const men = pieces.filter((p) => p.group === 'men');

  return (
    <div className={styles.page}>
      <p className={styles.crumb}>
        <Link href="/archive" style={{ color: 'var(--ink-muted)' }}>
          Past collections
        </Link>{' '}
        — {collection.season} {roman(collection.number)}
      </p>

      <div className={styles.masthead}>
        <h1 className={styles.title}>{collection.season}</h1>
        <span className={styles.season}>
          Collection {roman(collection.number)}
        </span>
      </div>

      <Reveal>
        <p className={styles.intro}>
          {collection.note} {roman(pieces.length)} designs, all cut to measure and made
          in capped runs. This collection is closed — nothing here is made again, and
          the record is kept because what the house has made is part of what it is.
        </p>
      </Reveal>

      {[
        { label: 'Women', list: women },
        { label: 'Men', list: men },
      ]
        .filter((section) => section.list.length > 0)
        .map((section) => (
          <div key={section.label}>
            <div className={styles.groupRule}>
              <RuleDraw />
            </div>
            <div className={styles.groupHead}>
              <h2 className={styles.groupTitle}>{section.label}</h2>
              <span className={styles.groupCount}>
                {roman(section.list.length)} designs
              </span>
            </div>

            <Stagger className={styles.grid} step={0.06}>
              {section.list.map((piece, i) => (
                <PieceCard key={piece.id} piece={piece} index={i} showView={false} />
              ))}
            </Stagger>
          </div>
        ))}
    </div>
  );
}
