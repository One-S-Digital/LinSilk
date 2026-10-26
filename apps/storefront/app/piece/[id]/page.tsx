import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import type { Metadata } from 'next';
import { Reveal } from '@/components/motion';
import { PieceGallery } from '@/components/piece-gallery';
import { PieceOrderPanel } from '@/components/piece-order-panel';
import { JsonLd } from '@/components/json-ld';
import { TrackEvent } from '@/components/track-event';
import { collectionBySlug, findPiece, getPieces, isOrderable, money, roman, type Piece } from '@/lib/catalog';
import { CATEGORY, garmentType, imageAlt, QUESTIONS } from '@/lib/garments';
import { COLOURS } from '@/lib/house';
import { breadcrumbLd, productLd } from '@/lib/jsonld';
import { Approx } from '@/lib/currency';
import { getVariantId } from '@/lib/medusa';
import styles from './piece.module.css';

export async function generateStaticParams() {
  return (await getPieces()).map((piece) => ({ id: piece.slug }));
}

/* The title tag keeps the cloth, the piece and "made to measure"; the
   suffix shortens before any of those do (COPY-PAGES §0). */
function titleFor(piece: Piece) {
  const core = `${piece.name}, made to measure`;
  for (const suffix of [' | LINSILK Geneva', ' | LINSILK']) {
    if (core.length + suffix.length <= 62) return core + suffix;
  }
  return `${core} | LINSILK`;
}

/* A phased-out design, or the old numeric address, answers with a permanent
   redirect so its links and rankings move with it (SEO-GEO-PLAN §7). */
async function resolve(param: string) {
  const piece = await findPiece(param);
  if (!piece) notFound();
  if (piece.retired) {
    const successor = piece.successor ? await findPiece(piece.successor) : undefined;
    permanentRedirect(successor ? `/piece/${successor.slug}` : `/collection/${piece.group}`);
  }
  if (param !== piece.slug) permanentRedirect(`/piece/${piece.slug}`);
  return piece;
}

export async function generateMetadata(
  props: PageProps<'/piece/[id]'>,
): Promise<Metadata> {
  const { id } = await props.params;
  const piece = await findPiece(id);
  if (!piece) return {};
  const cloth = piece.cloth === 'linen' ? 'linen' : 'silk';
  const colours = cloth === 'linen' ? `${COLOURS.linen} linen` : `${COLOURS.silk} silk`;
  return {
    title: { absolute: titleFor(piece) },
    description: isOrderable(piece)
      ? `${piece.name} in 100% ${cloth}, cut and sewn to your measurements in 2–4 weeks. Choose from ${colours} colours. ${money(piece.price)}.`
      : `${piece.name} in 100% ${cloth}, from ${(await collectionBySlug(piece.collection))?.title ?? 'a past collection'}.`,
    alternates: { canonical: `/piece/${piece.slug}` },
    openGraph: piece.images[0] ? { images: [piece.images[0]] } : undefined,
  };
}

