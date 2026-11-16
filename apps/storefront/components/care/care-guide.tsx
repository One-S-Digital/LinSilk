'use client';

import { useLenis } from 'lenis/react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { createContext, useContext, useState, useSyncExternalStore } from 'react';
import { HeroMedia, Reveal, RuleDraw, Stagger } from '@/components/motion';
import { careCopy, CLOTH_KEYS, type ClothCare, type ClothKey, type StainKey } from '@/lib/care-guide';
import type { Lang } from '@/lib/i18n';
import { localHref } from '@/lib/locale-routes';
import { CareIcon, type IconName } from './care-icon';
import styles from './care-guide.module.css';

/* The care guide at /care. The box a piece arrives in carries one QR code to
 * this page, so it opens on a phone, often with the piece in hand: the cloth
 * cards come first, and every cloth section is one tap from the switcher. */

const EASE = [0.16, 1, 0.3, 1] as const;

const CareCtx = createContext<{ lang: Lang; copy: ReturnType<typeof careCopy> }>({
  lang: 'en',
  copy: careCopy('en'),
});
const useCare = () => useContext(CareCtx);

const subscribeHash = (fn: () => void) => {
  window.addEventListener('hashchange', fn);
  return () => window.removeEventListener('hashchange', fn);
};
const readHash = () => window.location.hash.slice(1);

