'use client';

import Link from 'next/link';
import { useCallback, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { EASE } from '@/components/motion';
import { FabricPicker } from '@/components/fabric-picker';
import { MeasurementSheet } from '@/components/measure/measurement-sheet';
import { Button } from '@/components/ui/button';
import { useCart } from '@/lib/cart';
import {
  COMMISSION_STEPS,
  FABRICS,
  LENGTH_ZONE,
  SILHOUETTES,
  ZONES,
  money,
} from '@/lib/catalog';
import { isComplete, takenCount, type Measurements, type Unit } from '@/lib/measurements';
import styles from './design.module.css';

const MAX_FILES = 10;
const MAX_BYTES = 20 * 1024 * 1024;
const ACCEPT = ['image/', 'application/pdf'];
const NOTE_LIMIT = 2000;

type Attached = { name: string; size: number };

const readableSize = (bytes: number) => `${(bytes / 1048576).toFixed(1)} MB`;

export default function DesignPage() {
  const { add } = useCart();
  const still = useReducedMotion();
  const fileInput = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(0);
  const [silhouette, setSilhouette] = useState<string | null>(null);
  const [fabric, setFabric] = useState(FABRICS[0].key);
  const [notes, setNotes] = useState('');
  const [files, setFiles] = useState<Attached[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [sheet, setSheet] = useState<{ values: Measurements; unit: Unit }>({
    values: {},
    unit: 'cm',
  });
  const [submitted, setSubmitted] = useState(false);

  const onSheetChange = useCallback(
    (values: Measurements, unit: Unit) => setSheet({ values, unit }),
    [],
  );

  const chosenSilhouette = SILHOUETTES.find((s) => s.key === silhouette);
  const chosenFabric = FABRICS.find((f) => f.key === fabric)!;

  /* Each silhouette names the length the atelier takes for it — a dress is
     measured over the bust, a trouser down the outside leg. */
  const garmentZones = useMemo(
    () => (chosenSilhouette ? [LENGTH_ZONE[chosenSilhouette.lengthKind]] : []),
    [chosenSilhouette],
  );
  const allZones = useMemo(() => [...ZONES, ...garmentZones], [garmentZones]);

  const taken = takenCount(sheet.values, allZones);
  const complete = isComplete(sheet.values, allZones);

  /* The estimate is the silhouette's opening figure. It is quoted as an
     estimate everywhere because the tailor sets the real price after reading
     the note. */
  const estimate = chosenSilhouette?.estimate ?? 0;

  /* You cannot reach a later step until the shape is chosen — everything after
     it is a decision about that shape. */
  const furthest = silhouette ? COMMISSION_STEPS.length - 1 : 0;

  const acceptFiles = (incoming: FileList | null) => {
    if (!incoming?.length) return;
    const list = Array.from(incoming);
    const problems: string[] = [];
    const ok: Attached[] = [];

    for (const file of list) {
      const typeOk =
        ACCEPT.some((prefix) => file.type.startsWith(prefix)) ||
        /\.heic$/i.test(file.name);
      if (!typeOk) {
        problems.push(`${file.name} is not a JPG, PNG, PDF or HEIC.`);
        continue;
      }
      if (file.size > MAX_BYTES) {
        problems.push(`${file.name} is ${readableSize(file.size)} — the limit is 20 MB.`);
        continue;
      }
      ok.push({ name: file.name, size: file.size });
    }

    setFiles((current) => {
      const room = MAX_FILES - current.length;
      if (ok.length > room) {
        problems.push(`Ten files at most, so ${ok.length - room} were not added.`);
      }
      return [...current, ...ok.slice(0, Math.max(0, room))];
    });
    setFileError(problems.length ? problems.join(' ') : null);
  };

  const submit = () => {
    add({
      kind: 'commission',
      name: chosenSilhouette ? `Commission — ${chosenSilhouette.name.toLowerCase()}` : 'Commission',
      material: chosenFabric.name,
      price: estimate,
      estimate: true,
      fabricKey: chosenFabric.key,
      fabricName: chosenFabric.name,
      measurements: sheet.values,
      unit: sheet.unit,
      zoneCount: allZones.length,
      silhouette: chosenSilhouette?.name,
      note: [notes.trim(), files.length ? `${files.length} reference file(s) attached.` : '']
        .filter(Boolean)
        .join('\n\n'),
    });
    setSubmitted(true);
  };

  const panels = useMemo(
    () => [
      /* ---- 0 · Silhouette ---- */
      <div key="silhouette">
        <h2 className={styles.h2}>Choose a base silhouette</h2>
        <p className={styles.sub}>
          The starting shape only. Length, fullness and finishing are settled in your
          note to the tailor.
        </p>

        <div className={styles.silhouettes}>
          {SILHOUETTES.map((option) => (
            <button
              key={option.key}
              type="button"
              className={styles.silhouette}
              aria-pressed={silhouette === option.key}
              onClick={() => setSilhouette(option.key)}
            >
              <span className={styles.figure} aria-hidden="true">
                <span className={styles.figureBody} />
                <span className={styles.figureSleeve} />
              </span>
              <span className={styles.silhouetteName}>{option.name}</span>
              <span className={styles.silhouetteNote}>{option.note}</span>
              <span className={styles.silhouetteNote}>
                from {money(option.estimate)}
              </span>
            </button>
          ))}
        </div>

        <div className={styles.upload}>
          <h3 className={styles.h3}>Upload your own design</h3>
          <p className={styles.sub}>
            If you already have the garment drawn, photographed or saved somewhere,
            send it here. The tailor works from what you give, so more detail shortens
            the conversation.
          </p>

          <div className={styles.uploadGrid}>
            <div>
              <div style={{ fontSize: 'var(--t-xxs)', letterSpacing: 'var(--ls-label)', color: 'var(--ink-muted)' }}>
                What to send
              </div>
              <ul className={styles.checklist}>
                <li>Front and back of the outfit, both views, as separate images.</li>
                <li>Close-ups of anything that matters: collar, cuff, pocket, hem, closure.</li>
                <li>Sketches, screenshots, pinned references or a photo of a garment you own.</li>
                <li>Shoot flat or on a hanger in daylight — no flash, nothing folded out of view.</li>
                <li>Mark lengths on the image if you know them, in centimetres.</li>
                <li>JPG, PNG, PDF or HEIC, up to 20 MB each. Ten files at most.</li>
              </ul>
            </div>

            <div>
              <label
                className={styles.drop}
                data-over={dragOver}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  acceptFiles(e.dataTransfer.files);
                }}
              >
                <input
                  ref={fileInput}
                  type="file"
                  multiple
                  accept="image/*,.pdf,.heic"
                  onChange={(e) => {
                    acceptFiles(e.target.files);
                    e.target.value = '';
                  }}
                  style={{ display: 'none' }}
                />
                <span className={styles.dropTitle}>Choose files</span>
                <span className={styles.dropHint}>or drop them here</span>
              </label>

              <div className={styles.views}>
                <div className={styles.view}>
                  Front view
                  <span className={styles.viewState}>
                    {files.some((f) => /front/i.test(f.name)) ? 'received' : 'not yet sent'}
                  </span>
                </div>
                <div className={styles.view}>
                  Back view
                  <span className={styles.viewState}>
                    {files.some((f) => /back/i.test(f.name)) ? 'received' : 'not yet sent'}
                  </span>
                </div>
              </div>

              {fileError && <p className={styles.fileError}>{fileError}</p>}

              {files.length > 0 && (
                <div className={styles.files}>
                  {files.map((file, i) => (
                    <div key={`${file.name}-${i}`} className={styles.file}>
                      <span>{file.name}</span>
                      <span className={styles.fileSize}>
                        {readableSize(file.size)}
                        <button
                          type="button"
                          onClick={() => setFiles((c) => c.filter((_, j) => j !== i))}
                          style={{ marginLeft: 14, color: 'var(--ink-muted)' }}
                          aria-label={`Remove ${file.name}`}
                        >
                          Remove
                        </button>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>,

      /* ---- 1 · Cloth ---- */
      <div key="cloth">
        <h2 className={styles.h2}>Select fabric</h2>
        <p className={styles.sub}>
          Four weaves are held in the atelier at any time. A cutting of the one you
          choose is posted to you before cutting begins.
        </p>
        <FabricPicker value={fabric} onChange={setFabric} layout="list" idPrefix="commission-cloth" />
      </div>,

      /* ---- 2 · Notes ---- */
      <div key="notes">
        <h2 className={styles.h2}>Tell your tailor</h2>
        <p className={styles.sub}>
          Write as you would to a person. Length, sleeve, collar, pockets, how you want
          it to sit, a garment you already own and like.
        </p>
        <textarea
          className={styles.notes}
          value={notes}
          maxLength={NOTE_LIMIT}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Mid-calf, a little fuller through the skirt than the bias dress in Collection III. Sleeve to the wrist bone. No lining."
          aria-label="Your note to the tailor"
        />
        <div className={styles.counter}>
          {notes.length} of {NOTE_LIMIT}
        </div>
      </div>,

      /* ---- 3 · Measurements ---- */
      <div key="measure" className={styles.measureGrid}>
        <MeasurementSheet
          group="women"
          garmentZones={garmentZones}
          onChange={onSheetChange}
          title="Measurements"
        />
      </div>,

      /* ---- 4 · Review ---- */
      <div key="review" className={styles.reviewGrid}>
        <div>
          <h2 className={styles.h2}>Review and reserve</h2>

          <div style={{ marginTop: 26 }}>
            <div className={styles.reviewRow}>
              <span style={{ color: 'var(--ink-muted)' }}>Silhouette</span>
              <span className={styles.reviewValue}>
                {chosenSilhouette?.name ?? 'Not chosen'}
              </span>
            </div>
            <div className={styles.reviewRow}>
              <span style={{ color: 'var(--ink-muted)' }}>Cloth</span>
              <span className={styles.reviewValue}>{chosenFabric.name}</span>
            </div>
            <div className={styles.reviewRow}>
              <span style={{ color: 'var(--ink-muted)' }}>Measurements</span>
              <span className={styles.reviewValue}>
                {taken} of {allZones.length} taken
              </span>
            </div>
            <div className={styles.reviewRow}>
              <span style={{ color: 'var(--ink-muted)' }}>References</span>
              <span className={styles.reviewValue}>
                {files.length === 0 ? 'None sent' : `${files.length} file${files.length > 1 ? 's' : ''}`}
              </span>
            </div>
            <div className={styles.reviewRow}>
              <span style={{ color: 'var(--ink-muted)' }}>Estimate</span>
              <span className={`${styles.reviewValue} ${styles.estimate}`}>
                {estimate ? money(estimate) : '—'}
              </span>
            </div>
          </div>

          <div className={styles.submit}>
            <Button onClick={submit} disabled={!silhouette || !complete || submitted}>
              {submitted ? 'Submitted' : 'Submit your measurements'}
            </Button>

            {!complete && (
              <p className={styles.submitNote}>
                {allZones.length - taken} measurement
                {allZones.length - taken === 1 ? '' : 's'} still to take. The atelier
                cannot draw a pattern from a partial sheet.
              </p>
            )}

            {submitted ? (
              <p className={styles.submitNote}>
                Your brief is held.{' '}
                <Link
                  href="/cart"
                  style={{ borderBottom: '1px solid var(--gold-60)', paddingBottom: 2 }}
                >
                  Review it
                </Link>{' '}
                before checkout.
              </p>
            ) : (
              <p className={styles.submitNote}>
                The estimate is confirmed in writing once the tailor has read your
                note. Nothing is cut until you reply.
              </p>
            )}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 'var(--t-xxs)', letterSpacing: 'var(--ls-label)', color: 'var(--ink-muted)' }}>
            Your note
          </div>
          <p className={styles.noteEcho}>
            {notes.trim() || 'No note written yet.'}
          </p>
        </div>
      </div>,
    ],
    [
      silhouette, fabric, notes, files, fileError, dragOver,
      chosenSilhouette, chosenFabric, garmentZones, allZones,
      taken, complete, estimate, submitted, onSheetChange,
    ],
  );

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Design your own</h1>
      <p className={styles.lede}>
        A commission, not a configurator. You give the atelier a shape, a cloth, a note
        and a set of measurements. One garment is made from that brief and no version
        of it enters a collection.
      </p>

      <nav className={styles.steps} aria-label="Commission steps">
        {COMMISSION_STEPS.map((label, i) => (
          <button
            key={label}
            type="button"
            className={styles.step}
            data-state={i === step ? 'current' : i < step ? 'done' : 'todo'}
            disabled={i > furthest}
            aria-current={i === step ? 'step' : undefined}
            onClick={() => setStep(i)}
          >
            <span className={styles.stepNum}>{String(i + 1).padStart(2, '0')}</span>
            {label}
          </button>
        ))}
      </nav>

      <div className={styles.panel}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            initial={still ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={still ? undefined : { opacity: 0, y: -10 }}
            transition={{ duration: 0.42, ease: EASE }}
          >
            {panels[step]}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className={styles.nav}>
        <button
          type="button"
          className={styles.back}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
        >
          Back
        </button>
        {step < COMMISSION_STEPS.length - 1 && (
          <button
            type="button"
            onClick={() => setStep((s) => Math.min(furthest, s + 1))}
            disabled={step >= furthest}
            style={{
              fontSize: 'var(--t-sm-tight)',
              letterSpacing: 'var(--ls-nav)',
              borderBottom: '1px solid var(--gold-60)',
              paddingBottom: 4,
              opacity: step >= furthest ? 0.4 : 1,
            }}
          >
            {silhouette ? 'Continue' : 'Choose a silhouette to continue'}
          </button>
        )}
      </div>
    </div>
  );
}
