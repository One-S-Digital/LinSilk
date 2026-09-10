/* Framer Motion wrappers for Maison Ayla.
   Children are template markup, so everything stays editable. */
const { useRef, useState, useEffect } = React;
const FM = () => (typeof window !== 'undefined' && (window.Motion || window.FramerMotion)) || null;

function useFM() {
  const [, force] = useState(0);
  useEffect(() => {
    if (FM()) return;
    let n = 0;
    const t = setInterval(() => { if (FM() || ++n > 60) { clearInterval(t); force(v => v + 1); } }, 80);
    return () => clearInterval(t);
  }, []);
  return FM();
}

const EASE = [0.16, 1, 0.3, 1];

/* x-import applies a `style` attribute to the mount, not to the component,
   so layout for these wrappers arrives as a `css` string prop. */
function parseCss(str) {
  if (!str || typeof str !== 'string') return null;
  const out = {};
  str.split(';').forEach(part => {
    const i = part.indexOf(':');
    if (i < 0) return;
    const k = part.slice(0, i).trim();
    const v = part.slice(i + 1).trim();
    if (!k || !v) return;
    out[k.replace(/-([a-z])/g, (m, c) => c.toUpperCase())] = v;
  });
  return out;
}
function boxOf(props) {
  const a = parseCss(props.css);
  if (!a) return props.style;
  return Object.assign({}, a, props.style || {});
}

function Reveal(props) {
  const fm = useFM();
  const { children, y, delay, duration, once, blur } = props; const style = boxOf(props);
  const dy = y === undefined ? 28 : Number(y);
  if (!fm) return React.createElement('div', { style }, children);
  return React.createElement(fm.motion.div, {
    style,
    initial: { opacity: 0, y: dy, filter: blur ? 'blur(8px)' : 'blur(0px)' },
    whileInView: { opacity: 1, y: 0, filter: 'blur(0px)' },
    viewport: { once: once === false ? false : true, amount: 0.25, margin: '0px 0px -8% 0px' },
    transition: { duration: duration ? Number(duration) : 0.9, delay: delay ? Number(delay) : 0, ease: EASE }
  }, children);
}

/* Staggers its direct children. */
function Stagger(props) {
  const fm = useFM();
  const { children, step, delay, y } = props; const style = boxOf(props);
  const dy = y === undefined ? 24 : Number(y);
  if (!fm) return React.createElement('div', { style }, children);
  const kids = React.Children.toArray(children);
  return React.createElement(fm.motion.div, {
    style,
    initial: 'hidden',
    whileInView: 'shown',
    viewport: { once: true, amount: 0.15 },
    variants: { hidden: {}, shown: { transition: { staggerChildren: step ? Number(step) : 0.1, delayChildren: delay ? Number(delay) : 0 } } }
  }, kids.map((c, i) => React.createElement(fm.motion.div, {
    key: i,
    style: { display: 'contents' },
    variants: { hidden: { opacity: 0, y: dy }, shown: { opacity: 1, y: 0, transition: { duration: 0.85, ease: EASE } } }
  }, c)));
}

/* Vertical parallax tied to scroll position of the wrapper. */
function Parallax(props) {
  const fm = useFM();
  if (!fm) return React.createElement('div', { style: boxOf(props) }, props.children);
  return React.createElement(ParallaxFM, Object.assign({}, props, { fm: fm }));
}
function ParallaxFM(props) {
  const { fm, children } = props;
  const ref = useRef(null);
  const d = props.distance === undefined ? 80 : Number(props.distance);
  const { scrollYProgress } = fm.useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = fm.useTransform(scrollYProgress, [0, 1], [d, -d]);
  return React.createElement('div', { ref: ref, style: { overflow: 'hidden', ...(boxOf(props) || {}) } },
    React.createElement(fm.motion.div, { style: { y: y, height: '100%', width: '100%' } }, children));
}

/* Masked line-by-line rise. Each child is one line. */
function LineRise(props) {
  const fm = useFM();
  const { children, delay } = props; const style = boxOf(props);
  if (!fm) return React.createElement('div', { style }, children);
  const kids = React.Children.toArray(children);
  return React.createElement('div', { style },
    kids.map((c, i) => React.createElement('div', { key: i, style: { overflow: 'hidden' } },
      React.createElement(fm.motion.div, {
        initial: { y: '110%' },
        animate: { y: '0%' },
        transition: { duration: 1.05, delay: (delay ? Number(delay) : 0) + i * 0.09, ease: EASE }
      }, c))));
}

/* Drag- and scroll-to-move horizontal rail. */
function DragRail(props) {
  const fm = useFM();
  if (!fm) return React.createElement('div', { style: { overflowX: 'auto' } },
    React.createElement('div', { style: { display: 'flex', alignItems: 'flex-end', gap: '32px', ...(boxOf(props) || {}) } }, props.children));
  return React.createElement(RailFM, Object.assign({}, props, { fm: fm }));
}

