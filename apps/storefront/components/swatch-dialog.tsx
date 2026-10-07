'use client';

import { useLenis } from 'lenis/react';
import { useEffect, useId, useRef, useState } from 'react';
import { SwatchPicker, SwatchTile } from '@/components/swatch-picker';
import { Button } from '@/components/ui/button';
import type { Cloth } from '@/lib/catalog';
import { CLOTH_NAME, findSwatch, swatchLabel, swatchesFor } from '@/lib/swatches';
import styles from './swatch-dialog.module.css';

/* The colour choice, in a pop-up over the piece.
 *
 * A native modal <dialog>: the browser traps focus inside it, closes it on
 * Escape and keeps the page behind inert. It is mounted only while it is open,
 * so every opening starts from the colour the client already holds, and
 * closing it any way but "confirm" leaves that colour as it was.
 */
export function SwatchDialog({
  cloth,
  value,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  cloth: Cloth;
  /** The colour the client already holds, or null before they have chosen. */
  value: string | null;
  confirmLabel: string;
  onConfirm: (key: string) => void;
  onCancel: () => void;
}) {
  const titleId = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const [pick, setPick] = useState<string | null>(value);
  const swatch = pick ? findSwatch(cloth, pick) : undefined;
  const lenis = useLenis();

  useEffect(() => {
    dialog.current?.showModal();
  }, []);

  /* The page behind stays where it is. Lenis is paused as well as the scroll
     bar hidden, or a wheel over the backdrop would still drive it. */
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
      className={styles.dialog}
      aria-labelledby={titleId}
      data-lenis-prevent
      onClose={onCancel}
      onClick={(e) => {
        /* The dialog has no padding of its own, so a click that lands on it
           rather than on something inside it is a click on the backdrop. */
        if (e.target === e.currentTarget) dialog.current?.close();
      }}
    >
      <div className={styles.panel}>
        <header className={styles.head}>
          <div>
            <div className={styles.eyebrow}>{CLOTH_NAME[cloth]}</div>
            <h2 id={titleId} className={styles.title}>
              Choose your colour
            </h2>
            <p className={styles.lead}>
              {swatchesFor(cloth).length} colours in {cloth}. Choose the one this piece is
              cut in.
            </p>
          </div>
          <button
            type="button"
            className={styles.close}
            onClick={() => dialog.current?.close()}
          >
            Close
          </button>
        </header>

        <div className={styles.body} data-lenis-prevent>
          <SwatchPicker cloth={cloth} value={pick} onChange={setPick} idPrefix="piece-colour" />
        </div>

        <footer className={styles.foot}>
          <div className={styles.chosen}>
            {swatch && (
              <div className={styles.chosenTile}>
                <SwatchTile swatch={swatch} />
              </div>
            )}
            <span className={styles.chosenName}>
              {swatch ? swatchLabel(swatch) : 'No colour chosen yet'}
            </span>
          </div>
          <Button disabled={!swatch} onClick={() => pick && onConfirm(pick)}>
            {confirmLabel}
          </Button>
        </footer>
      </div>
    </dialog>
  );
}
