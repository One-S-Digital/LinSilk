import type { ReactNode } from 'react';
import styles from './doc-page.module.css';

export function DocPage({
  eyebrow = 'Client care',
  title,
  lead,
  children,
  foot,
}: {
  eyebrow?: string;
  title: string;
  lead: string;
  children: ReactNode;
  foot?: ReactNode;
}) {
  return (
    <article className={styles.page}>
      <p className={styles.eyebrow}>{eyebrow}</p>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.lead}>{lead}</p>
      {children}
      {foot && <div className={styles.foot}>{foot}</div>}
    </article>
  );
}

export function DocSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className={styles.section}>
      <h2 className={styles.h2}>{title}</h2>
      {children}
    </section>
  );
}

export function DocP({ children }: { children: ReactNode }) {
  return <p className={styles.p}>{children}</p>;
}

export function DocList({ items }: { items: ReactNode[] }) {
  return (
    <ul className={styles.list}>
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

export function DocRows({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <div className={styles.rows}>
      {rows.map(([key, value]) => (
        <div key={key} className={styles.row}>
          <span className={styles.rowKey}>{key}</span>
          <span>{value}</span>
        </div>
      ))}
    </div>
  );
}
