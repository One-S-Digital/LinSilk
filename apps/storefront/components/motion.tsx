'use client';

/* LinSilk — motion primitives.
 *
 * Ported and extended from the prototype's `motion-fx.jsx`. The vocabulary is
 * deliberately drawn from the house's own craft rather than generic web motion:
 * cloth unrolls, chalk lines snap, silk catches light, rules draw like a tailor
 * marking a pattern. One easing curve governs everything.
 *
 * Every primitive degrades to a static, fully visible element under
 * `prefers-reduced-motion`, and carries `data-reveal` so the <noscript> rule in
 * layout.tsx can force the resting state when JS never arrives.
 */

import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
  type Transition,
} from 'motion/react';
import {
  Children,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';

/** The single house easing curve. Matches the prototype exactly. */
export const EASE = [0.16, 1, 0.3, 1] as const;

const base = (duration: number, delay = 0): Transition => ({
  duration,
  delay,
  ease: EASE,
});

type Common = {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  delay?: number;
};

/* ------------------------------------------------------------------ *
 * Reveal — the workhorse. Rises and fades as it enters the viewport.
 * ------------------------------------------------------------------ */

export function Reveal({
  children,
  className,
  style,
  delay = 0,
  y = 28,
  duration = 0.9,
  blur = false,
  as: As = 'div',
}: Common & {
  y?: number;
  duration?: number;
  blur?: boolean;
  as?: 'div' | 'section' | 'article' | 'header' | 'li';
}) {
  const still = useReducedMotion();
  const M = motion[As];

  if (still) {
    return (
      <As className={className} style={style}>
        {children}
      </As>
    );
  }

  return (
    <M
      data-reveal
      className={className}
      style={style}
      initial={{ opacity: 0, y, filter: blur ? 'blur(6px)' : 'blur(0px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, amount: 0.2, margin: '0px 0px -8% 0px' }}
      transition={base(duration, delay)}
    >
      {children}
    </M>
  );
}

/* ------------------------------------------------------------------ *
 * Stagger — sequences direct children.
 *
 * The prototype wrapped each child in a `display: contents` motion box, which
 * removes the element's box altogether and silently kills transform and
 * opacity. Here the wrapper *is* the grid or flex item, so the animation lands
 * and the parent's layout is unchanged.
 * ------------------------------------------------------------------ */

export function Stagger({
  children,
  className,
  style,
  step = 0.07,
  delay = 0,
  y = 24,
}: Common & { step?: number; y?: number }) {
  const still = useReducedMotion();
  const items = Children.toArray(children);

  if (still) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={className}
      style={style}
      initial="rest"
      whileInView="shown"
      viewport={{ once: true, amount: 0.15 }}
      variants={{
        rest: {},
        shown: { transition: { staggerChildren: step, delayChildren: delay } },
      }}
    >
      {items.map((child, i) => (
        <motion.div
          key={i}
          data-reveal
          variants={{
            rest: { opacity: 0, y },
            shown: { opacity: 1, y: 0, transition: base(0.85) },
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ *
 * LineRise — masked line-by-line rise. The hero's signature move: each
 * child is one line, rising out of its own overflow mask like type being
 * set. Runs on load, not on scroll, so the first frame is never empty.
 * ------------------------------------------------------------------ */

export function LineRise({
  children,
  className,
  style,
  delay = 0,
  step = 0.09,
  duration = 1.05,
}: Common & { step?: number; duration?: number }) {
  const still = useReducedMotion();
  const lines = Children.toArray(children);

  if (still) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  return (
    <div className={className} style={style}>
      {lines.map((line, i) => (
        <span key={i} style={{ display: 'block', overflow: 'hidden' }}>
          <motion.span
            data-reveal
            style={{ display: 'block', willChange: 'transform' }}
            initial={{ y: '110%' }}
            animate={{ y: '0%' }}
            transition={base(duration, delay + i * step)}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * ClothWipe — an image reveal that unrolls rather than fades, with the
 * picture settling back from a slight over-scale as the edge passes.
 * ------------------------------------------------------------------ */

export function ClothWipe({
  children,
  className,
  style,
  delay = 0,
  duration = 1.15,
  from = 'left',
}: Common & { duration?: number; from?: 'left' | 'right' | 'bottom' }) {
  const still = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, amount: 0.25 });

  const closed =
    from === 'left'
      ? 'inset(0 100% 0 0)'
      : from === 'right'
        ? 'inset(0 0 0 100%)'
        : 'inset(100% 0 0 0)';

  if (still) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  /* The in-view test runs on this plain outer element. A fully clipped element
     reports zero visible area to IntersectionObserver, so observing the
     clipped one itself could never reach the threshold and the picture would
     stay hidden for good. */
  return (
    <div ref={ref} className={className} style={style}>
      <motion.div
        data-reveal
        style={{ overflow: 'hidden', width: '100%', height: '100%' }}
        initial={{ clipPath: closed }}
        animate={{ clipPath: seen ? 'inset(0 0 0 0)' : closed }}
        transition={base(duration, delay)}
      >
        <motion.div
          style={{ width: '100%', height: '100%' }}
          initial={{ scale: 1.08 }}
          animate={{ scale: seen ? 1 : 1.08 }}
          transition={base(duration + 0.35, delay)}
        >
          {children}
        </motion.div>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * RuleDraw — the hairline rules that separate every section, drawn
 * across like a chalk line snapped along cloth instead of just appearing.
 * ------------------------------------------------------------------ */

export function RuleDraw({
  className,
  style,
  delay = 0,
  duration = 1.1,
  color = 'var(--gold-35)',
}: Omit<Common, 'children'> & { duration?: number; color?: string }) {
  const still = useReducedMotion();

  const line: CSSProperties = {
    height: 1,
    width: '100%',
    background: color,
    transformOrigin: 'left center',
    ...style,
  };

  if (still) return <div className={className} style={line} />;

  return (
    <motion.div
      data-reveal
      className={className}
      style={line}
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, amount: 1 }}
      transition={base(duration, delay)}
    />
  );
}

/* ------------------------------------------------------------------ *
 * ChalkMark — the tailor's annotation on a product shot. The leader line
 * is struck first, then the handwriting settles beside it.
 * ------------------------------------------------------------------ */

export function ChalkMark({
  label,
  className,
  style,
  delay = 0.5,
}: Omit<Common, 'children'> & { label: string }) {
  const still = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, amount: 0.6 });
  const on = still || seen;

  return (
    <div
      ref={ref}
      className={className}
      style={{ display: 'flex', alignItems: 'center', gap: 10, ...style }}
      aria-hidden="true"
    >
      <motion.span
        data-reveal
        style={{
          display: 'block',
          width: 'clamp(40px, 7vw, 88px)',
          height: 1,
          background: 'var(--gold)',
          transformOrigin: 'left center',
        }}
        initial={still ? false : { scaleX: 0 }}
        animate={on ? { scaleX: 1 } : undefined}
        transition={base(0.7, delay)}
      />
      <motion.span
        data-reveal
        style={{
          fontFamily: 'var(--font-hand)',
          fontSize: 19,
          color: 'var(--gold)',
          whiteSpace: 'nowrap',
        }}
        initial={still ? false : { opacity: 0, x: -6 }}
        animate={on ? { opacity: 1, x: 0 } : undefined}
        transition={base(0.6, delay + 0.45)}
      >
        {label}
      </motion.span>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Parallax — scroll-linked vertical drift. The child should overflow its
 * frame (height > 100%) so the drift never exposes an edge.
 * ------------------------------------------------------------------ */

export function Parallax({
  children,
  className,
  style,
  distance = 40,
}: Common & { distance?: number }) {
  const still = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], [distance, -distance]);

  if (still) {
    return (
      <div className={className} style={{ overflow: 'hidden', ...style }}>
        {children}
      </div>
    );
  }

  return (
    <div ref={ref} className={className} style={{ overflow: 'hidden', ...style }}>
      <motion.div style={{ y, width: '100%', height: '100%' }}>{children}</motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * HeroMedia — the opening frame settles out of an over-scale on load,
 * then drifts and dims as the page scrolls away from it.
 * ------------------------------------------------------------------ */

export function HeroMedia({ children, className, style }: Common) {
  const still = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.14]);
  const opacity = useTransform(scrollYProgress, [0, 0.85], [1, 0.35]);

  if (still) {
    return (
      <div className={className} style={{ overflow: 'hidden', ...style }}>
        {children}
      </div>
    );
  }

  return (
    <div ref={ref} className={className} style={{ overflow: 'hidden', ...style }}>
      <motion.div
        style={{ scale, opacity, width: '100%', height: '100%' }}
        initial={{ scale: 1.16 }}
        animate={{ scale: 1 }}
        transition={base(2.2)}
      >
        {children}
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Count — counts up once, when scrolled to. Used for the cloth figures.
 * ------------------------------------------------------------------ */

export function Count({
  to,
  suffix = '',
  duration = 1400,
}: {
  to: number;
  suffix?: string;
  duration?: number;
}) {
  const still = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useInView(ref, { once: true, amount: 0.4 });
  const [value, setValue] = useState(still ? to : 0);

  useEffect(() => {
    if (!seen || still) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      setValue(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seen, still, to, duration]);

  return (
    <span ref={ref} style={{ fontVariantNumeric: 'tabular-nums' }}>
      {value}
      {suffix}
    </span>
  );
}

/* ------------------------------------------------------------------ *
 * PageFade — cross-fade between routes.
 * ------------------------------------------------------------------ */

export function PageFade({ children, pageKey }: { children: ReactNode; pageKey: string }) {
  const still = useReducedMotion();
  if (still) return <>{children}</>;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pageKey}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={base(0.5)}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