export function CareGuide({ lang = 'en' }: { lang?: Lang }) {
  const copy = careCopy(lang);
  const { CARE, PAGE } = copy;
  /* A link such as /care#linen opens on that cloth; a tap overrides it. */
  const hash = useSyncExternalStore(subscribeHash, readHash, () => '');
  const [picked, setPicked] = useState<ClothKey | null>(null);
  const fromHash = CLOTH_KEYS.includes(hash as ClothKey) ? (hash as ClothKey) : null;
  const cloth: ClothKey = picked ?? fromHash ?? 'silk';
  const chosen = Boolean(picked ?? fromHash);
  const lenis = useLenis();

  const choose = (k: ClothKey, jump: boolean) => {
    setPicked(k);
    window.history.replaceState(null, '', `#${k}`);
    if (!jump) return;
    const el = document.getElementById('guide');
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: -118 });
    else el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const c = CARE[cloth];

  return (
    <CareCtx.Provider value={{ lang, copy }}>
    <article className={styles.page}>
      {/* ---- Welcome ---- */}
      <section className={styles.hero}>
        <HeroMedia className={styles.heroMedia}>
          <Image
            src="/images/cloth-folded.webp"
            alt=""
            fill
            priority
            sizes="100vw"
            style={{ objectFit: 'cover' }}
          />
        </HeroMedia>
        <div className={styles.heroScrim} />
        <div className={styles.heroInner}>
          <Reveal y={16} delay={0.1}>
            <p className={styles.kicker}>{PAGE.kicker}</p>
            <h1 className={styles.heroTitle}>{PAGE.title}</h1>
            <p className={styles.heroLead}>{PAGE.lead}</p>
          </Reveal>
        </div>
      </section>

      {/* ---- Choose your cloth ---- */}
      <section className={styles.choose} aria-labelledby="choose-h">
        <h2 id="choose-h" className={styles.chooseH}>
          {PAGE.chooseH}
        </h2>
        <Stagger className={styles.cards} step={0.08}>
          {CLOTH_KEYS.map((k) => (
            <button
              key={k}
              type="button"
              className={styles.card}
              data-active={chosen && cloth === k ? '' : undefined}
              aria-pressed={chosen && cloth === k}
              onClick={() => choose(k, true)}
            >
              <span className={styles.cardImage}>
                <Image src={CARE[k].texture} alt="" fill sizes="(max-width: 720px) 50vw, 25vw" />
              </span>
              <span className={styles.cardText}>
                <span className={styles.cardName}>{CARE[k].name}</span>
                <span className={styles.cardFeel}>{CARE[k].feel}</span>
              </span>
              <CareIcon name="arrow" size={18} className={styles.cardArrow} />
            </button>
          ))}
        </Stagger>
      </section>

      {/* ---- Switcher, held under the header until the cloth-specific
              part ends (cloth sections, stains, table) ---- */}
      <div>
      <nav className={styles.switcher} aria-label={PAGE.switcherLabel}>
        <div className={styles.switcherInner} role="tablist">
          {CLOTH_KEYS.map((k) => (
            <button
              key={k}
              type="button"
              role="tab"
              aria-selected={cloth === k}
              aria-controls="guide"
              className={styles.tab}
              onClick={() => choose(k, true)}
            >
              {CARE[k].name}
              {cloth === k && (
                <motion.span layoutId="care-tab" className={styles.tabLine} transition={{ duration: 0.45, ease: EASE }} />
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* ---- The chosen cloth ---- */}
      <div id="guide" role="tabpanel" aria-label={c.name} className={styles.guide}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={cloth}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            <ClothSections c={c} cloth={cloth} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ---- Shared help ---- */}
      <StainFirstAid cloth={cloth} />
      <ClothTable cloth={cloth} onPick={(k) => choose(k, true)} />
      </div>
      <SymbolDecoder />
      <Travel />
      <Help />
    </article>
    </CareCtx.Provider>
  );
}

/* ------------------------------------------------------------------ */

function SectionHead({ id, title, intro }: { id: string; title: string; intro?: string }) {
  return (
    <div className={styles.head}>
      <RuleDraw />
      <h2 id={id} className={styles.h2}>
        {title}
      </h2>
      {intro && <p className={styles.intro}>{intro}</p>}
    </div>
  );
}

function TipList({ tips }: { tips: { icon: IconName; text: string }[] }) {
  return (
    <ul className={styles.tips}>
      {tips.map((t) => (
        <li key={t.text}>
          <span className={styles.tipIcon}>
            <CareIcon name={t.icon} size={26} />
          </span>
          <span>{t.text}</span>
        </li>
      ))}
    </ul>
  );
}

function ClothSections({ c, cloth }: { c: ClothCare; cloth: ClothKey }) {
  const { PAGE } = useCare().copy;
  return (
    <>
      {/* At a glance */}
      <section className={styles.band} aria-labelledby="glance-h">
        <div className={styles.wrap}>
          <p className={styles.eyebrow}>{c.name}</p>
          <h2 id="glance-h" className={styles.glanceH}>
            {PAGE.glanceH}
          </h2>
          <ul className={styles.glance}>
            {c.glance.map((g) => (
              <li key={g.label} className={styles.glanceItem}>
                <CareIcon name={g.icon} size={44} className={styles.glanceIcon} />
                <span>{g.label}</span>
              </li>
            ))}
          </ul>
          <ol className={styles.rules}>
            {c.rules.map((r, i) => (
              <li key={r}>
                <span className={styles.ruleNo}>{String(i + 1).padStart(2, '0')}</span>
                <span>{r}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <div className={styles.wrap}>
        {c.notice && (
          <aside className={styles.notice}>
            <CareIcon name="info" size={28} className={styles.noticeIcon} />
            <div>
              <p className={styles.noticeTitle}>{c.notice.title}</p>
              <p className={styles.noticeBody}>{c.notice.body}</p>
            </div>
          </aside>
        )}

        {/* Wash */}
        <section className={styles.section} aria-labelledby="wash-h">
          <SectionHead id="wash-h" title={c.washH} intro={c.washIntro} />
          <ol className={styles.steps} data-count={c.wash.length}>
            {c.wash.map((s, i) => (
              <li key={s.title} className={styles.step}>
                <span className={styles.stepNo}>{String(i + 1).padStart(2, '0')}</span>
                <CareIcon name={s.icon} size={52} className={styles.stepIcon} />
                <h3 className={styles.stepTitle}>{s.title}</h3>
                <p className={styles.stepBody}>{s.body}</p>
              </li>
            ))}
          </ol>
          {c.washAlt && (
            <div className={styles.alt}>
              <CareIcon name={cloth === 'cashmere' ? 'wash30Wool' : 'wash30Gentle'} size={40} />
              <div>
                <p className={styles.altTitle}>{c.washAlt.title}</p>
                <p className={styles.altBody}>{c.washAlt.body}</p>
              </div>
            </div>
          )}
        </section>

        {/* Dry and press */}
        <div className={styles.pair}>
          <section className={styles.section} aria-labelledby="dry-h">
            <SectionHead id="dry-h" title={c.dryH ?? PAGE.dryH} />
            <TipList tips={c.dry} />
            <p className={styles.never}>
              <CareIcon name="noTumble" size={22} />
              {c.dryNever}
            </p>
          </section>

          <section className={styles.section} aria-labelledby="press-h">
            <SectionHead id="press-h" title={PAGE.pressH} />
            <div className={styles.pressGraphics}>
              <HeatDial heat={c.heat} label={c.heatLabel} />
              <SteamDistance />
            </div>
            <TipList tips={c.press} />
          </section>
        </div>

        {/* Wear */}
        <section className={styles.section} aria-labelledby="wear-h">
          <SectionHead id="wear-h" title={PAGE.wearH} />
          <ul className={styles.wear}>
            {c.wear.map((t) => (
              <li key={t.text}>
                <CareIcon name={t.icon} size={34} className={styles.wearIcon} />
                <p>{t.text}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Store */}
        <section className={styles.section} aria-labelledby="store-h">
          <SectionHead id="store-h" title={PAGE.storeH} />
          <StoreDiagram method={c.store.method} label={c.store.label} />
          <TipList tips={c.store.tips} />
        </section>

        {/* Keep and avoid */}
        <section className={styles.keepAvoid} aria-label={`${PAGE.keepH} / ${PAGE.avoidH}`}>
          <div className={styles.keep}>
            <h3 className={styles.kaH}>{PAGE.keepH}</h3>
            <ul>
              {c.keep.map((k) => (
                <li key={k}>
                  <CareIcon name="check" size={18} className={styles.kaIcon} />
                  {k}
                </li>
              ))}
            </ul>
          </div>
          <div className={styles.avoid}>
            <h3 className={styles.kaH}>{PAGE.avoidH}</h3>
            <ul>
              {c.avoid.map((k) => (
                <li key={k}>
                  <CareIcon name="cross" size={18} className={styles.kaIcon} />
                  {k}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */

function HeatDial({ heat, label }: { heat: 0 | 1 | 2 | 3; label: string }) {
  const { PAGE } = useCare().copy;
  const dots = [56, 73, 90];
  return (
    <figure className={styles.graphic}>
      <svg viewBox="0 0 120 84" className={styles.graphicSvg} aria-hidden="true">
        <path
          d="M12.5 72.5 23 42c2.5-6.5 7.5-9.5 14.5-9.5h65v40z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        <path
          d="M45 32.5v-10c0-6 4-10 10-10h47.5v20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        {dots.map((x, i) => (
          <circle
            key={x}
            cx={x}
            cy="56"
            r="4.2"
            className={i < heat ? styles.dotOn : styles.dotOff}
          />
        ))}
        {heat === 0 && <path d="M8 8l104 70M112 8 8 78" stroke="var(--gold)" strokeWidth="1.2" />}
      </svg>
      <figcaption>
        <span className={styles.figLabel}>{PAGE.heatCaption}</span>
        {label}
      </figcaption>
    </figure>
  );
}

function SteamDistance() {
  const { PAGE } = useCare().copy;
  return (
    <figure className={styles.graphic}>
      <svg viewBox="0 0 120 84" className={styles.graphicSvg} aria-hidden="true">
        <g fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          {/* the steamer */}
          <path d="M10 22h22v13H10zM16 35l4 38h7l-3-38" />
          {/* the cloth, hanging */}
          <path d="M102 6c-4 12 4 24 0 36s4 24 0 36" />
          <path d="M108 6c-4 12 4 24 0 36s4 24 0 36" opacity=".5" />
          {/* steam */}
          <path d="M42 22c3 2-3 4 0 6s-3 4 0 6M52 19c3 2-3 4 0 6s-3 4 0 6M62 23c3 2-3 4 0 6s-3 4 0 6" opacity=".7" />
        </g>
        {/* the distance */}
        <g stroke="var(--gold)" strokeWidth="1" fill="none" strokeLinecap="round">
          <path d="M34 52h64M38 48l-4 4 4 4M94 48l4 4-4 4" />
        </g>
      </svg>
      <figcaption>
        <span className={styles.figLabel}>{PAGE.steam}</span>
        {PAGE.steamDistance}
      </figcaption>
    </figure>
  );
}

const STORE_METHODS: { key: ClothCare['store']['method']; icon: IconName }[] = [
  { key: 'padded', icon: 'hangerPadded' },
  { key: 'wide', icon: 'hangerWide' },
  { key: 'clip', icon: 'hangerClip' },
  { key: 'roll', icon: 'roll' },
];

function StoreDiagram({ method, label }: { method: ClothCare['store']['method']; label: string }) {
  const { PAGE } = useCare().copy;
  return (
    <div className={styles.store}>
      <ul className={styles.storeRow} aria-hidden="true">
        {STORE_METHODS.map((m) => (
          <li key={m.key} data-on={m.key === method ? '' : undefined}>
            <CareIcon name={m.icon} size={46} />
            <span>{PAGE.methods[m.key]}</span>
          </li>
        ))}
      </ul>
      <p className={styles.storeLabel}>{label}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function StainFirstAid({ cloth }: { cloth: ClothKey }) {
  const { CARE, PAGE, STAINS } = useCare().copy;
  const [stain, setStain] = useState<StainKey>('wine');
  const s = STAINS.find((x) => x.key === stain)!;
  const steps = cloth === 'linen' ? s.linen : s.delicate;
  const still = useReducedMotion();

  return (
    <section className={`${styles.section} ${styles.wrap}`} aria-labelledby="stain-h">
      <SectionHead id="stain-h" title={PAGE.stainsH} intro={PAGE.stainsLead} />
      <div className={styles.chips} role="radiogroup" aria-label={PAGE.stainsH}>
        {STAINS.map((x) => (
          <button
            key={x.key}
            type="button"
            role="radio"
            aria-checked={stain === x.key}
            className={styles.chip}
            onClick={() => setStain(x.key)}
          >
            <CareIcon name={x.icon} size={22} />
            {x.label}
          </button>
        ))}
      </div>
      <div className={styles.stainPanel} aria-live="polite">
        <p className={styles.stainFor}>
          {s.label} · {PAGE.stainsFor} {CARE[cloth].forCloth}
        </p>
        <AnimatePresence mode="wait" initial={false}>
          <motion.ol
            key={`${stain}-${cloth === 'linen'}`}
            className={styles.stainSteps}
            initial={still ? false : { opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={still ? undefined : { opacity: 0, x: -10 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            {steps.map((t, i) => (
              <li key={t}>
                <span className={styles.stainNo}>{i + 1}</span>
                <span>{t}</span>
              </li>
            ))}
          </motion.ol>
        </AnimatePresence>
        {cloth === 'linen' && (
          <p className={styles.stainStop}>
            <CareIcon name="info" size={22} />
            {PAGE.stainsLinenFirst}
          </p>
        )}
        <p className={styles.stainStop}>
          <CareIcon name="dryCleanP" size={22} />
          {PAGE.stainsStop}
        </p>
      </div>
    </section>
  );
}

function ClothTable({ cloth, onPick }: { cloth: ClothKey; onPick: (k: ClothKey) => void }) {
  const { CARE, PAGE, TABLE } = useCare().copy;
  return (
    <section className={`${styles.section} ${styles.wrap}`} aria-labelledby="table-h">
      <SectionHead id="table-h" title={PAGE.tableH} />
      <div className={styles.tableScroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              <td />
              {CLOTH_KEYS.map((k) => (
                <th key={k} scope="col" data-on={k === cloth ? '' : undefined}>
                  <button type="button" onClick={() => onPick(k)}>
                    {CARE[k].name}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TABLE.map((row) => (
              <tr key={row.label}>
                <th scope="row">{row.label}</th>
                {CLOTH_KEYS.map((k) => (
                  <td key={k} data-on={k === cloth ? '' : undefined}>
                    {row.values[k]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function SymbolDecoder() {
  const { PAGE, SYMBOLS } = useCare().copy;
  const all = SYMBOLS.flatMap((f) => f.items);
  const [pick, setPick] = useState<IconName>('noTumble');
  const item = all.find((x) => x.icon === pick)!;

  return (
    <section className={`${styles.section} ${styles.wrap}`} aria-labelledby="symbols-h">
      <SectionHead id="symbols-h" title={PAGE.symbolsH} intro={PAGE.symbolsLead} />
      <div className={styles.symbols}>
        <div className={styles.symbolFamilies}>
          {SYMBOLS.map((f) => (
            <div key={f.family} className={styles.family}>
              <p className={styles.familyName}>{f.family}</p>
              <div className={styles.familyRow}>
                {f.items.map((s) => (
                  <button
                    key={s.icon}
                    type="button"
                    className={styles.symbol}
                    aria-pressed={pick === s.icon}
                    aria-label={s.title}
                    onClick={() => setPick(s.icon)}
                  >
                    <CareIcon name={s.icon} size={34} />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className={styles.symbolCard} aria-live="polite">
          <CareIcon name={item.icon} size={84} className={styles.symbolBig} />
          <p className={styles.symbolTitle}>{item.title}</p>
          <p className={styles.symbolBody}>{item.body}</p>
        </div>
      </div>
    </section>
  );
}

function Travel() {
  const { PAGE, TRAVEL } = useCare().copy;
  return (
    <section className={`${styles.section} ${styles.wrap}`} aria-labelledby="travel-h">
      <SectionHead id="travel-h" title={PAGE.travelH} />
      <ul className={styles.travel}>
        {TRAVEL.map((t) => (
          <li key={t.title}>
            <CareIcon name={t.icon} size={40} className={styles.travelIcon} />
            <h3 className={styles.travelTitle}>{t.title}</h3>
            <p>{t.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Help() {
  const { lang, copy } = useCare();
  const { PAGE } = copy;
  return (
    <section className={styles.help} aria-labelledby="help-h">
      <div className={styles.helpInner}>
        <h2 id="help-h" className={styles.helpH}>
          {PAGE.helpH}
        </h2>
        <p className={styles.helpBody}>{PAGE.helpBody}</p>
        <div className={styles.helpActions}>
          <a className={styles.helpPrimary} href="mailto:hello@bylinsilk.com">
            <CareIcon name="mail" size={20} />
            {PAGE.helpWrite}
          </a>
          <Link className={styles.helpSecondary} href={localHref(lang, '/contact')}>
            {PAGE.helpContact}
          </Link>
          <button type="button" className={styles.helpSecondary} onClick={() => window.print()}>
            <CareIcon name="print" size={20} />
            {PAGE.print}
          </button>
        </div>
        <nav className={styles.more} aria-label={PAGE.more}>
          <span>{PAGE.more}</span>
          {PAGE.moreLinks.map(([href, label]) => (
            <Link key={href} href={localHref(lang, href)}>
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </section>
  );
}
