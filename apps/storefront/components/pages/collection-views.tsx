import Link from 'next/link';
import { HeroMedia, Reveal, RuleDraw, Stagger } from '@/components/motion';
import { PieceCard } from '@/components/piece-card';
import { SeoLinks, SeoText } from '@/components/seo-text';
import { ShotFrame } from '@/components/shot';
import { ButtonLink } from '@/components/ui/button';
import listing from '@/app/collection/[group]/listing.module.css';
import styles from '@/app/collection/collection.module.css';
import { byGroup, currentCollection, roman, type Group } from '@/lib/catalog';
import { GROUP_EDITS } from '@/lib/edits';
import { LANG, type Lang } from '@/lib/i18n';
import { pagesText } from '@/lib/i18n-pages';
import { localHref } from '@/lib/locale-routes';

/* The collection hub and the women's / men's pages, in any language. */

const DOORS = [
  { group: 'women' as const, weave: 'dark' as const, src: '/images/door-women.webp' },
  { group: 'men' as const, weave: 'forest' as const, src: '/images/door-men.webp' },
];

export async function CollectionHubView({ lang }: { lang: Lang }) {
  const t = pagesText(lang).collection;
  const to = (p: string) => localHref(lang, p);
  const open = await currentCollection();

  /* Counted once and carried, rather than read four times inside the map. */
  const counts = new Map(
    await Promise.all(
      DOORS.map(async (door) => {
        const [main, sleep] = await Promise.all([byGroup(door.group, false), byGroup(door.group, true)]);
        return [door.group, main.length + sleep.length] as const;
      }),
    ),
  );
  const openTitle = open ? `${open.title}. ` : '';

  return (
    <div lang={lang === 'en' ? undefined : LANG[lang]}>
      <h1 className="sr-only">{t.title}</h1>

      {/* No season is open until the house opens one, and two blank doors
          would be a worse answer than saying so. */}
      {counts.size === 0 || [...counts.values()].every((n) => n === 0) ? (
        <div className={styles.none}>
          <p>{t.none}</p>
          <ButtonLink href={to('/design')} variant="outline">
            {t.commission}
          </ButtonLink>
        </div>
      ) : (
        <div className={styles.split}>
          {DOORS.filter((door) => (counts.get(door.group) ?? 0) > 0).map((door) => {
            const count = counts.get(door.group)!;
            const title = door.group === 'women' ? t.women : t.men;
            return (
              <Link key={door.group} href={to(`/collection/${door.group}`)} className={styles.panel}>
                <HeroMedia className={styles.media}>
                  <ShotFrame
                    weave={door.weave}
                    ratio="auto"
                    src={door.src}
                    alt={door.group === 'women' ? t.womenAlt : t.menAlt}
                    style={{ height: '100%' }}
                  />
                </HeroMedia>
                <div className={styles.scrim} />
                <div className={styles.body}>
                  <div className={styles.count}>{t.designs(roman(count))}</div>
                  <div className={styles.title}>{title}</div>
                  <span className={styles.enter}>{t.enter(lang === 'en' ? title.toLowerCase() : title)}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <div className={listing.page} style={{ paddingTop: 0 }}>
        <SeoText eyebrow={t.aboutEyebrow} title={t.aboutTitle}>
          <p>{t.about(openTitle)}</p>
          <SeoLinks links={Object.entries(t.links).map(([path, label]) => ({ href: to(path), label }))} />
        </SeoText>
      </div>
    </div>
  );
}

export async function CollectionGroupView({ group, lang }: { group: Group; lang: Lang }) {
  const t = pagesText(lang).group;
  const links = pagesText(lang).collection.links;
  const to = (p: string) => localHref(lang, p);
  const [open, main, sleep] = await Promise.all([
    currentCollection(),
    byGroup(group, false),
    byGroup(group, true),
  ]);
  const label = group === 'women' ? t.women : t.men;

  return (
    <div className={listing.page} lang={lang === 'en' ? undefined : LANG[lang]}>
      <p className={listing.crumb}>
        <Link href={to('/collection')} style={{ color: 'var(--ink-muted)' }}>
          {t.crumb}
        </Link>{' '}
        — {label}
        {open && `, ${open.season} ${roman(open.number)}`}
      </p>

      <div className={listing.masthead}>
        <h1 className={listing.title}>{label}</h1>
        {open && (
          <span className={listing.season}>
            {open.season} — {roman(open.number)}
          </span>
        )}
      </div>

      <Reveal>
        <p className={listing.intro}>{t.intro(open?.closes)}</p>
      </Reveal>

      <div className={listing.groupRule}>
        <RuleDraw />
      </div>
      <div className={listing.groupHead}>
        <h2 className={listing.groupTitle}>{label}</h2>
        {main.length > 0 && <span className={listing.groupCount}>{t.designs(roman(main.length))}</span>}
      </div>

      <Stagger className={listing.grid} step={0.07}>
        {main.map((piece, i) => (
          <PieceCard key={piece.id} piece={piece} index={i} lang={lang} />
        ))}
      </Stagger>

      {sleep.length > 0 && (
        <>
          <div className={listing.subRule}>
            <RuleDraw />
          </div>
          <div className={listing.groupHead}>
            <h2 className={listing.groupTitleSmall}>{t.sleepwear(label)}</h2>
            <span className={listing.groupCount}>{t.designs(roman(sleep.length))}</span>
          </div>

          <Stagger className={listing.grid} step={0.07}>
            {sleep.map((piece) => (
              <PieceCard key={piece.id} piece={piece} showView={false} lang={lang} />
            ))}
          </Stagger>
        </>
      )}

      <SeoText eyebrow={t.aboutEyebrow} title={t.aboutTitle}>
        <p>
          {group === 'women' ? t.aboutWomen : t.aboutMen} {t.colour}
        </p>
        <SeoLinks
          links={[
            ...GROUP_EDITS.filter((e) => e.group === group).map((e) => {
              const path = `/collection/${e.group}/${e.edit}`;
              return { href: to(path), label: links[path] };
            }),
            ...(group === 'women'
              ? [
                  { href: to('/occasion/wedding-guest'), label: t.wedding },
                  { href: to('/collection/sleepwear'), label: t.sleep },
                ]
              : []),
          ]}
        />
      </SeoText>
    </div>
  );
}
