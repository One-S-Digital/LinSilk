'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { track } from '@/lib/analytics';
import { MeasurementSheet } from '@/components/measure/measurement-sheet';
import { SwatchDialog } from '@/components/swatch-dialog';
import { SwatchTile } from '@/components/swatch-picker';
import { Button } from '@/components/ui/button';
import { useCart } from '@/lib/cart';
import { bodyZonesFor, garmentZonesFor, isOrderable, type Piece } from '@/lib/catalog';
import { isComplete, takenCount, type Measurements, type Unit } from '@/lib/measurements';
import { orderText, swatchLabelIn } from '@/lib/i18n-order';
import { localHref } from '@/lib/locale-routes';
import { CLOTH_NAME, findSwatch, swatchLabel } from '@/lib/swatches';
import { useLang } from '@/lib/use-lang';
import styles from '@/app/piece/[id]/piece.module.css';

/* Ordering runs in two steps, colour and then measurements, so the sheet is
   not asked for until the client knows what it is being cut in. The colour is
   chosen in a pop-up (swatch-dialog.tsx), which is why it is not a step of its
   own here: the page is either waiting for a colour or past it. */
type Step = 'start' | 'measure';

export function PieceOrderPanel({
  piece,
  variantId,
}: {
  piece: Piece;
  /* The backend's own id for this piece. Absent only if the house is
     unreachable, in which case there is nothing to order against. */
  variantId: string | null;
}) {
  const router = useRouter();
  const lang = useLang();
  const t = orderText(lang).panel;
  const { add } = useCart();
  const [step, setStep] = useState<Step>('start');
  const [swatchKey, setSwatchKey] = useState<string | null>(null);
  const [choosing, setChoosing] = useState(false);
  /* Whichever button opened the pop-up, so closing it without a choice puts
     the client back where they were. */
  const opener = useRef<HTMLElement | null>(null);
  const heading = useRef<HTMLDivElement>(null);
  const [sheet, setSheet] = useState<{ values: Measurements; unit: Unit }>({
    values: {},
    unit: 'cm',
  });
  const [holding, setHolding] = useState(false);
  const [refusal, setRefusal] = useState<string | null>(null);

  const onSheetChange = useCallback(
    (values: Measurements, unit: Unit) => setSheet({ values, unit }),
    [],
  );

  const garmentZones = useMemo(() => garmentZonesFor(piece), [piece]);
  const bodyZones = useMemo(() => bodyZonesFor(piece), [piece]);
  const allZones = useMemo(() => [...bodyZones, ...garmentZones], [bodyZones, garmentZones]);

  const orderable = isOrderable(piece);
  const complete = isComplete(sheet.values, allZones);
  const taken = takenCount(sheet.values, allZones);
  const started = useRef(false);
  useEffect(() => {
    if (taken > 0 && !started.current) {
      started.current = true;
      track('sheet_started', { piece: piece.id });
    }
  }, [taken, piece.id]);
  const cloth = piece.cloth;
  const swatch = cloth && swatchKey ? findSwatch(cloth, swatchKey) : undefined;

  const openColours = (button: HTMLElement) => {
    opener.current = button;
    setChoosing(true);
  };

  /* Once a colour is chosen the page moves on to the sheet: the chosen colour
     takes focus, and the first time the sheet is brought into view with it. */
  const chooseColour = (key: string) => {
    const first = step === 'start';
    track('select_colour', { piece: piece.id, cloth: cloth ?? '' });
    setSwatchKey(key);
    setStep('measure');
    setChoosing(false);
    requestAnimationFrame(() => {
      heading.current?.focus({ preventScroll: true });
      if (first) heading.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const closeColours = () => {
    setChoosing(false);
    opener.current?.focus();
  };

  /* An archived design is not made again, so the page shows the record rather
     than a disabled shop — offering a form that can never be submitted would
     be worse than saying plainly that the season closed. */
  if (!orderable) {
    return (
      <div className={styles.sheetWrap}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: 'clamp(20px,2.2vw,26px)' }}>
          {t.archivedH}
        </h2>
        <p className={styles.reserveNote} style={{ maxWidth: '52ch' }}>
          {t.archived(piece.collectionTitle || t.itsSeason)}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 28 }}>
          <Link
            href={localHref(lang, '/collection')}
            style={{ borderBottom: '1px solid var(--gold-60)', paddingBottom: 3, fontSize: 'var(--t-sm-tight)' }}
          >
            {t.seeOpen}
          </Link>
          <Link
            href={localHref(lang, '/design')}
            style={{ borderBottom: '1px solid var(--gold-60)', paddingBottom: 3, fontSize: 'var(--t-sm-tight)' }}
          >
            {t.commission}
          </Link>
        </div>
      </div>
    );
  }

  /* The atelier has the final word on what it can cut, so a refusal from the
     backend is shown as it was written rather than translated into a shrug. */
  const reserve = async () => {
    if (!variantId || !swatch) return;
    setHolding(true);
    setRefusal(null);
    try {
      await add({
        variantId,
        pieceId: piece.id,
        fabricKey: swatch.key,
        fabricName: swatchLabel(swatch),
        measurements: sheet.values,
        unit: sheet.unit,
        zones: allZones,
      });
      track('sheet_confirmed', { piece: piece.id });
      /* Straight to checkout: the piece is in the cart, and `holding` stays
         set so the button cannot be pressed twice while the page changes. */
      router.push('/checkout');
    } catch (error) {
      setRefusal((error as Error).message);
      setHolding(false);
    }
  };

  /* A piece the house has not tagged silk or linen has no colours to offer.
     Saying so is better than guessing a cloth for a garment cut to order. */
  if (!cloth) {
    return (
      <div className={styles.sheetWrap}>
        <p className={styles.blocked}>{t.noCloth}</p>
      </div>
    );
  }

  const clothName = orderText(lang).cloth[cloth] ?? CLOTH_NAME[cloth];
  const measuring = step === 'measure';

  return (
    <>
      <ol className={styles.steps} aria-label={t.steps}>
        <li
          data-state={swatch ? 'done' : 'current'}
          aria-current={swatch ? undefined : 'step'}
        >
          {t.stepColour}
        </li>
        <li
          data-state={measuring ? 'current' : 'todo'}
          aria-current={measuring ? 'step' : undefined}
        >
          {t.stepMeasure}
        </li>
      </ol>

      {!measuring && (
        <div className={styles.colourStart}>
          <div className={styles.clothLabel}>{clothName}</div>
          <p className={styles.reserveNote}>
            {t.madeIn(lang === 'en' ? cloth : clothName)}
          </p>
          <div className={styles.colourAction}>
            <Button onClick={(e) => openColours(e.currentTarget)}>{t.selectColour}</Button>
          </div>
        </div>
      )}

      {swatch && measuring && (
        <div ref={heading} tabIndex={-1} className={styles.chosen}>
          <div className={styles.chosenTile}>
            <SwatchTile swatch={swatch} />
          </div>
          <div>
            <div className={styles.chosenName}>{swatchLabelIn(swatch, lang)}</div>
            <button
              type="button"
              className={styles.linkButton}
              onClick={(e) => openColours(e.currentTarget)}
            >
              {t.changeColour}
            </button>
          </div>
        </div>
      )}

      {choosing && (
        <SwatchDialog
          cloth={cloth}
          value={swatchKey}
          confirmLabel={measuring ? t.useColour : t.toMeasure}
          onConfirm={chooseColour}
          onCancel={closeColours}
        />
      )}

      {measuring && (
        <div className={styles.sheetWrap}>
          <MeasurementSheet
            group={piece.group}
            bodyZones={bodyZones}
            garmentZones={garmentZones}
            onChange={onSheetChange}
          />

          <div className={styles.reserve}>
            <Button onClick={reserve} disabled={!complete || holding || !variantId || !swatch}>
              {holding ? t.moment : t.checkout}
            </Button>

            {refusal && <p className={styles.blocked}>{refusal}</p>}

            {!variantId && (
              <p className={styles.blocked}>{t.unreachable}</p>
            )}

            {!complete && (
              <p className={styles.blocked}>
                {taken === 0 ? t.allNeeded(allZones.length) : t.moreToTake(allZones.length - taken)}
              </p>
            )}

            <p className={styles.reserveNote}>{t.note}</p>
          </div>
        </div>
      )}
    </>
  );
}
