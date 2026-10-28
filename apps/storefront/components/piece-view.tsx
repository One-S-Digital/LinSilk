import Link from 'next/link';
import { Reveal } from '@/components/motion';
import { PieceGallery } from '@/components/piece-gallery';
import { PieceOrderPanel } from '@/components/piece-order-panel';
import { JsonLd } from '@/components/json-ld';
import { TrackEvent } from '@/components/track-event';
import styles from '@/app/piece/[id]/piece.module.css';
import { collectionBySlug, getPieces, isOrderable, money, roman, type Piece } from '@/lib/catalog';
import { garmentType } from '@/lib/garments';
import { COLOURS } from '@/lib/house';
import { LANG, type Lang } from '@/lib/i18n';
import { breadcrumbLd, productLd } from '@/lib/jsonld';
import { localHref } from '@/lib/locale-routes';
import { pieceName } from '@/lib/piece-names';
import { altIn, piecePathIn, pieceText } from '@/lib/piece-i18n';
import { Approx } from '@/lib/currency';
import { getVariantId } from '@/lib/medusa';

/* One piece page, in any language, order panel and measurement sheet included. */
export async function PieceView({ piece, lang }: { piece: Piece; lang: Lang }) {
  const t = pieceText(lang);
  const name = pieceName(piece.name, lang);
  const weave = piece.group === 'men' ? 'sand' : 'bone';
  const label = piece.group === 'men' ? t.men : t.women;

  /* A piece from a closed season is a record, not a product: no price, no
     lead time, and the way back leads to the archive it belongs to. */
  const collection = (await collectionBySlug(piece.collection))!;
  const orderable = isOrderable(piece);
  const numeral = roman(collection.number);
  const cloth = piece.cloth === 'linen' ? 'linen' : 'silk';
  const clothWord = t.cloth[cloth];
  const type = garmentType(piece);
  const questions = t.questions[type];
  const alts = piece.images.map((src, i) => altIn(lang, piece, src, i));
  const here = piecePathIn(lang, piece);
  const to = (p: string) => localHref(lang, p);

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
    <div className={styles.page} lang={lang === 'en' ? undefined : LANG[lang]}>
      <JsonLd
        data={productLd(
          piece,
          lang === 'en'
            ? undefined
            : {
                name,
                path: here,
                inLanguage: LANG[lang],
                description: t.ldDescription(name, clothWord),
              },
        )}
      />
      <TrackEvent name="piece_view" data={{ piece: piece.id, cloth }} />
      <JsonLd
        data={breadcrumbLd([
          { name: t.collection, path: to('/collection') },
          { name: label, path: to(`/collection/${piece.group}`) },
          { name, path: here },
        ])}
      />
      <p className={styles.crumb}>
        {orderable ? (
          <>
            <Link href={to('/collection')} style={{ color: 'var(--ink-muted)' }}>
              {t.collection}
            </Link>{' '}
            —{' '}
            <Link
              href={to(`/collection/${piece.group}`)}
              style={{ color: 'var(--ink-muted)' }}
            >
              {label}
            </Link>
            , {collection.season} {numeral}
          </>
        ) : (
          <>
            <Link href="/archive" style={{ color: 'var(--ink-muted)' }}>
              {t.archive}
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
        <PieceGallery images={piece.images} alts={alts} name={name} shot={piece.shot} weave={weave} />

        {/* ---- Detail ---- */}
        <div className={styles.detail}>
          <Reveal y={18}>
            <h1 className={styles.title}>{name}</h1>

            <div className={styles.metaRow}>
              <span className={styles.material}>{piece.material}</span>
              {orderable && (
                <span className={styles.price}>
                  {money(piece.price)}
                  <Approx chf={piece.price} className={styles.approx} />
                </span>
              )}
            </div>

            <p className={styles.description}>{t.description(clothWord)}</p>

            <div className={styles.run}>
              <span>{t.run(numeral)}</span>
              {orderable ? <span>{t.weeks}</span> : <span>{t.closed}</span>}
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
          <h2 id="facts-heading" className={styles.moreTitle}>{t.factsH}</h2>
          <dl className={styles.facts}>
            <div><dt>{t.factCloth}</dt><dd>100% {clothWord}</dd></div>
            <div>
              <dt>{t.factColours}</dt>
              <dd>
                {t.coloursLine(cloth, cloth === 'linen' ? COLOURS.linen : COLOURS.silk)}{' '}
                <Link href={to('/cloth')}>{t.seeCloth}</Link>
              </dd>
            </div>
            <div><dt>{t.factMaking}</dt><dd>{t.makingLine}</dd></div>
            <div><dt>{t.factCare}</dt><dd>{t.careLine}</dd></div>
            <div>
              <dt>{t.factDelivery}</dt>
              <dd>
                {t.deliveryLine} <Link href={to('/care/shipping')}>{t.shippingLink}</Link>
              </dd>
            </div>
          </dl>
        </section>

        <section className={styles.moreBlock} aria-labelledby="how-heading">
          <h2 id="how-heading" className={styles.moreTitle}>{t.howH}</h2>
          <ol className={styles.howList}>
            <li>{t.howList[0]}</li>
            <li>
              {t.measuringPre}
              <Link href={to('/care/measuring')}>{t.measuringLink}</Link>
              {t.measuringPost}
            </li>
            <li>{t.howList[2]}</li>
          </ol>
          <p className={styles.moreNote}>
            <Link href={to('/made-to-measure')}>{t.howLink}</Link>
          </p>
        </section>

        <section className={styles.moreBlock} aria-labelledby="questions-heading">
          <h2 id="questions-heading" className={styles.moreTitle}>
            {t.questionsH(t.category[type])}
          </h2>
          {questions.map(({ q, a }) => (
            <div key={q} className={styles.qa}>
              <h3 className={styles.q}>{q}</h3>
              <p className={styles.a}>{a}</p>
            </div>
          ))}
          <p className={styles.moreNote}>
            {t.moreQuestions} <Link href={to('/care/questions')}>{t.allQuestions}</Link>
          </p>
        </section>

        {related.length > 0 && (
          <section className={styles.moreBlock} aria-labelledby="related-heading">
            <h2 id="related-heading" className={styles.moreTitle}>{t.alsoIn(clothWord)}</h2>
            <ul className={styles.relatedList}>
              {related.map((p) => (
                <li key={p.id}>
                  <Link href={piecePathIn(lang, p)}>{pieceName(p.name, lang)}</Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
