'use client';

import type { Cloth } from '@/lib/catalog';
import { orderText, swatchName } from '@/lib/i18n-order';
import { CLOTH_NAME, swatchesFor, type Swatch } from '@/lib/swatches';
import { useLang } from '@/lib/use-lang';
import styles from './swatch-picker.module.css';

/** One piece of cloth, drawn square. */
export function SwatchTile({ swatch }: { swatch: Swatch }) {
  const lustrous = swatch.cloth === 'silk';
  return (
    <span className={`${styles.tile}${lustrous ? ' u-sheen' : ''}`} aria-hidden="true">
      <img src={swatch.image} alt="" width={240} height={240} loading="lazy" />
    </span>
  );
}

export function SwatchPicker({
  cloth,
  value,
  onChange,
  idPrefix = 'swatch',
}: {
  cloth: Cloth;
  /** The chosen swatch's key, or null before a colour has been chosen. */
  value: string | null;
  onChange: (key: string) => void;
  idPrefix?: string;
}) {
  const lang = useLang();
  const ot = orderText(lang);
  const clothWord = ot.cloth[cloth] ?? CLOTH_NAME[cloth];
  /* Silk comes in three weaves and is shown under a heading for each; linen is
     one list. The order of the library is kept either way. */
  const sections: { name?: string; items: Swatch[] }[] = [];
  for (const swatch of swatchesFor(cloth)) {
    const last = sections[sections.length - 1];
    if (last && last.name === swatch.group) last.items.push(swatch);
    else sections.push({ name: swatch.group, items: [swatch] });
  }

  return (
    <div id={idPrefix} className={styles.sections}>
      {sections.map((section) => (
        <div
          key={section.name ?? 'all'}
          role="group"
          aria-label={
            section.name
              ? ot.swatch.group(ot.weave[section.name] ?? section.name, lang === 'en' ? cloth : clothWord)
              : ot.swatch.colours(clothWord)
          }
        >
          {section.name && (
            <div className={styles.groupName}>{ot.weave[section.name] ?? section.name}</div>
          )}
          <div className={styles.grid}>
            {section.items.map((swatch) => (
              <button
                key={swatch.key}
                type="button"
                className={styles.option}
                aria-label={swatchName(swatch, lang)}
                aria-pressed={value === swatch.key}
                onClick={() => onChange(swatch.key)}
              >
                <SwatchTile swatch={swatch} />
                <span className={styles.name}>{swatchName(swatch, lang)}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