function RailFM(props) {
  const { fm, children } = props;
  const ref = useRef(null);
  const [limit, setLimit] = useState(0);
  const [pos, setPos] = useState(0);
  const x = fm.useMotionValue(0);
  useEffect(() => x.on('change', v => setPos(v)), [x]);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const measure = () => setLimit(Math.max(0, el.scrollWidth - el.parentElement.clientWidth));
    measure();
    const ro = new ResizeObserver(measure); ro.observe(el);
    return () => ro.disconnect();
  }, [children]);
  const onWheel = (e) => {
    const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (!d) return;
    const cur = x.get();
    const next = Math.max(-limit, Math.min(0, cur - d));
    if (next === cur) return;
    e.preventDefault();
    fm.animate(x, next, { type: 'spring', stiffness: 400, damping: 48 });
  };
  const step = () => {
    const p = ref.current && ref.current.parentElement;
    return Math.max(220, (p ? p.clientWidth : 600) * 0.8);
  };
  const nudge = (dir) => {
    const next = Math.max(-limit, Math.min(0, x.get() - dir * step()));
    fm.animate(x, next, { type: 'spring', stiffness: 260, damping: 34 });
  };
  const arrow = (dir, off, on) => React.createElement('button', {
    onClick: () => nudge(dir),
    'aria-label': dir < 0 ? 'Scroll left' : 'Scroll right',
    style: {
      position: 'absolute', top: '50%', transform: 'translateY(-50%)', [off]: '10px', zIndex: 4,
      width: '44px', height: '44px', borderRadius: '50%', border: '1px solid rgba(156,122,68,0.5)',
      background: 'rgba(237,230,217,0.92)', color: '#2A2620', cursor: on ? 'pointer' : 'default',
      opacity: on ? 1 : 0, pointerEvents: on ? 'auto' : 'none', transition: 'opacity .35s ease',
      fontSize: '15px', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center'
    }
  }, dir < 0 ? '\u2190' : '\u2192');
  const inner = { display: 'flex', alignItems: 'flex-end', gap: '32px', cursor: 'grab', ...(boxOf(props) || {}), x: x };
  return React.createElement('div', { style: { position: 'relative', overflow: 'hidden' }, onWheel: onWheel },
    React.createElement(fm.motion.div, {
      ref: ref, style: inner, drag: 'x', dragConstraints: { left: -limit, right: 0 },
      dragElastic: 0.08, dragTransition: { power: 0.3, timeConstant: 260 }, whileTap: { cursor: 'grabbing' }
    }, children),
    arrow(-1, 'left', pos < -2),
    arrow(1, 'right', pos > -limit + 2));
}

/* Cross-fade between pages. */
function PageFade(props) {
  const fm = useFM();
  const { children, pageKey } = props; const style = boxOf(props);
  if (!fm) return React.createElement('div', { style }, children);
  return React.createElement(fm.AnimatePresence, { mode: 'wait' },
    React.createElement(fm.motion.div, {
      key: pageKey, style,
      initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 },
      transition: { duration: 0.5, ease: EASE }
    }, children));
}

/* Slow zoom-out on a hero image, plus scroll fade. */
function HeroMedia(props) {
  const fm = useFM();
  if (!fm) return React.createElement('div', { style: boxOf(props) }, props.children);
  return React.createElement(HeroMediaFM, Object.assign({}, props, { fm: fm }));
}
function HeroMediaFM(props) {
  const { fm, children } = props;
  const ref = useRef(null);
  const { scrollYProgress } = fm.useScroll({ target: ref, offset: ['start start', 'end start'] });
  const scale = fm.useTransform(scrollYProgress, [0, 1], [1, 1.14]);
  const opacity = fm.useTransform(scrollYProgress, [0, 0.85], [1, 0.35]);
  return React.createElement('div', { ref: ref, style: { overflow: 'hidden', ...(boxOf(props) || {}) } },
    React.createElement(fm.motion.div, {
      style: { scale: scale, opacity: opacity, height: '100%', width: '100%' },
      initial: { scale: 1.16 }, animate: { scale: 1 }, transition: { duration: 2.2, ease: EASE }
    }, children));
}

/* Counts up when scrolled into view. */
function Count(props) {
  const fm = useFM();
  const ref = useRef(null);
  const [v, setV] = useState(0);
  const to = Number(props.to || 0);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return; io.disconnect();
      const t0 = performance.now(), dur = 1400;
      const tick = (t) => {
        const p = Math.min(1, (t - t0) / dur);
        setV(Math.round(to * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    io.observe(el); return () => io.disconnect();
  }, [to]);
  return React.createElement('span', { ref, style: props.style }, v, props.suffix || '');
}

module.exports = { Reveal, Stagger, Parallax, LineRise, DragRail, PageFade, HeroMedia, Count };
