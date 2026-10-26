import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Reveal, RuleDraw, Stagger } from '@/components/motion';
import { PieceCard } from '@/components/piece-card';
import { byGroup, currentCollection, roman, type Group } from '@/lib/catalog';
import { EDITS, GROUP_EDITS } from '@/lib/edits';
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
  return {
    title:
      group === 'women'
        ? 'Women’s silk and linen clothing, made to measure'
        : 'Men’s linen clothing, made to measure',
    description:
      group === 'women'
        ? 'Silk dresses, gowns, skirts, blouses and sleepwear, and linen two-piece sets, each cut and sewn to your measurements in 2–4 weeks. From Geneva.'
        : 'Linen shirts, trousers and two-piece looks for men, each cut and sewn to your measurements in 2–4 weeks in 100% linen. From Geneva.',
    alternates: { canonical: `/collection/${group}` },
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
          {group === 'women'
            ? 'LINSILK’s women’s pieces in 100% silk and 100% linen, each cut and sewn to your own measurements in 2–4 weeks.'
            : 'LINSILK’s men’s pieces in 100% linen, each cut and sewn to your own measurements in 2–4 weeks.'}{' '}
          Choose the colour from the swatches of its cloth on the piece’s page.
        </p>
        <p className={styles.intro}>
          {GROUP_EDITS.filter((e) => e.group === group).map((e, i) => (
            <span key={e.edit}>
              {i > 0 && ' · '}
              <Link href={EDITS[`${e.group}/${e.edit}`].path}>{EDITS[`${e.group}/${e.edit}`].h1}</Link>
            </span>
          ))}
          {group === 'women' && (
            <>
              {' · '}
              <Link href="/occasion/wedding-guest">Wedding guest dresses in silk</Link>
              {' · '}
              <Link href="/collection/sleepwear">Silk sleepwear</Link>
            </>
          )}
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
