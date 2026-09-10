import Link from 'next/link';
import type { Metadata } from 'next';
import { HeroMedia } from '@/components/motion';
import { ShotFrame } from '@/components/shot';
import { byGroup, roman } from '@/lib/catalog';
import styles from './collection.module.css';

export const metadata: Metadata = {
  title: 'Collection',
  description:
    'Autumn — Collection IV. Women’s and men’s pieces, each cut to your measurements and made in a capped run.',
};

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

export default function CollectionPage() {
  return (
    <>
      <h1 className="sr-only">Collection — Autumn IV</h1>
      <div className={styles.split}>
        {DOORS.filter(
          (door) =>
            byGroup(door.group, false).length + byGroup(door.group, true).length > 0,
        ).map((door) => {
          const count =
            byGroup(door.group, false).length + byGroup(door.group, true).length;
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
    </>
  );
}
