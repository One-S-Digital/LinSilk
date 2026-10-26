import type { ReactNode } from 'react';
import styles from './seo-text.module.css';

/* The foot-of-page block for the answers search engines and AI assistants
   read. Real text in the page, set small and muted. */
export function SeoText({ children }: { children: ReactNode }) {
  return <aside className={styles.seo}>{children}</aside>;
}
