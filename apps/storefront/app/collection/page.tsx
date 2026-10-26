import Link from 'next/link';
import type { Metadata } from 'next';
import { HeroMedia } from '@/components/motion';
import { ShotFrame } from '@/components/shot';
import { ButtonLink } from '@/components/ui/button';
import { byGroup, currentCollection, roman } from '@/lib/catalog';
import listing from './[group]/listing.module.css';
import text from '@/components/edit-page.module.css';
import styles from './collection.module.css';

export async function generateMetadata(): Promise<Metadata> {
  const open = await currentCollection();
  return {
    title: 'The collection: made-to-measure silk and linen',
    description: `${open ? `${open.title}. ` : ''}Women’s and men’s pieces in 100% silk and 100% linen, each cut and sewn to your measurements in 2–4 weeks.`,
    alternates: { canonical: '/collection' },
  };
}

const DOORS = [
  {
    href: '/collection/women',
    group: 'women' as const,
    title: 'Women',
    weave: 'dark' as const,
    src: '/images/door-women.webp',
    alt: 'A woman in a made-to-measure silk wrap dress on a sunlit loggia above the sea',
  },
  {
    href: '/collection/men',
    group: 'men' as const,
    title: 'Men',
    weave: 'forest' as const,
    src: '/images/door-men.webp',
    alt: 'A man in a made-to-measure linen shirt and trousers seated on limestone steps above the sea',
  },
];

export default async function CollectionPage() {
  const open = await currentCollection();

  /* Counted once and carried, rather than read four times inside the map. */
  const counts = new Map(
    await Promise.all(
      DOORS.map(async (door) => {
        const [main, sleep] = await Promise.all([
          byGroup(door.group, false),
          byGroup(door.group, true),
        ]);
        return [door.group, main.length + sleep.length] as const;
      }),
    ),
  );

  return (
    <>

      {/* No season is open until the house opens one, and two blank doors
          would be a worse answer than saying so. */}
      {counts.size === 0 || [...counts.values()].every((n) => n === 0) ? (
        <div className={styles.none}>
          <p>
            No collection is open at the moment. When the next season is cut, its
            pieces appear here.
          </p>
          <ButtonLink href="/design" variant="outline">
            Commission a piece
          </ButtonLink>
        </div>
      ) : (
      <div className={styles.split}>
        {DOORS.filter((door) => (counts.get(door.group) ?? 0) > 0).map((door) => {
          const count = counts.get(door.group)!;
          return (
            <Link key={door.href} href={door.href} className={styles.panel}>
              <HeroMedia className={styles.media}>
                <ShotFrame weave={door.weave} ratio="auto" src={door.src} alt={door.alt} style={{ height: '100%' }} />
              </HeroMedia>
              <div className={styles.scrim} />
              <div className={styles.body}>
                <div className={styles.count}>{roman(count)} designs</div>
                <div className={styles.title}>{door.title}</div>
                <span className={styles.enter}>
                  Enter the {door.title.toLowerCase()}’s collection
                </span>
              </div>
            </Link>
          );
        })}
      </div>
      )}

      <div className={listing.page}>
        <h1 className={text.title}>The collection: made-to-measure silk and linen</h1>
        <p className={text.intro}>
          {open ? `${open.title}. ` : ''}Every LINSILK piece is cut and sewn to your own
          measurements in 2–4 weeks, in 100% silk or 100% linen. Choose a piece, choose its
          colour from the swatches of its cloth, and enter your measurements: there are no
          sizes and no fittings. Four small collections a year, from Geneva.
        </p>
        <p className={text.p}>
          <Link href="/collection/women/silk">Silk dresses and gowns</Link> ·{' '}
          <Link href="/collection/women/silk-separates">Silk skirts and blouses</Link> ·{' '}
          <Link href="/collection/women/linen">Women’s linen sets</Link> ·{' '}
          <Link href="/collection/sleepwear">Silk sleepwear</Link> ·{' '}
          <Link href="/collection/men/shirts">Men’s linen shirts</Link> ·{' '}
          <Link href="/collection/men/trousers">Men’s linen trousers</Link> ·{' '}
          <Link href="/occasion/wedding-guest">Wedding guest dresses</Link>
        </p>
      </div>
    </>
  );
}
