import Link from 'next/link';
import type { Metadata } from 'next';
import { JsonLd } from '@/components/json-ld';
import { Reveal, RuleDraw, Stagger } from '@/components/motion';
import { PieceCard } from '@/components/piece-card';
import listing from '@/app/collection/[group]/listing.module.css';
import styles from '@/components/edit-page.module.css';
import { getPieces, money } from '@/lib/catalog';
import type { QA } from '@/lib/garments';
import { absolute, priceRange } from '@/lib/house';
import { breadcrumbLd, faqLd } from '@/lib/jsonld';

/* Austria, ball season (SEO-GEO-PLAN §5 row 18, copy in COPY-GUIDES-FAQ §2.1).
   The first German page; the full [locale] routing and hreflang arrive in
   Sprint 2, so until then this lives at its own path and the content is marked
   lang="de-AT" in place. Fact rules hold in German too (plan §3.1): the house
   is "aus Genf" and orders are "Versand aus Genf", never "in Genf gefertigt".
   Duty follows the live shipping page for the EU (plan §13.2). A native
   reviewer reads this before it goes live (plan §13.7). */

const PATH = '/de/ballkleid-seide';

/* The floor-length gowns, and the long wrap dresses for smaller balls. */
const BALL_IDS = ['001', '003', '004', '010', '011', '006', '007'];

const FAQ: QA[] = [
  {
    q: 'Kann ich ein Ballkleid online nach Maß bestellen?',
    a: 'Ja. Sie wählen das Kleid, wählen die Seidenfarbe aus 48 Farben und geben Ihre Maße ein. LINSILK schneidet und näht das Kleid nach Ihren eigenen Maßen, ohne Anprobe. Sie messen selbst nach unserer Anleitung oder gehen damit zu einer Schneiderei in Ihrer Nähe.',
  },
  {
    q: 'Wie lange vorher muss ich bestellen?',
    a: 'Die Fertigung dauert 2–4 Wochen ab Ihrem bestätigten Maßblatt, die Lieferung nach Österreich 3–6 Tage nach Versand aus Genf. Bestellen Sie sechs bis acht Wochen vor Ihrem Ball.',
  },
  {
    q: 'Wie hoch ist die Zollgebühr nach Österreich?',
    a: 'Die Preise verstehen sich in Schweizer Franken und enthalten den Zoll innerhalb der Europäischen Union. Der Preis, den Sie bestätigen, ist der Preis, den Sie zahlen.',
  },
  {
    q: 'Kann ich das Kleid zurückgeben?',
    a: 'Ein Kleid nach Maß wird für Sie allein gefertigt und kann nicht aus Gründen des Gefallens zurückgegeben werden. Bis zu Ihrer schriftlichen Bestätigung des Maßblatts wird nichts zugeschnitten; bis dahin können Sie die Bestellung ohne Begründung zurückziehen. Ein Fertigungsfehler wird repariert oder das Kleid ersetzt.',
  },
];

export async function generateMetadata(): Promise<Metadata> {
  const range = priceRange(await ballPieces());
  return {
    title: 'Ballkleid aus Seide nach Maß | LINSILK Genf',
    description: `Ballkleider aus 100 % Seide, nach Ihren Maßen gefertigt in 2–4 Wochen, 48 Seidenfarben. Von einem Genfer Modehaus. Jetzt für die Ballsaison bestellen.${range ? ` Ab ${money(range.from)}.` : ''}`,
    alternates: { canonical: PATH, languages: { 'de-AT': absolute(PATH) } },
    openGraph: { locale: 'de_AT' },
  };
}

const ballPieces = async () =>
  (await getPieces()).filter((p) => BALL_IDS.includes(p.id) && p.orderable && !p.retired);

export default async function BallkleidPage() {
  const pieces = await ballPieces();
  const range = priceRange(pieces);

  return (
    <div className={listing.page} lang="de-AT">
      <JsonLd
        data={breadcrumbLd([
          { name: 'LINSILK', path: '/' },
          { name: 'Ballkleid aus Seide nach Maß', path: PATH },
        ])}
      />
      <JsonLd data={faqLd(FAQ)} />

      <h1 className={styles.title}>Ballkleid aus Seide nach Maß, für die Wiener Ballsaison</h1>
      <Reveal>
        <p className={styles.intro}>
          Ein Ballkleid aus Seide nach Maß von LINSILK, dem Genfer Modehaus, wird nach
          Ihren eigenen Maßen zugeschnitten und genäht, in 2–4 Wochen ab bestätigtem
          Maßblatt, in 48 Seidenfarben
          {range ? `, von ${money(range.from)} bis ${money(range.to)}` : ''}. Bestellen Sie
          sechs bis acht Wochen vor Ihrem Ball.
        </p>
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
        <section className={styles.section}>
          <h2 className={styles.h2}>Rechtzeitig zur Ballsaison</h2>
          <p className={styles.p}>
            Die Ballsaison läuft bis in den Februar. Fertigung 2–4 Wochen, Lieferung nach
            Österreich 3–6 Tage nach Versand aus Genf. Planen Sie sechs bis acht Wochen
            ein. Die Preise enthalten den Zoll innerhalb der EU.{' '}
            <Link href="/care/shipping">Versand und Zoll</Link>
          </p>
        </section>
        <section className={styles.section}>
          <h2 className={styles.h2}>Welche Kleider passen</h2>
          <p className={styles.p}>
            Bodenlange Abendkleider aus Seide: Neckholder, hoher Ausschnitt, Schlitz,
            Schleppe. Lange Wickelkleider eignen sich für kleinere Bälle. Alle Kleider
            sind 100 % Seide; die Länge legen Sie mit Ihren Maßen selbst fest.
          </p>
        </section>
        <section className={styles.section}>
          <h2 className={styles.h2}>Ohne Anprobe zum passenden Kleid</h2>
          <p className={styles.p}>
            Sie messen selbst oder gehen mit unserer Anleitung zu einer Schneiderei in
            Wien, Salzburg oder Innsbruck. LINSILK bietet keine Anproben an.{' '}
            <Link href="/care/measuring">So messen Sie richtig</Link>
          </p>
        </section>
        <section className={styles.section}>
          <h2 className={styles.h2}>Fragen</h2>
          {FAQ.map(({ q, a }) => (
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
