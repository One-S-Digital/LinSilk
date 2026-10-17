'use client';

import { useLenis } from 'lenis/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ChalkMark, ClothWipe } from '@/components/motion';
import { Photo } from '@/components/photo';
import { canOptimise } from '@/lib/image-hosts';
import { ShotFrame, type Weave } from '@/components/shot';
import styles from './piece-gallery.module.css';

/* The piece's photographs: one large frame with previous / next, a strip of
   every image beneath it, and a full-screen view opened by clicking the large
   frame. With no photographs yet it keeps the woven placeholders. */
export function PieceGallery({
  images,
  name,
  shot,
  weave,
}: {
  images: string[];
  name: string;
  shot: string;
  weave: Weave;
}) {
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const count = images.length;

  const go = useCallback(
    (step: number) => setIndex((i) => (i + step + count) % count),
    [count],
  );

  if (count === 0) {
    return (
      <div className={styles.gallery}>
        <ClothWipe>
          <ShotFrame note={shot} weave={weave} ratio="4 / 5" />
        </ClothWipe>
        <div className={styles.placeholders}>
          <ShotFrame note="hand-rolled hem" weave={weave} ratio="1" />
          <ShotFrame note="cloth, raking light" weave={weave} ratio="1" />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.gallery}>
      <ClothWipe>
        <div className={styles.stage}>
          <button
            type="button"
            className={styles.main}
            onClick={() => setOpen(true)}
            aria-label={`Open ${name}, image ${index + 1} of ${count}, full screen`}
          >
            <ShotFrame src={images[index]} alt={`${name}, image ${index + 1}`} ratio="4 / 5" priority />
          </button>
          <ChalkMark
            label="sleeve · 63"
            style={{ position: 'absolute', right: -8, top: '34%', pointerEvents: 'none' }}
          />
          {count > 1 && (
            <>
              <button
                type="button"
                className={styles.arrow}
                data-side="prev"
                onClick={() => go(-1)}
                aria-label="Previous image"
              >
                ‹
              </button>
              <button
                type="button"
                className={styles.arrow}
                data-side="next"
                onClick={() => go(1)}
                aria-label="Next image"
              >
                ›
              </button>
              <span className={styles.counter}>
                {index + 1} / {count}
              </span>
            </>
          )}
        </div>
      </ClothWipe>

      {count > 1 && (
        <ul className={styles.strip}>
          {images.map((src, i) => (
            <li key={src}>
              <button
                type="button"
                className={styles.thumb}
                data-current={i === index || undefined}
                onClick={() => setIndex(i)}
                aria-label={`Show image ${i + 1}`}
                aria-current={i === index}
              >
                {canOptimise(src) ? (
                  <Photo src={src} alt="" fill sizes="120px" />
                ) : (
                  <img src={src} alt="" loading="lazy" decoding="async" />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && (
        <Lightbox
          images={images}
          name={name}
          index={index}
          onGo={go}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}

function Lightbox({
  images,
  name,
  index,
  onGo,
  onClose,
}: {
  images: string[];
  name: string;
  index: number;
  onGo: (step: number) => void;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const lenis = useLenis();
  const count = images.length;

  useEffect(() => {
    dialog.current?.showModal();
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const before = root.style.overflow;
    root.style.overflow = 'hidden';
    lenis?.stop();
    return () => {
      root.style.overflow = before;
      lenis?.start();
    };
  }, [lenis]);

  return (
    <dialog
      ref={dialog}
      className={styles.lightbox}
      aria-label={`${name} photographs`}
      data-lenis-prevent
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialog.current) dialog.current?.close();
      }}
      onKeyDown={(e) => {
        if (count < 2) return;
        if (e.key === 'ArrowLeft') onGo(-1);
        if (e.key === 'ArrowRight') onGo(1);
      }}
    >
      <img className={styles.full} src={images[index]} alt={`${name}, image ${index + 1}`} />
      <button
        type="button"
        className={styles.close}
        onClick={() => dialog.current?.close()}
        aria-label="Close"
      >
        ×
      </button>
      {count > 1 && (
        <>
          <button type="button" className={styles.arrow} data-side="prev" onClick={() => onGo(-1)} aria-label="Previous image">‹</button>
          <button type="button" className={styles.arrow} data-side="next" onClick={() => onGo(1)} aria-label="Next image">›</button>
          <span className={styles.counter}>{index + 1} / {count}</span>
        </>
      )}
    </dialog>
  );
}
