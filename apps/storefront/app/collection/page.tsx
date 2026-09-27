import Link from 'next/link';
import type { Metadata } from 'next';
import { HeroMedia } from '@/components/motion';
import { ShotFrame } from '@/components/shot';
import { ButtonLink } from '@/components/ui/button';
import { byGroup, currentCollection, roman } from '@/lib/catalog';
import styles from './collection.module.css';

export async function generateMetadata(): Promise<Metadata> {
  const open = await currentCollection();
  return {
    title: 'Collection',
    description: `${open ? `${open.title}. ` : ''}Women’s and men’s pieces, each cut to your measurements and made in a capped run.`,
  };
}

const DOORS = [
  {
    href: '/collection/women',
    group: 'women' as const,
    title: 'Women',
    note: 'women — full length, stone doorway',
    weave: 'dark' as const,
  },
  {
    href: '/collection/men',
    group: 'men' as const,
    title: 'Men',
    note: 'men — walking, rain light',
    weave: 'forest' as const,
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
      <h1 className="sr-only">{open ? open.title : 'Collection'}</h1>

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
                <ShotFrame weave={door.weave} ratio="auto" style={{ height: '100%' }} />
              </HeroMedia>
              <div className={styles.scrim} />
              <span className={styles.note}>{door.note}</span>
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
    </>
  );
}
