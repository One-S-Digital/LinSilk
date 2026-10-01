'use client';

/* Design your own: a request for a quote.
 *
 * Nothing here enters a cart and nothing is charged. The client gives a shape,
 * names the cloth they chose from the house's catalogues, writes to the
 * tailor, and sends a measurement sheet; a tailor reads it and writes back
 * with a price. The opening figure shown per silhouette comes from the
 * backend, where the house edits it.
 */

import { useCallback, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { EASE } from '@/components/motion';
import { MeasurementSheet } from '@/components/measure/measurement-sheet';
import { Button } from '@/components/ui/button';
import { COMMISSION_STEPS, LENGTH_ZONE, ZONES, money, type LengthKind } from '@/lib/catalog';
import { MEDUSA_URL, medusaHeaders, type ApiFabricCatalogue, type ApiSilhouette } from '@/lib/medusa';
import { isComplete, takenCount, type Measurements, type Unit } from '@/lib/measurements';
import styles from '@/app/design/design.module.css';

const MAX_FILES = 10;
const MAX_BYTES = 20 * 1024 * 1024;
const ACCEPT = ['image/', 'application/pdf'];
const NOTE_LIMIT = 2000;
const FABRIC_LIMIT = 500;

const readableSize = (bytes: number) => `${(bytes / 1048576).toFixed(1)} MB`;

export function CommissionFlow({
  silhouettes,
  catalogues,
  initialMeasurements,
  initialUnit,
}: {
  silhouettes: ApiSilhouette[];
  catalogues: ApiFabricCatalogue[];
  /** A signed-in client's saved profile (account › measurements), if any. */
  initialMeasurements?: Measurements;
  initialUnit?: Unit;
}) {
  const still = useReducedMotion();
  const fileInput = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(0);
  const [silhouette, setSilhouette] = useState<string | null>(null);
  const [fabric, setFabric] = useState('');
  const [notes, setNotes] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [sheet, setSheet] = useState<{ values: Measurements; unit: Unit }>({
    values: initialMeasurements ?? {},
    unit: initialUnit ?? 'cm',
  });
  /* The Measurements panel is keyed by step and sits behind AnimatePresence,
     so leaving it and coming back genuinely unmounts and remounts
     MeasurementSheet — it is not hidden, it is gone. Before it has echoed
     back a sheet of its own at least once, the panel still seeds from the
     original props: the signed-in profile, or nothing, which is what lets
     an anonymous MeasurementSheet fall back to this device's own saved
     sheet on that first mount. After that first echo, seeding from the
     original props again on every later remount would discard whatever the
     client just typed and show the signed-in profile (or a blank sheet)
     in its place — so from then on the panel is handed the live sheet. */
  const [sheetTouched, setSheetTouched] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const onSheetChange = useCallback((values: Measurements, unit: Unit) => {
    setSheetTouched(true);
    setSheet({ values, unit });
  }, []);

  const chosen = silhouettes.find((s) => s.key === silhouette);

  /* Each silhouette names the lengths the atelier takes for it — a dress is
     measured over the bust, a trouser down the outside leg. */
  const garmentZones = useMemo(
    () =>
      (chosen?.length_kinds ?? [])
        .map((kind) => LENGTH_ZONE[kind as LengthKind])
        .filter(Boolean),
    [chosen],
  );
  const allZones = useMemo(() => [...ZONES, ...garmentZones], [garmentZones]);

  const taken = takenCount(sheet.values, allZones);
  const complete = isComplete(sheet.values, allZones);
  const emailLooksRight = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const ready =
    Boolean(silhouette) &&
    complete &&
    fabric.trim().length > 0 &&
    name.trim().length > 0 &&
    emailLooksRight;

  /* You cannot reach a later step until the shape is chosen — everything after
     it is a decision about that shape. */
  const furthest = silhouette ? COMMISSION_STEPS.length - 1 : 0;

  const acceptFiles = (incoming: FileList | null) => {
    if (!incoming?.length) return;
    const problems: string[] = [];
    const ok: File[] = [];

    for (const file of Array.from(incoming)) {
      const typeOk =
        ACCEPT.some((prefix) => file.type.startsWith(prefix)) || /\.heic$/i.test(file.name);
      if (!typeOk) {
        problems.push(`${file.name} is not a JPG, PNG, PDF or HEIC.`);
        continue;
      }
      if (file.size > MAX_BYTES) {
        problems.push(`${file.name} is ${readableSize(file.size)} — the limit is 20 MB.`);
        continue;
      }
      ok.push(file);
    }

    /* Read off the render's own `files`, not an updater's `current` — the
       "ten files at most" message was being decided inside the `setFiles`
       updater, which can run after this function has already read
       `problems.length` into `setFileError`, so the message could be
       dropped silently. There being exactly one `acceptFiles` call per
       drop or per picker use is what makes this safe to compute up front. */
    const room = Math.max(0, MAX_FILES - files.length);
    if (ok.length > room) {
      problems.push(`Ten files at most, so ${ok.length - room} were not added.`);
    }
    const accepted = ok.slice(0, room);
    if (accepted.length) {
      setFiles((current) => [...current, ...accepted]);
    }
    setFileError(problems.length ? problems.join(' ') : null);
  };

  const send = async () => {
    if (!chosen || sending) return;
    setSending(true);
    setSendError(null);

    const form = new FormData();
    form.set('name', name.trim());
    form.set('email', email.trim());
    form.set('silhouette', chosen.key);
    form.set('fabric', fabric.trim());
    if (notes.trim()) form.set('note', notes.trim());
    form.set('measurement_unit', sheet.unit);
    form.set('measurements', JSON.stringify(sheet.values));
    for (const file of files) form.append('references', file);

    try {
      const response = await fetch(`${MEDUSA_URL}/store/commissions`, {
        method: 'POST',
        headers: medusaHeaders(),
        body: form,
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.message ?? 'The atelier’s desk did not answer.');
      }
      setSent(true);
    } catch (error) {
      setSendError(
        `${(error as Error).message} Nothing was lost — try again, or write to hello@linsilk.ch.`,
      );
    } finally {
      setSending(false);
    }
  };

  const panels = [
    /* ---- 0 · Silhouette ---- */
    <div key="silhouette">
      <h2 className={styles.h2}>Choose a base silhouette</h2>
      <p className={styles.sub}>
        The starting shape only. Length, fullness and finishing are settled in your note
        to the tailor.
      </p>

      <div className={styles.silhouettes}>
        {silhouettes.map((option) => (
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
            {option.estimate !== null && (
              <span className={styles.silhouetteNote}>from {money(option.estimate)}</span>
            )}
          </button>
        ))}
      </div>

      <p className={styles.sub} style={{ marginTop: 24 }}>
        A starting figure, not a price. What a commission costs depends on the cloth and
        the hours at the bench, so a tailor reads your brief and writes to you with the
        figure. Nothing is charged until you have agreed it.
      </p>

      <div className={styles.upload}>
        <h3 className={styles.h3}>Upload your own design</h3>
        <p className={styles.sub}>
          If you already have the garment drawn, photographed or saved somewhere, send it
          here. The tailor works from what you give, so more detail shortens the
          conversation.
        </p>

        <div className={styles.uploadGrid}>
          <div>
            <div className={styles.label}>What to send</div>
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
      <h2 className={styles.h2}>Choose your cloth</h2>
      <p className={styles.sub}>
        Read the catalogues the house holds, then write down the cloth you want. If you
        are between two, say so — the tailor will tell you which behaves better in the
        shape you have chosen, and a cutting is posted to you before anything is cut.
      </p>

      {catalogues.length > 0 ? (
        <div className={styles.catalogues}>
          {catalogues.map((catalogue) => (
            <a
              key={catalogue.id}
              className={styles.catalogue}
              href={catalogue.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className={styles.catalogueName}>{catalogue.title}</span>
              {catalogue.description && (
                <span className={styles.catalogueNote}>{catalogue.description}</span>
              )}
              <span className={styles.catalogueOpen}>
                Open{catalogue.mime_type === 'application/pdf' ? ' the PDF' : ''}
              </span>
            </a>
          ))}
        </div>
      ) : (
        <p className={styles.sub}>
          The cloth catalogues are being reprinted. Write the cloth you have in mind
          below, or ask the tailor what is on the shelf this season.
        </p>
      )}

      <div className={styles.fabricField}>
        <label className={styles.label} htmlFor="commission-fabric">
          The cloth you have chosen
        </label>
        <input
          id="commission-fabric"
          className={styles.input}
          value={fabric}
          maxLength={FABRIC_LIMIT}
          onChange={(e) => setFabric(e.target.value)}
          placeholder="Oyster charmeuse, 19mm — page 4 of the autumn silks catalogue"
          aria-describedby="commission-fabric-hint"
        />
        <p id="commission-fabric-hint" className={styles.hint}>
          The name, the weight and the page it is on, if you have them.
        </p>
      </div>
    </div>,

    /* ---- 2 · Notes ---- */
    <div key="notes">
      <h2 className={styles.h2}>Tell your tailor</h2>
      <p className={styles.sub}>
        Write as you would to a person. Length, sleeve, collar, pockets, how you want it
        to sit, a garment you already own and like.
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
        initialValues={sheetTouched ? sheet.values : initialMeasurements}
        initialUnit={sheetTouched ? sheet.unit : initialUnit}
      />
    </div>,

    /* ---- 4 · Send ---- */
    <div key="send" className={styles.reviewGrid}>
      <div>
        <h2 className={styles.h2}>Send it to the atelier</h2>

        <div className={styles.contact}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="commission-name">
              Your name
            </label>
            <input
              id="commission-name"
              className={styles.input}
              value={name}
              autoComplete="name"
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="commission-email">
              Email
            </label>
            <input
              id="commission-email"
              className={styles.input}
              type="email"
              value={email}
              autoComplete="email"
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={email.length > 0 && !emailLooksRight}
            />
            <p className={styles.hint}>The tailor writes to you here with the price.</p>
          </div>
        </div>

        <div style={{ marginTop: 26 }}>
          <div className={styles.reviewRow}>
            <span style={{ color: 'var(--ink-muted)' }}>Silhouette</span>
            <span className={styles.reviewValue}>{chosen?.name ?? 'Not chosen'}</span>
          </div>
          <div className={styles.reviewRow}>
            <span style={{ color: 'var(--ink-muted)' }}>Cloth</span>
            <span className={styles.reviewValue}>{fabric.trim() || 'Not written yet'}</span>
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
            <span style={{ color: 'var(--ink-muted)' }}>Starting figure</span>
            <span className={`${styles.reviewValue} ${styles.estimate}`}>
              {chosen?.estimate ? `from ${money(chosen.estimate)}` : '—'}
            </span>
          </div>
        </div>

        <div className={styles.submit}>
          <Button onClick={send} disabled={!ready || sending || sent}>
            {sent ? 'Sent' : sending ? 'Sending…' : 'Request a quote'}
          </Button>

          {!sent && !complete && (
            <p className={styles.submitNote}>
              {allZones.length - taken} measurement
              {allZones.length - taken === 1 ? '' : 's'} still to take. The atelier cannot
              draw a pattern from a partial sheet.
            </p>
          )}

          {!sent && complete && !ready && (
            <p className={styles.submitNote}>
              Your name, an email the tailor can reply to, and the cloth you have chosen.
            </p>
          )}

          {sendError && <p className={styles.fileError}>{sendError}</p>}

          {sent ? (
            <p className={styles.submitNote}>
              Your brief is with the atelier. A tailor reads every commission by hand, so
              the price comes by email — usually within two working days. Nothing is
              charged, and nothing is cut, until you have agreed the figure.
            </p>
          ) : (
            <p className={styles.submitNote}>
              Sending this asks for a price. It is not an order, and nothing is charged
              now.
            </p>
          )}
        </div>
      </div>

      <div>
        <div className={styles.label}>Your note</div>
        <p className={styles.noteEcho}>{notes.trim() || 'No note written yet.'}</p>
      </div>
    </div>,
  ];

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Design your own</h1>
      <p className={styles.lede}>
        A commission, not a configurator. You give the atelier a shape, a cloth, a note
        and a set of measurements; a tailor reads it and writes back with a price. One
        garment is made from that brief and no version of it enters a collection.
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
