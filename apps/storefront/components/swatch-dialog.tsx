'use client';

import { useLenis } from 'lenis/react';
import { useEffect, useId, useRef, useState } from 'react';
import { SwatchPicker, SwatchTile } from '@/components/swatch-picker';
import { Button } from '@/components/ui/button';
import type { Cloth } from '@/lib/catalog';
import { orderText, swatchLabelIn } from '@/lib/i18n-order';
import { CLOTH_NAME, findSwatch, swatchesFor } from '@/lib/swatches';
import { useLang } from '@/lib/use-lang';
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
  const lang = useLang();
  const ot = orderText(lang);
  const t = ot.swatch;
  const clothWord = ot.cloth[cloth] ?? CLOTH_NAME[cloth];
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
            <div className={styles.eyebrow}>{clothWord}</div>
            <h2 id={titleId} className={styles.title}>
              {t.title}
            </h2>
            <p className={styles.lead}>
              {t.lead(swatchesFor(cloth).length, lang === 'en' ? cloth : clothWord)}
            </p>
          </div>
          <button
            type="button"
            className={styles.close}
            onClick={() => dialog.current?.close()}
          >
            {t.close}
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
              {swatch ? swatchLabelIn(swatch, lang) : t.none}
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
