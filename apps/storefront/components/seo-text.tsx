import Link from 'next/link';
import type { ReactNode } from 'react';
import styles from './seo-text.module.css';

/* The foot-of-page block for the answers search engines and AI assistants
   read: an editorial panel under the page's content. Real text in the page's
   HTML, never hidden. With a title it sits beside the content on wide screens. */
export function SeoText({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title?: string;
  children: ReactNode;
}) {
  const head = eyebrow || title;
  return (
    <aside className={styles.seo} data-split={head || undefined}>
      {head && (
        <header>
          {eyebrow && <span className={styles.eyebrow}>{eyebrow}</span>}
          {title && <h2 className={styles.title}>{title}</h2>}
        </header>
      )}
      <div className={styles.body}>{children}</div>
    </aside>
  );
}

export function SeoSteps({ items }: { items: string[] }) {
  return (
    <ol className={styles.steps}>
      {items.map((s, i) => (
        <li key={s}>
          <span className={styles.num}>{`0${i + 1}`}</span>
          <span>{s}</span>
        </li>
      ))}
    </ol>
  );
}

export function SeoLinks({ links }: { links: { href: string; label: string }[] }) {
  return (
    <ul className={styles.chips}>
      {links.map((l) => (
        <li key={l.href}>
          <Link href={l.href}>{l.label}</Link>
        </li>
      ))}
    </ul>
  );
}

/* A grid of short titled paragraphs. */
export function SeoSubs({ items }: { items: { title: string; body: ReactNode }[] }) {
  return (
    <div className={styles.subs}>
      {items.map((s) => (
        <section key={s.title} className={styles.sub}>
          <h3 className={styles.subTitle}>{s.title}</h3>
          <p>{s.body}</p>
        </section>
      ))}
    </div>
  );
}

/* Questions that fold open; the answers are in the page either way. */
export function SeoFaq({ title, items }: { title: string; items: { q: string; a: string }[] }) {
  return (
    <section className={styles.faq}>
      <h3 className={styles.faqTitle}>{title}</h3>
      {items.map(({ q, a }) => (
        <details key={q}>
          <summary>{q}</summary>
          <p>{a}</p>
        </details>
      ))}
    </section>
  );
}
