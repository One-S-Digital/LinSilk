'use client';

import { useLenis } from 'lenis/react';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import styles from './drag-rail.module.css';

/* The rail moves four ways and all of them share one scroll position:
 *   · trackpad and touch — the browser's own scrolling, untouched
 *   · a vertical wheel over the rail, translated to horizontal
 *   · click-drag with a mouse
 *   · the arrow buttons, and left/right keys once focused
 *
 * The earlier version animated a transform with a spring per wheel event, so
 * each tick started a new animation that fought the one still running. That is
 * what made it feel sticky. Native scrolling has none of that problem.
 */

export function DragRail({
  children,
  className,
  gap = 32,
  label = 'Gallery',
}: {
  children: ReactNode;
  className?: string;
  gap?: number;
  label?: string;
}) {
  const rail = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dragged, setDragged] = useState(false);

  const drag = useRef({ startX: 0, startLeft: 0, moved: 0 });

  /* Held in a ref so the wheel listener never needs rebinding, and so a rail
     rendered without the smooth-scroll provider (reduced motion) simply finds
     nothing here and falls back to native scroll chaining. */
  const lenis = useLenis();
  const lenisRef = useRef(lenis);
  lenisRef.current = lenis;

  const measure = useCallback(() => {
    const el = rail.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setCanLeft(el.scrollLeft > 2);
    setCanRight(el.scrollLeft < max - 2);
  }, []);

  useLayoutEffect(measure, [measure, children]);

  useEffect(() => {
    const el = rail.current;
    if (!el) return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    for (const child of Array.from(el.children)) ro.observe(child);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [measure]);

  /* React attaches wheel listeners passively, which forbids preventDefault, so
     this one is bound by hand. */
  useEffect(() => {
    const el = rail.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      const horizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY);
      const delta = horizontal ? e.deltaX : e.deltaY;
      if (!delta) return;

      const max = el.scrollWidth - el.clientWidth;
      if (max <= 0) return;

      const atStart = el.scrollLeft <= 0;
      const atEnd = el.scrollLeft >= max - 1;

      /* The rail has run out of cloth in the direction being pushed. A
         sideways swipe stops here — it was never about the page. A vertical
         wheel carries straight on down the page, handed to Lenis so the
         moment of handover keeps the same easing as everything else. Without
         Lenis the event falls through and the browser chains it natively,
         which `overscroll-behavior-y: auto` in globals.css permits. */
      if ((delta < 0 && atStart) || (delta > 0 && atEnd)) {
        if (horizontal) return;
        const smooth = lenisRef.current;
        if (!smooth) return;
        e.preventDefault();
        smooth.scrollTo(smooth.targetScroll + e.deltaY, { immediate: false });
        return;
      }

      e.preventDefault();
      el.scrollLeft += delta;
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const step = () => {
    const el = rail.current;
    return Math.max(240, (el ? el.clientWidth : 600) * 0.8);
  };

  const nudge = (direction: number) => {
    rail.current?.scrollBy({ left: direction * step(), behavior: 'smooth' });
  };

  // ---- Mouse drag ----

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Touch and pen already scroll natively; only take over for a mouse.
    if (e.pointerType !== 'mouse') return;
    const el = rail.current;
    if (!el) return;
    drag.current = { startX: e.clientX, startLeft: el.scrollLeft, moved: 0 };
    setDragging(true);
    setDragged(false);
    el.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    const el = rail.current;
    if (!el) return;
    const travelled = e.clientX - drag.current.startX;
    drag.current.moved = Math.max(drag.current.moved, Math.abs(travelled));
    if (drag.current.moved > 4) setDragged(true);
    el.scrollLeft = drag.current.startLeft - travelled;
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    setDragging(false);
    rail.current?.releasePointerCapture(e.pointerId);
    // Release the links a frame later, so the click that ends a drag is
    // swallowed but the next real click is not.
    requestAnimationFrame(() => setDragged(false));
  };

  return (
    <div className={className} style={{ position: 'relative' }}>
      <div
        ref={rail}
        className={styles.rail}
        role="group"
        aria-label={label}
        tabIndex={0}
        data-rail
        data-lenis-prevent
        data-dragging={dragging}
        data-dragged={dragged}
        data-grabbable={canLeft || canRight}
        onScroll={measure}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') {
            e.preventDefault();
            nudge(1);
          }
          if (e.key === 'ArrowLeft') {
            e.preventDefault();
            nudge(-1);
          }
        }}
      >
        <div className={styles.track} style={{ gap }}>
          {children}
        </div>
      </div>

      <div className={styles.arrows} aria-hidden={!canLeft && !canRight}>
        <button
          type="button"
          className={`${styles.arrow} ${styles.arrowLeft}`}
          data-on={canLeft}
          tabIndex={canLeft ? 0 : -1}
          aria-label="Previous"
          onClick={() => nudge(-1)}
        >
          ←
        </button>
        <button
          type="button"
          className={`${styles.arrow} ${styles.arrowRight}`}
          data-on={canRight}
          tabIndex={canRight ? 0 : -1}
          aria-label="Next"
          onClick={() => nudge(1)}
        >
          →
        </button>
      </div>
    </div>
  );
}
