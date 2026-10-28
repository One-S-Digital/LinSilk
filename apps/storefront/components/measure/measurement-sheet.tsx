'use client';

import Image from 'next/image';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { ZONES, type Group, type Zone } from '@/lib/catalog';
import {
  formatValue,
  loadLocal,
  rangeOf,
  saveLocal,
  takenCount,
  toCm,
  validate,
  type Measurements,
  type Unit,
} from '@/lib/measurements';
import { orderText, zoneText } from '@/lib/i18n-order';
import { useHydrated } from '@/lib/use-hydrated';
import { localHref } from '@/lib/locale-routes';
import { useLang } from '@/lib/use-lang';
import styles from './measurement-sheet.module.css';

const GUIDES = {
  women: { src: '/measure/women.png', w: 860, h: 858 },
  men: { src: '/measure/men.png', w: 880, h: 950 },
} as const;

export function MeasurementSheet({
  group,
  bodyZones = ZONES,
  garmentZones = [],
  onChange,
  title,
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
  /* The body measurements this garment needs; all of them unless the piece
     is a shirt or a trouser. */
  bodyZones?: Zone[];
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
  const lang = useLang();
  const t = orderText(lang).sheet;
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
  const [active, setActive] = useState<string>(bodyZones[0].key);
  const [guide, setGuide] = useState<Group>(group);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  /** Counts edits, so a save can tell whether what it sent is still what is on screen. */
  const edits = useRef(0);
  const hydrated = useHydrated();
  const [restored, setRestored] = useState(Boolean(initialValues));

  const allZones = useMemo(() => [...bodyZones, ...garmentZones], [bodyZones, garmentZones]);

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
      const range = validate(z.key, cm, unit) ? rangeOf(z.key) : undefined;
      const message = range
        ? t.range(formatValue(range[0], unit), formatValue(range[1], unit), unit)
        : null;
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
            {zoneText(zone, lang).label}
          </label>
          <p className={styles.hint} id={`${id}-hint`}>
            {zoneText(zone, lang).hint}
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
          {title ?? t.title}
        </h2>
        <div className={styles.units} role="group" aria-label={t.units}>
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
          {t.intro(allZones.length)}
        </p>
      )}

      <div className={styles.guide}>
        <Image
          className={styles.guideImage}
          src={plate.src}
          width={plate.w}
          height={plate.h}
          alt={guide === 'men' ? t.guideMen : t.guideWomen}
          sizes="(max-width: 900px) 100vw, 520px"
        />
        <div className={styles.guideFoot}>
          <span className={styles.guideNote}>{t.tapeSits}</span>
          <button
            type="button"
            className={styles.guideToggle}
            onClick={() => setGuide((g) => (g === 'men' ? 'women' : 'men'))}
          >
            {guide === 'men' ? t.showWomen : t.showMen}
          </button>
        </div>
      </div>

      <div className={styles.progress}>
        <span className={styles.progressLabel}>
          {taken === allZones.length
            ? t.allTaken(allZones.length)
            : t.progress(Math.min(taken + 1, allZones.length), allZones.length)}
        </span>
        <div className={styles.progressTrack}>
          <div
            className={styles.progressFill}
            style={{ width: `${Math.round((taken / allZones.length) * 100)}%` }}
          />
        </div>
      </div>

      <div className={styles.rows}>{bodyZones.map((zone, i) => renderRow(zone, i))}</div>

      {garmentZones.length > 0 && (
        <>
          <div className={styles.groupHead}>
            <h3 className={styles.groupTitle}>{t.garmentH}</h3>
            <p className={styles.groupNote}>{t.garmentNote}</p>
          </div>
          <div className={styles.rows}>
            {garmentZones.map((zone, i) => renderRow(zone, bodyZones.length + i))}
          </div>
        </>
      )}

      <div className={styles.actions}>
        <a href={localHref(lang, '/care/measuring')} style={{ color: 'var(--ink-muted)' }}>
          {t.tailor}
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
                setSaveError(t.saveFail);
              }
            } finally {
              setSaving(false);
            }
          }}
          disabled={taken === 0 || saving}
          style={{ color: 'var(--ink-muted)' }}
        >
          {saving ? t.saving : t.save}
        </button>
        {saved && (
          <span className={styles.saved}>
            {onSave ? t.savedAccount : t.savedDevice}
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
          <div className={styles.reviewHead}>{t.review}</div>
          <div className={styles.reviewGrid}>
            {summary.map((z) => (
              <div key={z.key} className={styles.reviewRow}>
                <span style={{ color: 'var(--ink-secondary)' }}>{zoneText(z, lang).label}</span>
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
