import type { CSSProperties, ReactNode } from 'react';
import styles from './shot.module.css';

export type Weave = 'bone' | 'sand' | 'dark' | 'forest';

export function ShotFrame({
  note,
  weave = 'bone',
  ratio = '3 / 4',
  src,
  alt,
  onDark = false,
  zoom = false,
  className,
  style,
  children,
}: {
  /** Art direction for the photograph that belongs here. */
  note?: string;
  weave?: Weave;
  /** Any valid aspect-ratio value: '3 / 4', '4 / 5', '16 / 10', '1'. */
  ratio?: string;
  src?: string;
  alt?: string;
  onDark?: boolean;
  /** Lifts the cloth slightly toward the viewer on hover. */
  zoom?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}) {
  return (
    <div
      className={`${styles.frame}${className ? ` ${className}` : ''}`}
      data-zoom={zoom || undefined}
      style={{ aspectRatio: ratio, ...style }}
    >
      {src ? (
        <img className={styles.image} src={src} alt={alt ?? ''} loading="lazy" />
      ) : (
        <div className={styles.weave} data-weave={weave} aria-hidden="true" />
      )}
      {note && (
        <span className={styles.note} data-on={onDark ? 'dark' : 'light'}>
          {note}
        </span>
      )}
      {children}
    </div>
  );
}
