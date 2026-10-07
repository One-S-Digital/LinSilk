import Link from 'next/link';
import {
  ClothWipe,
  Count,
  HeroMedia,
  LineRise,
  Reveal,
  RuleDraw,
} from '@/components/motion';
import { HeroShutter } from '@/components/hero-shutter';
import { DragRail } from '@/components/drag-rail';
import { ShotFrame } from '@/components/shot';
import { ButtonLink } from '@/components/ui/button';
import { currentCollection, money, piecesIn } from '@/lib/catalog';
import styles from './home.module.css';

export default async function HomePage() {
  /* The season rail leads with the women's opening five, then the men's first
     three — the order the lookbook is shot in. Always the open collection. */
  const OPEN = await currentCollection();
  const IN_SEASON = OPEN ? await piecesIn(OPEN.slug) : [];
  const SEASON = [
    ...IN_SEASON.filter((p) => p.group === 'women').slice(0, 5),
    ...IN_SEASON.filter((p) => p.group === 'men').slice(0, 3),
  ];

  return (
    <>
      {/* ---- Hero ---- */}
      <section className={styles.hero}>
        <HeroMedia className={styles.heroMedia}>
          <HeroShutter />
        </HeroMedia>
        <div className={styles.heroScrim} />

        <div className={styles.heroInner}>
          <LineRise delay={0.15}>
            <span className={styles.kicker} style={{ display: 'block' }}>
              {OPEN?.title ?? ''}
            </span>
            <span className={styles.heroLine} style={{ display: 'block' }}>
              Cut from silk.
            </span>
            <span className={styles.heroLine} style={{ display: 'block' }}>
              Woven by hand.
            </span>
            <span
              className={`${styles.heroLine} ${styles.heroLineItalic}`}
              style={{ display: 'block' }}
            >
              Fitted to you.
            </span>
          </LineRise>

          <div className={styles.heroCtas}>
            <ButtonLink href="/collection/women" variant="onDark">
              Women’s collection
            </ButtonLink>
            <ButtonLink href="/collection/men" variant="onDark">
              Men’s collection
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* ---- Statement ---- */}
      <section className={styles.statement}>
        <Reveal>
          <p className={`${styles.statementText} u-balance`}>
            Each season, a small number of pieces. Made once, then never again.
          </p>
        </Reveal>
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
            This season
          </h2>
          <span className={styles.sectionMeta}>{OPEN?.season}</span>
        </div>

        <DragRail label="This season">
            {SEASON.map((piece) => (
              <article key={piece.id} className={styles.tile}>
                <Link href={`/piece/${piece.id}`}>
                  <ShotFrame
                    src={piece.images[0]}
                    alt={piece.name}
                    note={piece.images.length ? undefined : piece.shot}
                    weave={piece.group === 'men' ? 'sand' : 'bone'}
                  />
                  <div className={styles.tileMeta}>
                    <span>{piece.name}</span>
                    <span className={styles.tilePrice}>{money(piece.price)}</span>
                  </div>
                  <div className={styles.tileMaterial}>{piece.material}</div>
                </Link>
              </article>
            ))}
        </DragRail>

        <p className={styles.railHint}>
          Drag, scroll or use the arrows to move through the season
        </p>
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
              alt="Ivory silk chalked with a pattern, with shears, pins and thread"
              onDark
            />
          </ClothWipe>

          <Reveal delay={0.12}>
            <span className={styles.eyebrow}>Design Your Own</span>
            <h2 id="commission-heading" className={`${styles.commissionTitle} u-balance`}>
              A piece that exists because you described it.
            </h2>
            <p className={styles.commissionBody}>
              Choose a base silhouette, choose the cloth, write to the tailor, submit
              your measurements. The atelier builds one garment to that brief. It is
              the only path where the design is yours before it is ours.
            </p>
            <div className={styles.commissionCta}>
              <ButtonLink href="/design" variant="ruleOnDark">
                Begin a commission
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---- The cloth ---- */}
      <section className={styles.cloth} aria-labelledby="cloth-heading">
        <div className={styles.clothInner}>
          <Reveal>
            <span className={styles.eyebrowDark}>The Cloth</span>
            <h2 id="cloth-heading" className={`${styles.clothTitle} u-balance`}>
              Silk and linen. Nothing else enters the room.
            </h2>
          </Reveal>

          <div className={styles.clothColumns}>
            <Reveal delay={0.08}>
              <p className={styles.clothProse}>
                Mulberry silk, and wet-spun linen from Kortrijk. No
                polyester in the shell, the lining, the pocket bag or the thread.
                Synthetic fibre is cheaper to sew and it holds a press longer, which is
                precisely why most houses use it where you cannot see.
              </p>
            </Reveal>
            <Reveal delay={0.16}>
              <p className={styles.clothProse}>
                Natural fibre moves, creases and ages. A linen jacket worn through one
                summer will not look the way it looked in the photograph, and that is
                the point of it. Every bolt is logged with its mill and its date, and
                that record travels with the garment.
              </p>
            </Reveal>
          </div>

          <RuleDraw color="var(--gold-45)" style={{ marginTop: 'clamp(48px,6vw,86px)' }} />

          <dl className={styles.clothStats}>
            <div className={styles.stat}>
              <dd className={styles.statNum}>
                <Count to={100} suffix="%" />
              </dd>
              <dt className={styles.statLabel}>natural fibre, shell to thread</dt>
            </div>
            <div className={styles.stat}>
              <dd className={styles.statNum}>
                <Count to={IN_SEASON.length} />
              </dd>
              <dt className={styles.statLabel}>
                {OPEN ? `designs in ${OPEN.season}` : 'designs this season'}
              </dt>
            </div>
            <div className={styles.stat}>
              <dd className={styles.statNum}>
                <Count to={0} />
              </dd>
              <dt className={styles.statLabel}>designs ever restocked</dt>
            </div>
          </dl>
        </div>
      </section>
    </>
  );
}
