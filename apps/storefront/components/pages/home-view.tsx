import Link from 'next/link';
import { JsonLd } from '@/components/json-ld';
import {
  ChalkMark,
  ClothWipe,
  Count,
  HeroMedia,
  LineRise,
  Parallax,
  Reveal,
  RuleDraw,
} from '@/components/motion';
import { HeroShutter } from '@/components/hero-shutter';
import { DragRail } from '@/components/drag-rail';
import { ShotFrame } from '@/components/shot';
import { ButtonLink } from '@/components/ui/button';
import styles from '@/app/home.module.css';
import { currentCollection, money, piecesIn } from '@/lib/catalog';
import { COLOURS } from '@/lib/house';
import { homeCopy } from '@/lib/home-i18n';
import { LANG, type Lang } from '@/lib/i18n';
import { websiteLd } from '@/lib/jsonld';
import { localHref } from '@/lib/locale-routes';
import { pieceName } from '@/lib/piece-names';
import { piecePathIn } from '@/lib/piece-i18n';

/* The home page, in any language (docs/seo/COPY-PAGES.md §2). */
export async function HomeView({ lang }: { lang: Lang }) {
  const c = homeCopy(lang);
  const to = (p: string) => localHref(lang, p);

  /* The season rail leads with the women's opening five, then the men's first
     three — the order the lookbook is shot in. Always the open collection. */
  const OPEN = await currentCollection();
  const IN_SEASON = OPEN ? await piecesIn(OPEN.slug) : [];
  const SEASON = [
    ...IN_SEASON.filter((p) => p.group === 'women').slice(0, 5),
    ...IN_SEASON.filter((p) => p.group === 'men').slice(0, 3),
  ];

  return (
    <div lang={lang === 'en' ? undefined : LANG[lang]}>
      {/* ---- Hero ---- */}
      <section className={styles.hero}>
        <HeroMedia className={styles.heroMedia}>
          <HeroShutter />
        </HeroMedia>
        <div className={styles.heroScrim} />

        <div className={styles.heroInner}>
          <Reveal y={10}>
            <h1 className={styles.kicker}>{c.kicker}</h1>
          </Reveal>
          <LineRise delay={0.15}>
            <span className={styles.heroLine} style={{ display: 'block' }}>
              {c.heroLines[0]}
            </span>
            <span className={styles.heroLine} style={{ display: 'block' }}>
              {c.heroLines[1]}
            </span>
            <span
              className={`${styles.heroLine} ${styles.heroLineItalic}`}
              style={{ display: 'block' }}
            >
              {c.heroLines[2]}
            </span>
          </LineRise>

          <div className={styles.heroCtas}>
            <ButtonLink href="/collection/women" variant="onDark">
              {c.women}
            </ButtonLink>
            <ButtonLink href="/collection/men" variant="onDark">
              {c.men}
            </ButtonLink>
          </div>
        </div>
      </section>

      <JsonLd data={{ ...websiteLd(), inLanguage: lang === 'en' ? 'en' : LANG[lang] }} />

      {/* ---- What the house is, said plainly enough to be quoted ---- */}
      <section className={styles.intro} aria-labelledby="intro-heading">
        <Reveal>
          <h2 id="intro-heading" className={styles.introTitle}>{c.introH}</h2>
          <p className={styles.introLead}>{c.introLead}</p>
          <ol className={styles.introSteps}>
            {c.steps(COLOURS.silk, COLOURS.linen).map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
          <ButtonLink href={to('/made-to-measure')} variant="rule">
            {c.introCta}
          </ButtonLink>
        </Reveal>
      </section>

      {/* ---- The house in three lines ---- */}
      <section className={styles.pillars}>
        <div className={styles.pillarGrid}>
          {c.pillars.map((p, i) => (
            <Reveal key={p.title} className={styles.pillar} delay={i * 0.1}>
              <h2 className={styles.pillarTitle}>{p.title}</h2>
              <p className={styles.pillarBody}>{p.body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---- This season ----
          Rendered only when the open collection actually holds pieces; an
          empty rail is worse than no rail. */}
      {SEASON.length > 0 && (
        <section className={styles.season} aria-labelledby="season-heading">
          <div className="u-wrap">
            <RuleDraw />
          </div>
          <div className={styles.sectionHead}>
            <h2 id="season-heading" className={styles.sectionTitle}>
              {c.seasonH}
            </h2>
            <span className={styles.sectionMeta}>{OPEN?.season}</span>
          </div>

          <DragRail label={c.seasonRail}>
            {SEASON.map((piece) => (
              <article key={piece.id} className={styles.tile}>
                <Link href={piecePathIn(lang, piece)}>
                  <ShotFrame
                    src={piece.images[0]}
                    alt={pieceName(piece.name, lang)}
                    note={piece.images.length ? undefined : piece.shot}
                    weave={piece.group === 'men' ? 'sand' : 'bone'}
                  />
                  <div className={styles.tileMeta}>
                    <span>{pieceName(piece.name, lang)}</span>
                    <span className={styles.tilePrice}>{money(piece.price)}</span>
                  </div>
                  <div className={styles.tileMaterial}>{piece.material}</div>
                </Link>
              </article>
            ))}
          </DragRail>

          <p className={styles.railHint}>{c.railHint}</p>
        </section>
      )}

      {/* ---- Design your own ---- */}
      <section className={styles.commission} aria-labelledby="commission-heading">
        <div className={styles.commissionGrid}>
          <ClothWipe>
            <ShotFrame
              weave="forest"
              ratio="4 / 5"
              src="/images/commission.webp"
              alt={c.designAlt}
              onDark
            />
          </ClothWipe>

          <Reveal delay={0.12}>
            <span className={styles.eyebrow}>{c.eyebrowDesign}</span>
            <h2 id="commission-heading" className={`${styles.commissionTitle} u-balance`}>
              {c.designH}
            </h2>
            <p className={styles.commissionBody}>{c.designBody}</p>
            <div className={styles.commissionCta}>
              <ButtonLink href="/design" variant="ruleOnDark">
                {c.designCta}
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---- The atelier ---- */}
      <section className={styles.atelier} aria-labelledby="atelier-heading">
        <div className={styles.atelierGrid}>
          <Reveal>
            <span className={styles.eyebrowDark}>{c.eyebrowAtelier}</span>
            <h2 id="atelier-heading" className={`${styles.sectionHeading} u-balance`}>
              {c.atelierH}
            </h2>
            <p className={styles.prose}>{c.atelierBody}</p>
          </Reveal>

          <div className={styles.atelierPair}>
            <Parallax distance={34} style={{ aspectRatio: '3 / 4' }}>
              <ShotFrame
                weave="bone"
                ratio="auto"
                src="/images/atelier-needle.webp"
                alt={c.atelierAlts[0]}
                style={{ height: '130%', marginTop: '-15%' }}
              >
                <ChalkMark
                  label={c.chalk}
                  style={{ position: 'absolute', right: -8, top: '38%' }}
                />
              </ShotFrame>
            </Parallax>

            <Parallax
              distance={-34}
              className={styles.atelierPairLower}
              style={{ aspectRatio: '3 / 4' }}
            >
              <ShotFrame
                weave="sand"
                ratio="auto"
                src="/images/atelier-pin.webp"
                alt={c.atelierAlts[1]}
                style={{ height: '130%', marginTop: '-15%' }}
              />
            </Parallax>
          </div>
        </div>
      </section>

      {/* ---- High frequency ---- */}
      <section className={styles.frequency} aria-labelledby="frequency-heading">
        <div className={styles.frequencyGrid}>
          <Reveal className={styles.frequencyHead}>
            <span className={styles.eyebrowDark}>{c.eyebrowFreq}</span>
            <h2 id="frequency-heading" className={`${styles.sectionHeading} u-balance`}>
              {c.freqH}
            </h2>
          </Reveal>

          <div className={styles.frequencyList}>
            {c.freq.map((f, i) => (
              <Reveal key={f.title} className={styles.frequencyItem}>
                <span className={styles.frequencyNum}>{`0${i + 1}`}</span>
                <h3 className={styles.frequencyTitle}>{f.title}</h3>
                <p className={styles.frequencyBody}>{f.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---- The cloth ---- */}
      <section className={styles.cloth} aria-labelledby="cloth-heading">
        <div className={styles.clothInner}>
          <Reveal>
            <span className={styles.eyebrowDark}>{c.eyebrowCloth}</span>
            <h2 id="cloth-heading" className={`${styles.clothTitle} u-balance`}>
              {c.clothH}
            </h2>
          </Reveal>

          <div className={styles.clothColumns}>
            <Reveal delay={0.08}>
              <p className={styles.clothProse}>{c.clothP1}</p>
            </Reveal>
            <Reveal delay={0.16}>
              <p className={styles.clothProse}>{c.clothP2}</p>
            </Reveal>
          </div>

          <RuleDraw color="var(--gold-45)" style={{ marginTop: 'clamp(48px,6vw,86px)' }} />

          <dl className={styles.clothStats}>
            <div className={styles.stat}>
              <dd className={styles.statNum}>
                <Count to={100} suffix="%" />
              </dd>
              <dt className={styles.statLabel}>{c.statCloth}</dt>
            </div>
            <div className={styles.stat}>
              <dd className={styles.statNum}>
                <Count to={IN_SEASON.length} />
              </dd>
              <dt className={styles.statLabel}>{c.statDesigns(OPEN?.season)}</dt>
            </div>
          </dl>
        </div>
      </section>
    </div>
  );
}
