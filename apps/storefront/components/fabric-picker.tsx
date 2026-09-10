'use client';

import { FABRICS } from '@/lib/catalog';
import styles from './fabric-picker.module.css';

export function FabricPicker({
  value,
  onChange,
  layout = 'grid',
  idPrefix = 'fabric',
}: {
  value: string;
  onChange: (key: string) => void;
  layout?: 'grid' | 'list';
  idPrefix?: string;
}) {
  const isList = layout === 'list';

  return (
    <div
      className={isList ? styles.list : styles.grid}
      role="group"
      aria-label="Cloth"
      id={idPrefix}
    >
      {FABRICS.map((fabric) => (
        <button
          key={fabric.key}
          type="button"
          className={`${styles.option}${isList ? ` ${styles.listOption}` : ''}`}
          aria-pressed={value === fabric.key}
          onClick={() => onChange(fabric.key)}
        >
          {/* Only the silks take the sheen; linen is matte and stays matte. */}
          <span
            className={`${styles.swatch}${fabric.lustrous ? ' u-sheen' : ''}`}
            style={{ background: fabric.css, display: 'block' }}
            aria-hidden="true"
          />
          <span style={{ display: 'block' }}>
            <span className={isList ? styles.listName : styles.name}>
              {fabric.name}
            </span>
            {isList && <span className={styles.origin}>{fabric.origin}</span>}
          </span>
        </button>
      ))}
    </div>
  );
}
