import Link from 'next/link';
import type { Metadata } from 'next';
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
import { currentCollection, getPieces, money, piecesIn } from '@/lib/catalog';
import { COLOURS, priceRange } from '@/lib/house';
import { websiteLd } from '@/lib/jsonld';
import styles from './home.module.css';

export async function generateMetadata(): Promise<Metadata> {
  const range = priceRange(await getPieces());
  return {
    title: { absolute: 'LINSILK | Made-to-measure silk and linen clothing from Geneva' },
    description:
      `LINSILK makes silk and linen clothing to your own measurements in 2–4 weeks. ` +
      `${COLOURS.silk} silk and ${COLOURS.linen} linen colours${range ? `, from ${money(range.from)}` : ''}. No fittings needed. From Geneva.`,
    alternates: { canonical: '/' },
  };
}

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
          <Reveal y={10}>
            <h1 className={styles.kicker}>Made-to-measure silk and linen clothing, from Geneva</h1>
          </Reveal>
          <LineRise delay={0.15}>
            <span className={styles.heroLine} style={{ display: 'block' }}>
              Cut from silk and linen.
            </span>
            <span className={styles.heroLine} style={{ display: 'block' }}>
              Sewn to your measurements.
            </span>
            <span
              className={`${styles.heroLine} ${styles.heroLineItalic}`}
              style={{ display: 'block' }}
            >
              Made for you in 2–4 weeks.
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

      <JsonLd data={websiteLd()} />

      {/* ---- What the house is, said plainly enough to be quoted ---- */}
      <section className={styles.intro} aria-labelledby="intro-heading">
        <Reveal>
          <h2 id="intro-heading" className={styles.introTitle}>How ordering works</h2>
          <p className={styles.introLead}>
            LINSILK is a made-to-measure silk and linen clothing house based in Geneva,
            Switzerland. You choose a piece, choose its colour from swatches of the cloth,
            enter your own measurements, and it is cut and sewn for you in 2–4 weeks.
          </p>
          <ol className={styles.introSteps}>
            <li>Choose a piece from the women’s or men’s collection.</li>
            <li>Choose its colour: {COLOURS.silk} silk colours, {COLOURS.linen} linen colours.</li>
            <li>Enter your measurements. No fittings: measure yourself, or take the guide to any tailor.</li>
            <li>It is cut and sewn in 2–4 weeks from your confirmed sheet, then sent with tracking.</li>
          </ol>
          <ButtonLink href="/made-to-measure" variant="rule">
            How made-to-measure works
          </ButtonLink>
        </Reveal>
      </section>

      {/* ---- The house in three lines ---- */}
      <section className={styles.pillars}>
        <div className={styles.pillarGrid}>
          <Reveal className={styles.pillar}>
            <h2 className={styles.pillarTitle}>Luxury, premium-quality material</h2>
            <p className={styles.pillarBody}>
              Silk and linen of the finest grade, chosen for how they feel against the
              skin before how they look on a hanger. Every LINSILK garment is made in
              100% silk or 100% linen cloth: no polyester and no blended cloth.
            </p>
          </Reveal>
          <Reveal className={styles.pillar} delay={0.1}>
            <h2 className={styles.pillarTitle}>Made to your fit and measurements</h2>
            <p className={styles.pillarBody}>
              No size chart, no nearest size. Each piece is cut after you send your
              measurements, so it sits, falls and moves with your body and no one
              else’s.
            </p>
          </Reveal>
          <Reveal className={styles.pillar} delay={0.2}>
            <h2 className={styles.pillarTitle}>High-frequency fabric that raises you</h2>
            <p className={styles.pillarBody}>
              Natural cloth from living fibre, light on the body and calm to wear. We
              make it to do more than feel good: to lift how you feel and how you
              carry yourself.
            </p>
          </Reveal>
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
            This season
          </h2>
          <span className={styles.sectionMeta}>{OPEN?.season}</span>
        </div>

        <DragRail label="This season">
            {SEASON.map((piece) => (
              <article key={piece.id} className={styles.tile}>
                <Link href={`/piece/${piece.slug}`}>
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
              alt="Silk chalked with a pattern, with shears, pins and thread"
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

      {/* ---- The atelier ---- */}
      <section className={styles.atelier} aria-labelledby="atelier-heading">
        <div className={styles.atelierGrid}>
          <Reveal>
            <span className={styles.eyebrowDark}>The Atelier</span>
            <h2 id="atelier-heading" className={`${styles.sectionHeading} u-balance`}>
              Clothes made the way they were always meant to be had.
            </h2>
            <p className={styles.prose}>
              LINSILK does not make mass-produced, low-grade, synthetic clothing. Each
              piece is made to your own measurements, so the garment follows your body
              instead of asking your body to follow it. That fit is what lets smooth,
              breathable silk and linen do what they do best: rest lightly on the
              skin, move with you, and stay comfortable from the first hour to the
              last.
            </p>
          </Reveal>

          <div className={styles.atelierPair}>
            <Parallax distance={34} style={{ aspectRatio: '3 / 4' }}>
              <ShotFrame
                weave="bone"
                ratio="auto"
                src="/images/atelier-needle.webp"
                alt="Hands stitching a floral silk by hand"
                style={{ height: '130%', marginTop: '-15%' }}
              >
                <ChalkMark
                  label="shoulder · 41"
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
                alt="Hands pinning a silk top on a dress form"
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
            <span className={styles.eyebrowDark}>High Frequency</span>
            <h2 id="frequency-heading" className={`${styles.sectionHeading} u-balance`}>
              What we mean by high frequency.
            </h2>
          </Reveal>

          <div className={styles.frequencyList}>
            <Reveal className={styles.frequencyItem}>
              <span className={styles.frequencyNum}>01</span>
              <h3 className={styles.frequencyTitle}>Everything is energy</h3>
              <p className={styles.frequencyBody}>
                Physics has said it for a century. Einstein’s E = mc² shows that mass is
                energy held in a very dense form. Look closely at anything you can
                touch, a stone, a hand, a length of silk, and you find atoms that are
                almost entirely empty space, made of particles that are best described
                as vibrations in underlying fields. What feels solid is energy,
                condensed.
              </p>
            </Reveal>

            <Reveal className={styles.frequencyItem}>
              <span className={styles.frequencyNum}>02</span>
              <h3 className={styles.frequencyTitle}>All energy has a frequency</h3>
              <p className={styles.frequencyBody}>
                Energy vibrates, and each kind vibrates differently: light, sound, heat,
                and the activity of your own body. Cloth lies against you all day, so we
                believe it belongs in that picture. We want our clothes not only to feel
                comfortable but to raise your natural frequency. Silk and linen come from
                living things, the silkworm and the flax plant, and we hold that they
                carry that life into the garment.
              </p>
            </Reveal>

            <Reveal className={styles.frequencyItem}>
              <span className={styles.frequencyNum}>03</span>
              <h3 className={styles.frequencyTitle}>What synthetics take away</h3>
              <p className={styles.frequencyBody}>
                PU, polyester, nylon and other plastic-based fabrics are made from
                petrochemicals. They trap heat and moisture against the skin, shed
                microplastic fibres as they are worn and washed, and often carry finishing
                chemicals that sit on your skin for hours a day. Over years, that can mean
                irritation and discomfort, and the effect of long plastic exposure on the
                body is still being studied. In our view a cloth with no life in it dulls
                your energy rather than lifting it, which is why we use none.
              </p>
            </Reveal>
          </div>
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
                Premium silk and premium linen, and nothing else: no polyester and no
                blended cloth. Synthetic fibre is cheaper to sew and it holds a press
                longer, which is precisely why so much clothing is made from it.
              </p>
            </Reveal>
            <Reveal delay={0.16}>
              <p className={styles.clothProse}>
                Natural fibre moves, creases and ages. A linen shirt worn through one
                summer will not look the way it looked in the photograph, and that is
                the point of it. Silk and linen breathe and rest lightly on the skin, which
                is why comfort comes first.
              </p>
            </Reveal>
          </div>

          <RuleDraw color="var(--gold-45)" style={{ marginTop: 'clamp(48px,6vw,86px)' }} />

          <dl className={styles.clothStats}>
            <div className={styles.stat}>
              <dd className={styles.statNum}>
                <Count to={100} suffix="%" />
              </dd>
              <dt className={styles.statLabel}>silk or linen cloth</dt>
            </div>
            <div className={styles.stat}>
              <dd className={styles.statNum}>
                <Count to={IN_SEASON.length} />
              </dd>
              <dt className={styles.statLabel}>
                {OPEN ? `designs in ${OPEN.season}` : 'designs this season'}
              </dt>
            </div>
          </dl>
        </div>
      </section>
    </>
  );
}
