import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Reveal, RuleDraw, Stagger } from '@/components/motion';
import { PieceCard } from '@/components/piece-card';
import { byGroup, currentCollection, roman, type Group } from '@/lib/catalog';
import styles from './listing.module.css';

const GROUPS: Group[] = ['women', 'men'];

const LABEL: Record<Group, string> = { women: 'Women', men: 'Men' };

export function generateStaticParams() {
  return GROUPS.map((group) => ({ group }));
}

const isGroup = (value: string): value is Group => GROUPS.includes(value as Group);

export async function generateMetadata(
  props: PageProps<'/collection/[group]'>,
): Promise<Metadata> {
  const { group } = await props.params;
  if (!isGroup(group)) return {};
  const open = await currentCollection();
  const season = open ? `${open.season} ${roman(open.number)}` : 'the open collection';
  return {
    title: open ? `${LABEL[group]} — ${season}` : LABEL[group],
    description: `The ${LABEL[group].toLowerCase()}’s pieces in ${season}, each cut to your measurements and made in a capped run.`,
  };
}

export default async function CollectionGroupPage(
  props: PageProps<'/collection/[group]'>,
) {
  const { group } = await props.params;
  if (!isGroup(group)) notFound();

  const [open, main, sleep] = await Promise.all([
    currentCollection(),
    byGroup(group, false),
    byGroup(group, true),
  ]);
  const label = LABEL[group];

  return (
    <div className={styles.page}>
      <p className={styles.crumb}>
        <Link href="/collection" style={{ color: 'var(--ink-muted)' }}>
          Collection
        </Link>{' '}
        — {label}
        {open && `, ${open.season} ${roman(open.number)}`}
      </p>

      <div className={styles.masthead}>
        <h1 className={styles.title}>{label}</h1>
        {open && (
          <span className={styles.season}>
            {open.season} — {roman(open.number)}
          </span>
        )}
      </div>

      <Reveal>
        <p className={styles.intro}>
          Each is cut to your measurements and made in a capped run.{' '}
          {open?.closes
            ? `When the season closes in ${open.closes} these designs are archived and are not made again.`
            : 'When the season closes these designs are archived and are not made again.'}
        </p>
      </Reveal>

      <div className={styles.groupRule}>
        <RuleDraw />
      </div>
      <div className={styles.groupHead}>
        <h2 className={styles.groupTitle}>{label}</h2>
        {main.length > 0 && (
          <span className={styles.groupCount}>{roman(main.length)} designs</span>
        )}
      </div>

      <Stagger className={styles.grid} step={0.07}>
        {main.map((piece, i) => (
          <PieceCard key={piece.id} piece={piece} index={i} />
        ))}
      </Stagger>

      {sleep.length > 0 && (
        <>
          <div className={styles.subRule}>
            <RuleDraw />
          </div>
          <div className={styles.groupHead}>
            <h2 className={styles.groupTitleSmall}>{label} — sleepwear</h2>
            <span className={styles.groupCount}>{roman(sleep.length)} designs</span>
          </div>

          <Stagger className={styles.grid} step={0.07}>
            {sleep.map((piece) => (
              <PieceCard key={piece.id} piece={piece} showView={false} />
            ))}
          </Stagger>
        </>
      )}
    </div>
  );
}