export default async function PiecePage(props: PageProps<'/piece/[id]'>) {
  const { id } = await props.params;
  const piece = await resolve(id);

  const weave = piece.group === 'men' ? 'sand' : 'bone';
  const label = piece.group === 'men' ? 'Men' : 'Women';

  /* A piece from a closed season is a record, not a product: no price, no
     lead time, and the way back leads to the archive it belongs to. */
  const collection = (await collectionBySlug(piece.collection))!;
  const orderable = isOrderable(piece);
  const numeral = roman(collection.number);
  const cloth = piece.cloth === 'linen' ? 'linen' : 'silk';
  const type = garmentType(piece);
  const questions = QUESTIONS[type];
  const alts = piece.images.map((src, i) => imageAlt(piece, src, i));

  /* Two more of the same kind in the same cloth, then the same cloth, from
     what is orderable now. */
  const open = (await getPieces()).filter(
    (p) => p.id !== piece.id && p.orderable && !p.retired && p.cloth === piece.cloth && p.group === piece.group,
  );
  const related = [
    ...open.filter((p) => garmentType(p) === type),
    ...open.filter((p) => garmentType(p) !== type),
  ].slice(0, 2);

  return (
    <div className={styles.page}>
      <JsonLd data={productLd(piece)} />
      <TrackEvent name="piece_view" data={{ piece: piece.id, cloth }} />
      <JsonLd
        data={breadcrumbLd([
          { name: 'Collection', path: '/collection' },
          { name: label, path: `/collection/${piece.group}` },
          { name: piece.name, path: `/piece/${piece.slug}` },
        ])}
      />
      <p className={styles.crumb}>
        {orderable ? (
          <>
            <Link href="/collection" style={{ color: 'var(--ink-muted)' }}>
              Collection
            </Link>{' '}
            —{' '}
            <Link
              href={`/collection/${piece.group}`}
              style={{ color: 'var(--ink-muted)' }}
            >
              {label}
            </Link>
            , {collection.season} {numeral}
          </>
        ) : (
          <>
            <Link href="/archive" style={{ color: 'var(--ink-muted)' }}>
              Archive
            </Link>{' '}
            —{' '}
            <Link
              href={`/archive/${collection.slug}`}
              style={{ color: 'var(--ink-muted)' }}
            >
              {collection.title}
            </Link>
          </>
        )}
      </p>

      <div className={styles.layout}>
        {/* ---- Gallery ---- */}
        <PieceGallery images={piece.images} alts={alts} name={piece.name} shot={piece.shot} weave={weave} />

        {/* ---- Detail ---- */}
        <div className={styles.detail}>
          <Reveal y={18}>
            <h1 className={styles.title}>{piece.name}</h1>

            <div className={styles.metaRow}>
              <span className={styles.material}>{piece.material}</span>
              {orderable && (
                <span className={styles.price}>
                  {money(piece.price)}
                  <Approx chf={piece.price} className={styles.approx} />
                </span>
              )}
            </div>

            <p className={styles.description}>
              Made to measure in 100% {cloth}: cut and sewn to your own measurements in
              two to four weeks from your confirmed sheet, inspected twice, then dispatched
              from Geneva. Cut flat by hand from a pattern drawn to your sheet, then closed
              on the machine and finished at the bench — hem, facings and lining by hand.
            </p>

            <div className={styles.run}>
              <span>Collection {numeral}</span>
              {orderable ? <span>two to four weeks</span> : <span>closed</span>}
            </div>
          </Reveal>

          <PieceOrderPanel
            piece={piece}
            variantId={orderable ? await getVariantId(piece.id) : null}
          />
        </div>
      </div>

      <div className={styles.more}>
        <section className={styles.moreBlock} aria-labelledby="facts-heading">
          <h2 id="facts-heading" className={styles.moreTitle}>The facts</h2>
          <dl className={styles.facts}>
            <div><dt>Cloth</dt><dd>100% {cloth}</dd></div>
            <div>
              <dt>Colours</dt>
              <dd>
                Any of {cloth === 'linen' ? `${COLOURS.linen} linen colours` : `${COLOURS.silk} silk colours: plain, jacquard and brocade`}.{' '}
                <Link href="/cloth">See the cloth</Link>
              </dd>
            </div>
            <div><dt>Making time</dt><dd>2–4 weeks from your confirmed measurement sheet</dd></div>
            <div><dt>Care</dt><dd>Cool hand-wash, dry flat out of direct sun</dd></div>
            <div>
              <dt>Delivery</dt>
              <dd>
                Switzerland 2–3 days, EU and UK 3–6, rest of world 5–10, once dispatched
                from Geneva, with tracking. <Link href="/care/shipping">Shipping and duty</Link>
              </dd>
            </div>
          </dl>
        </section>

        <section className={styles.moreBlock} aria-labelledby="how-heading">
          <h2 id="how-heading" className={styles.moreTitle}>How it is made to measure</h2>
          <ol className={styles.howList}>
            <li>Choose your colour from the swatches of its cloth.</li>
            <li>
              Enter your measurements; the <Link href="/care/measuring">measuring guide</Link>{' '}
              helps.
            </li>
            <li>It is cut and sewn in 2–4 weeks and sent with tracking.</li>
          </ol>
          <p className={styles.moreNote}>
            <Link href="/made-to-measure">How made-to-measure works at LINSILK</Link>
          </p>
        </section>

        <section className={styles.moreBlock} aria-labelledby="questions-heading">
          <h2 id="questions-heading" className={styles.moreTitle}>
            Questions about {CATEGORY[type].label.toLowerCase()}
          </h2>
          {questions.map(({ q, a }) => (
            <div key={q} className={styles.qa}>
              <h3 className={styles.q}>{q}</h3>
              <p className={styles.a}>{a}</p>
            </div>
          ))}
          <p className={styles.moreNote}>
            Lead time, duty and returns: <Link href="/care/questions">all questions</Link>
          </p>
        </section>

        {related.length > 0 && (
          <section className={styles.moreBlock} aria-labelledby="related-heading">
            <h2 id="related-heading" className={styles.moreTitle}>Also in {cloth}</h2>
            <ul className={styles.relatedList}>
              {related.map((p) => (
                <li key={p.id}>
                  <Link href={`/piece/${p.slug}`}>{p.name}</Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
