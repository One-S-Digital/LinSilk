'use client';

import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';
import { FabricPicker } from '@/components/fabric-picker';
import { MeasurementSheet } from '@/components/measure/measurement-sheet';
import { Button } from '@/components/ui/button';
import { useCart } from '@/lib/cart';
import {
  FABRICS,
  ZONES,
  garmentZonesFor,
  isOrderable,
  money,
  type Piece,
} from '@/lib/catalog';
import { isComplete, takenCount, type Measurements, type Unit } from '@/lib/measurements';
import styles from '@/app/piece/[id]/piece.module.css';

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
  const [fabric, setFabric] = useState(FABRICS[0].key);
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
  const chosen = FABRICS.find((f) => f.key === fabric)!;

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
    if (!variantId) return;
    setHolding(true);
    setRefusal(null);
    try {
      await add({
        variantId,
        pieceId: piece.id,
        fabricKey: chosen.key,
        fabricName: chosen.name,
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

  return (
    <>
      <div className={styles.clothLabel}>Cloth</div>
      <FabricPicker value={fabric} onChange={setFabric} idPrefix="piece-cloth" />

      <div className={styles.sheetWrap}>
        <MeasurementSheet
          group={piece.group}
          garmentZones={garmentZones}
          onChange={onSheetChange}
        />

        <div className={styles.reserve}>
          <Button onClick={reserve} disabled={!complete || reserved || holding || !variantId}>
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

          {reserved ? (
            <div className={styles.done}>
              <span className={styles.doneMark}>held</span>
              <span>
                {piece.name} in {chosen.name} — {money(piece.price)}
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
    </>
  );
}
