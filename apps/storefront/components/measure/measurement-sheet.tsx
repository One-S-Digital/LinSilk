'use client';

import Image from 'next/image';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { ZONES, type Group, type Zone } from '@/lib/catalog';
import {
  formatValue,
  loadLocal,
  saveLocal,
  takenCount,
  toCm,
  validate,
  type Measurements,
  type Unit,
} from '@/lib/measurements';
import { useHydrated } from '@/lib/use-hydrated';
import styles from './measurement-sheet.module.css';

const GUIDES = {
  women: { src: '/measure/women.png', w: 860, h: 858, alt: 'Measurement guide, women' },
  men: { src: '/measure/men.png', w: 880, h: 950, alt: 'Measurement guide, men' },
} as const;

export function MeasurementSheet({
  group,
  garmentZones = [],
  onChange,
  title = 'Your measurements',
  showIntro = true,
  initialValues,
  initialUnit,
  onSave,
}: {
  group: Group;
  /* Measurements that describe the garment rather than the body — a coat's
     finished length, say. Empty for anything whose length is already implied,
     like a trouser, where the inseam is the length. */
  garmentZones?: Zone[];
  onChange?: (values: Measurements, unit: Unit) => void;
  title?: string;
  showIntro?: boolean;
  /* An account's saved profile, read once and shown instead of whatever is
     on this device. When set, the local-storage restore below is skipped —
     a signed-in profile is the sheet, not a fallback for it. */
  initialValues?: Measurements;
  initialUnit?: Unit;
  /* Where "Save this profile" writes when someone is signed in. Absent, it
     writes to this device instead, as it always has. */
  onSave?: (values: Measurements, unit: Unit) => Promise<{ error?: string } | void>;
}) {
  const uid = useId();
  const [unit, setUnit] = useState<Unit>(initialUnit ?? 'cm');
  const [values, setValues] = useState<Measurements>(initialValues ?? {});
  /** What is literally in each input, in the current unit, so typing "17." works. */
  const [drafts, setDrafts] = useState<Record<string, string>>(
    Object.fromEntries(
      Object.entries(initialValues ?? {})
        .filter(([, cm]) => typeof cm === 'number')
        .map(([k, cm]) => [k, formatValue(cm as number, initialUnit ?? 'cm')]),
    ),
  );
  const [active, setActive] = useState<string>(ZONES[0].key);
  const [guide, setGuide] = useState<Group>(group);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  /** Counts edits, so a save can tell whether what it sent is still what is on screen. */
  const edits = useRef(0);
  const hydrated = useHydrated();
  const [restored, setRestored] = useState(Boolean(initialValues));

  const allZones = useMemo(() => [...ZONES, ...garmentZones], [garmentZones]);

  // Restore anything the client already typed on a previous visit.
  if (hydrated && !restored) {
    const stored = loadLocal();
    setRestored(true);
    setUnit(stored.unit);
    setValues(stored.values);
    setDrafts(
      Object.fromEntries(
        Object.entries(stored.values)
          .filter(([, cm]) => typeof cm === 'number')
          .map(([k, cm]) => [k, formatValue(cm as number, stored.unit)]),
      ),
    );
  }

  useEffect(() => {
    if (restored) onChange?.(values, unit);
  }, [restored, values, unit, onChange]);

  /* Switching units rewrites what is on screen from the stored centimetres —
     the number the client sees changes, the measurement does not. */
  const switchUnit = (next: Unit) => {
    if (next === unit) return;
    setUnit(next);
    setDrafts(
      Object.fromEntries(
        allZones
          .filter((z) => typeof values[z.key] === 'number')
          .map((z) => [z.key, formatValue(values[z.key] as number, next)]),
      ),
    );
    edits.current += 1;
    setSaved(false);
    setSaveError(null);
  };

  const setField = (key: string, raw: string) => {
    setDrafts((d) => ({ ...d, [key]: raw }));
    edits.current += 1;
    setSaved(false);
    setSaveError(null);

    const cleaned = raw.replace(',', '.').trim();
    if (cleaned === '') {
      setValues((v) => {
        const next = { ...v };
        delete next[key];
        return next;
      });
      return;
    }

    const parsed = Number(cleaned);
    if (!Number.isFinite(parsed) || parsed <= 0) return;
    setValues((v) => ({ ...v, [key]: toCm(parsed, unit) }));
  };

  const errors = useMemo(() => {
    const out: Record<string, string> = {};
    for (const z of allZones) {
      const cm = values[z.key];
      if (typeof cm !== 'number') continue;
      const message = validate(z.key, cm, unit);
      if (message) out[z.key] = message;
    }
    return out;
  }, [values, unit, allZones]);

  const taken = takenCount(values, allZones);
  const plate = GUIDES[guide];
  const summary = allZones.filter((z) => typeof values[z.key] === 'number');

  /* Enter moves down the sheet the way tabbing through a paper form would. */
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const next = allZones[index + 1];
    if (!next) return;
    setActive(next.key);
    document.getElementById(`${uid}-${next.key}`)?.focus();
  };

  const renderRow = (zone: Zone, index: number) => {
    const id = `${uid}-${zone.key}`;
    const error = errors[zone.key];
    return (
      <div
        key={zone.key}
        className={styles.row}
        data-active={active === zone.key}
        data-error={Boolean(error)}
      >
        <span className={styles.num} aria-hidden="true">
          {String(index + 1).padStart(2, '0')}
        </span>

        <div>
          <label className={styles.label} htmlFor={id}>
            {zone.label}
          </label>
          <p className={styles.hint} id={`${id}-hint`}>
            {zone.hint}
          </p>
          {error && (
            <p className={styles.error} id={`${id}-error`} role="status">
              {error}
            </p>
          )}
        </div>

        <div className={styles.field}>
          <input
            id={id}
            className={styles.input}
            value={drafts[zone.key] ?? ''}
            onChange={(e) => setField(zone.key, e.target.value)}
            onFocus={() => setActive(zone.key)}
            onKeyDown={(e) => onKeyDown(e, index)}
            placeholder="—"
            inputMode="decimal"
            autoComplete="off"
            aria-describedby={error ? `${id}-error` : `${id}-hint`}
            aria-invalid={Boolean(error)}
          />
          <span className={styles.suffix} aria-hidden="true">
            {unit}
          </span>
        </div>
      </div>
    );
  };

  return (
    <section className={styles.sheet} aria-labelledby={`${uid}-title`}>
      <div className={styles.head}>
        <h2 id={`${uid}-title`} className={styles.title}>
          {title}
        </h2>
        <div className={styles.units} role="group" aria-label="Units">
          {(['cm', 'in'] as const).map((u) => (
            <button
              key={u}
              type="button"
              className={styles.unit}
              aria-pressed={unit === u}
              onClick={() => switchUnit(u)}
            >
              {u}
            </button>
          ))}
        </div>
      </div>

      {showIntro && (
        <p className={styles.intro}>
          There is no small, medium or large. {allZones.length} measurements, taken
          over close-fitting clothes, with the tape flat against the body. Four of
          them are drops rather than girths — they are what let a flat pattern sit on
          your body, and no amount of chest and waist substitutes for them. Take your
          time; this is the part of the order that decides the garment.
        </p>
      )}

      <div className={styles.guide}>
        <Image
          className={styles.guideImage}
          src={plate.src}
          width={plate.w}
          height={plate.h}
          alt={plate.alt}
          sizes="(max-width: 900px) 100vw, 520px"
        />
        <div className={styles.guideFoot}>
          <span className={styles.guideNote}>where the tape sits</span>
          <button
            type="button"
            className={styles.guideToggle}
            onClick={() => setGuide((g) => (g === 'men' ? 'women' : 'men'))}
          >
            {guide === 'men' ? 'Show women’s guide' : 'Show men’s guide'}
          </button>
        </div>
      </div>

      <div className={styles.progress}>
        <span className={styles.progressLabel}>
          {taken === allZones.length
            ? `All ${allZones.length} taken`
            : `Measurement ${Math.min(taken + 1, allZones.length)} of ${allZones.length}`}
        </span>
        <div className={styles.progressTrack}>
          <div
            className={styles.progressFill}
            style={{ width: `${Math.round((taken / allZones.length) * 100)}%` }}
          />
        </div>
      </div>

      <div className={styles.rows}>{ZONES.map((zone, i) => renderRow(zone, i))}</div>

      {garmentZones.length > 0 && (
        <>
          <div className={styles.groupHead}>
            <h3 className={styles.groupTitle}>The garment</h3>
            <p className={styles.groupNote}>
              Not a fact about your body but a decision about the piece. Your
              measurements say how it should fit; this says how long it should be.
            </p>
          </div>
          <div className={styles.rows}>
            {garmentZones.map((zone, i) => renderRow(zone, ZONES.length + i))}
          </div>
        </>
      )}

      <div className={styles.actions}>
        <a href="/care/measuring" style={{ color: 'var(--ink-muted)' }}>
          Have a tailor take your measurements
        </a>
        <button
          type="button"
          onClick={async () => {
            setSaveError(null);
            if (!onSave) {
              setSaved(saveLocal(unit, values));
              return;
            }
            setSaving(true);
            const sent = edits.current;
            try {
              const result = await onSave(values, unit);
              /* Edited while it was on its way: what was saved is not what is
                 on screen, so the outcome says nothing about it — claiming
                 "Saved" would be claiming values the account does not hold. */
              if (edits.current !== sent) return;
              if (result?.error) setSaveError(result.error);
              else setSaved(true);
            } catch {
              /* A server action that throws rather than returning an error —
                 the network went, or the server did. */
              if (edits.current === sent) {
                setSaveError('Could not save just now. Try again in a moment.');
              }
            } finally {
              setSaving(false);
            }
          }}
          disabled={taken === 0 || saving}
          style={{ color: 'var(--ink-muted)' }}
        >
          {saving ? 'Saving…' : 'Save this profile'}
        </button>
        {saved && (
          <span className={styles.saved}>
            {onSave ? 'Saved to your account' : 'Saved to this device'}
          </span>
        )}
        {saveError && (
          <span className={styles.error} role="status">
            {saveError}
          </span>
        )}
      </div>

      {summary.length > 0 && (
        <div className={styles.review}>
          <div className={styles.reviewHead}>Review</div>
          <div className={styles.reviewGrid}>
            {summary.map((z) => (
              <div key={z.key} className={styles.reviewRow}>
                <span style={{ color: 'var(--ink-secondary)' }}>{z.label}</span>
                <span className={styles.reviewValue}>
                  {formatValue(values[z.key] as number, unit)} {unit}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
