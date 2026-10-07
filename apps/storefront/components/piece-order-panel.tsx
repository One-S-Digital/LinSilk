'use client';

import Link from 'next/link';
import { useCallback, useMemo, useRef, useState } from 'react';
import { MeasurementSheet } from '@/components/measure/measurement-sheet';
import { SwatchDialog } from '@/components/swatch-dialog';
import { SwatchTile } from '@/components/swatch-picker';
import { Button } from '@/components/ui/button';
import { useCart } from '@/lib/cart';
import { ZONES, garmentZonesFor, isOrderable, money, type Piece } from '@/lib/catalog';
import { isComplete, takenCount, type Measurements, type Unit } from '@/lib/measurements';
import { CLOTH_NAME, findSwatch, swatchLabel } from '@/lib/swatches';
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
     unreachable, in which case there is nothing to reserve against. */
  variantId: string | null;
}) {
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
  const [reserved, setReserved] = useState(false);
  const [holding, setHolding] = useState(false);
  const [refusal, setRefusal] = useState<string | null>(null);

  const onSheetChange = useCallback(
    (values: Measurements, unit: Unit) => setSheet({ values, unit }),
    [],
  );

  const garmentZones = useMemo(() => garmentZonesFor(piece), [piece]);
  const allZones = useMemo(() => [...ZONES, ...garmentZones], [garmentZones]);

  const orderable = isOrderable(piece);
  const complete = isComplete(sheet.values, allZones);
  const taken = takenCount(sheet.values, allZones);
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
          Archived
        </h2>
        <p className={styles.reserveNote} style={{ maxWidth: '52ch' }}>
          This design closed with {piece.collectionTitle || 'its season'} and is not
          made again. The pattern is kept at the bench, and the record of the cloth stays
          with the piece — but nothing from a closed collection is cut a second time.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 28 }}>
          <Link
            href="/collection"
            style={{ borderBottom: '1px solid var(--gold-60)', paddingBottom: 3, fontSize: 'var(--t-sm-tight)' }}
          >
            See what is open now
          </Link>
          <Link
            href="/design"
            style={{ borderBottom: '1px solid var(--gold-60)', paddingBottom: 3, fontSize: 'var(--t-sm-tight)' }}
          >
            Commission something like it
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
      setReserved(true);
    } catch (error) {
      setRefusal((error as Error).message);
    } finally {
      setHolding(false);
    }
  };

  /* A piece the house has not tagged silk or linen has no colours to offer.
     Saying so is better than guessing a cloth for a garment cut to order. */
  if (!cloth) {
    return (
      <div className={styles.sheetWrap}>
        <p className={styles.blocked}>
          The cloth for this piece has not been confirmed yet, so it cannot be reserved
          just now. Write to hello@linsilk.ch and the atelier will tell you what it is
          cut in.
        </p>
      </div>
    );
  }

  const clothName = CLOTH_NAME[cloth];
  const measuring = step === 'measure';

  return (
    <>
      <ol className={styles.steps} aria-label="Ordering steps">
        <li
          data-state={swatch ? 'done' : 'current'}
          aria-current={swatch ? undefined : 'step'}
        >
          01 Colour
        </li>
        <li
          data-state={measuring ? 'current' : 'todo'}
          aria-current={measuring ? 'step' : undefined}
        >
          02 Measurements
        </li>
      </ol>

      {!measuring && (
        <div className={styles.colourStart}>
          <div className={styles.clothLabel}>{clothName}</div>
          <p className={styles.reserveNote}>
            This piece is made in {cloth}. Choose your colour from the {cloth} swatches,
            then take your measurements.
          </p>
          <div className={styles.colourAction}>
            <Button onClick={(e) => openColours(e.currentTarget)}>Select colour</Button>
          </div>
        </div>
      )}

      {swatch && measuring && (
        <div ref={heading} tabIndex={-1} className={styles.chosen}>
          <div className={styles.chosenTile}>
            <SwatchTile swatch={swatch} />
          </div>
          <div>
            <div className={styles.chosenName}>{swatchLabel(swatch)}</div>
            {!reserved && (
              <button
                type="button"
                className={styles.linkButton}
                onClick={(e) => openColours(e.currentTarget)}
              >
                Change colour
              </button>
            )}
          </div>
        </div>
      )}

      {choosing && (
        <SwatchDialog
          cloth={cloth}
          value={swatchKey}
          confirmLabel={measuring ? 'Use this colour' : 'Continue to measurements'}
          onConfirm={chooseColour}
          onCancel={closeColours}
        />
      )}

      {measuring && (
        <div className={styles.sheetWrap}>
          <MeasurementSheet
            group={piece.group}
            garmentZones={garmentZones}
            onChange={onSheetChange}
          />

          <div className={styles.reserve}>
            <Button onClick={reserve} disabled={!complete || reserved || holding || !variantId || !swatch}>
              {reserved ? 'Reserved' : holding ? 'Holding…' : 'Reserve this piece'}
            </Button>

            {refusal && <p className={styles.blocked}>{refusal}</p>}

            {!variantId && (
              <p className={styles.blocked}>
                The house cannot be reached just now, so nothing can be held. Write to
                hello@linsilk.ch and the atelier will hold it by hand.
              </p>
            )}

            {!complete && (
              <p className={styles.blocked}>
                {taken === 0
                  ? `The sheet decides the garment, so all ${allZones.length} measurements are needed before a piece can be reserved.`
                  : `${allZones.length - taken} more to take. The atelier cannot cut from a partial sheet.`}
              </p>
            )}

            {reserved && swatch ? (
              <div className={styles.done}>
                <span className={styles.doneMark}>held</span>
                <span>
                  {piece.name} in {swatchLabel(swatch)} — {money(piece.price)}
                </span>
                <Link
                  href="/cart"
                  style={{ borderBottom: '1px solid var(--gold-60)', paddingBottom: 2 }}
                >
                  Review your reservation
                </Link>
              </div>
            ) : (
              <p className={styles.reserveNote}>
                Reserving holds the design against the season’s capped run. The atelier
                writes to you within two days to confirm the sheet before cutting begins.
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
