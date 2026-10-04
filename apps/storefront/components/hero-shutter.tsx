'use client';

import { useEffect, useState } from 'react';
import styles from './hero-shutter.module.css';

const SLIDES = [1, 2, 3];
const HOLD_MS = 6500;
/* Direction of the sweep into slide n: the first change runs right to left, the others left to right. */
const DIRECTION: Array<'rtl' | 'ltr'> = ['ltr', 'rtl', 'ltr'];
const ALT = 'A woman in a silk gown and a man in linen, standing together';

function Slide({ n, reveal, dir }: { n: number; reveal: boolean; dir: 'rtl' | 'ltr' }) {
  return (
    <div className={styles.slide} aria-hidden={reveal ? undefined : true}>
      <div className={styles.reveal} data-from={dir} data-on={reveal || undefined}>
        <picture>
          <source media="(max-width: 640px)" srcSet={`/images/hero-${n}-mobile.webp`} />
          <source media="(max-width: 900px)" srcSet={`/images/hero-${n}-tablet.webp`} />
          <img src={`/images/hero-${n}-desktop.webp`} alt={ALT} />
        </picture>
      </div>
    </div>
  );
}

/* Silk-sheet sweep: the next banner is drawn across the last one behind a soft,
   feathered edge, like cloth pulled over it (direction: see DIRECTION). */
export function HeroShutter() {
  const [index, setIndex] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const size = window.matchMedia('(max-width: 640px)').matches
      ? 'mobile'
      : window.matchMedia('(max-width: 900px)').matches
        ? 'tablet'
        : 'desktop';
    SLIDES.forEach((n) => { new Image().src = `/images/hero-${n}-${size}.webp`; });
    const t = setInterval(() => {
      setIndex((i) => {
        setPrev(i);
        return (i + 1) % SLIDES.length;
      });
    }, HOLD_MS);
    return () => clearInterval(t);
  }, []);

  return (
    <div className={styles.root}>
      {prev !== null && <Slide key={`p${prev}-${index}`} n={SLIDES[prev]} reveal={false} dir="ltr" />}
      <Slide key={`c${index}-${prev}`} n={SLIDES[index]} reveal={prev !== null} dir={DIRECTION[index]} />
    </div>
  );
}
