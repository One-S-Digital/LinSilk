import Link from 'next/link';
import type { Metadata } from 'next';
import { JsonLd } from '@/components/json-ld';
import { Reveal, RuleDraw, Stagger } from '@/components/motion';
import { PieceCard } from '@/components/piece-card';
import listing from '@/app/collection/[group]/listing.module.css';
import { getPieces } from '@/lib/catalog';
import type { Edit } from '@/lib/edits';
import { priceRange } from '@/lib/house';
import { breadcrumbLd } from '@/lib/jsonld';
import styles from './edit-page.module.css';

/* What is orderable now, for one edit. */
const piecesFor = async (edit: Edit) =>
  (await getPieces()).filter((p) => p.orderable && !p.retired && edit.pick(p));

export async function editMetadata(edit: Edit): Promise<Metadata> {
  const range = priceRange(await piecesFor(edit));
  return {
    title: edit.title,
    description: edit.description(range),
    alternates: { canonical: edit.path },
  };
}

/* A category or occasion page: the answer first, then the pieces, then the
   reasons and the questions. The questions are shown, not marked up — the
   pages that own them (/made-to-measure, /care/questions) carry FAQPage. */
export async function EditPage({ edit }: { edit: Edit }) {
  const pieces = await piecesFor(edit);
  const range = priceRange(pieces);

  return (
    <div className={listing.page}>
      <JsonLd data={breadcrumbLd([...edit.crumb, { name: edit.h1, path: edit.path }])} />
      <p className={listing.crumb}>
        {edit.crumb.map((c) => (
          <span key={c.path}>
            <Link href={c.path} style={{ color: 'var(--ink-muted)' }}>
              {c.name}
            </Link>{' '}
            —{' '}
          </span>
        ))}
        {edit.h1}
      </p>

      <h1 className={styles.title}>{edit.h1}</h1>
      <Reveal>
        <p className={styles.intro}>{edit.intro(range)}</p>
      </Reveal>

      {pieces.length > 0 && (
        <>
          <div className={listing.groupRule}>
            <RuleDraw />
          </div>
          <Stagger className={listing.grid} step={0.07}>
            {pieces.map((piece, i) => (
              <PieceCard key={piece.id} piece={piece} index={i} />
            ))}
          </Stagger>
        </>
      )}

      <div className={styles.text}>
        {edit.sections.map((s) => (
          <section key={s.h2} className={styles.section}>
            <h2 className={styles.h2}>{s.h2}</h2>
            <p className={styles.p}>{s.body}</p>
          </section>
        ))}
        <section className={styles.section}>
          <h2 className={styles.h2}>How made-to-measure works here</h2>
          <p className={styles.p}>
            Choose the piece, choose its colour from the swatches of its cloth, and enter
            your measurements. It is cut and sewn in 2–4 weeks from your confirmed sheet.{' '}
            <Link href="/made-to-measure">How made-to-measure works</Link>
          </p>
        </section>
        <section className={styles.section}>
          <h2 className={styles.h2}>Questions</h2>
          {edit.faqs.map(({ q, a }) => (
            <div key={q} className={styles.qa}>
              <h3 className={styles.q}>{q}</h3>
              <p className={styles.p}>{a}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
