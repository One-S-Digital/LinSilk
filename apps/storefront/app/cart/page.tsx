'use client';

import { ShotFrame } from '@/components/shot';
import { ButtonLink } from '@/components/ui/button';
import { Approx, ApproxNote } from '@/lib/currency';
import { useCart } from '@/lib/cart';
import { formatMoney } from '@/lib/medusa';
import { fabricLabel } from '@/lib/i18n-order';
import { localHref } from '@/lib/locale-routes';
import { formatValue } from '@/lib/measurements';
import { materialIn, shopText } from '@/lib/i18n-shop';
import { pieceName } from '@/lib/piece-names';
import { useLang } from '@/lib/use-lang';
import styles from './cart.module.css';

export default function CartPage() {
  const { lines, ready, remove, subtotal, currency } = useCart();
  const lang = useLang();
  const t = shopText(lang).cart;
  /* The cart's own currency, not the catalogue's CHF: checkout can move this
     cart to another region, and a client coming back here afterwards must
     see the figures it is actually holding the pieces at. */
  const money = (amount: number) => formatMoney(amount, currency);

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{t.title}</h1>
      <p className={styles.lede}>
        {t.lede}
      </p>

      {/* Held until the stored cart is read, so the page never flashes an empty
          state at someone who has three pieces ordered. */}
      {!ready ? null : lines.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyText}>{t.empty}</p>
          <div className={styles.emptyActions}>
            <ButtonLink href={localHref(lang, '/collection')} variant="outline">
              {t.enter}
            </ButtonLink>
            <ButtonLink href={localHref(lang, '/design')} variant="solid">
              {t.design}
            </ButtonLink>
          </div>
        </div>
      ) : (
        <>
          <div className={styles.lines}>
            {lines.map((line) => {
              const taken = Object.keys(line.measurements).length;
              return (
                <article key={line.id} className={styles.line}>
                  <ShotFrame
                    src={line.thumbnail}
                    alt={pieceName(line.name, lang)}
                    note={line.thumbnail ? undefined : line.shot}
                    weave={line.group === 'men' ? 'sand' : 'bone'}
                    ratio="3 / 4"
                  />

                  <div>
                    <h2 className={styles.lineName}>{pieceName(line.name, lang)}</h2>
                    <p className={styles.lineMaterial}>{materialIn(line.material, lang)}</p>

                    <div className={styles.brief}>
                      <div className={styles.briefRow}>
                        <span className={styles.briefKey}>{t.cloth}</span>
                        <span>{fabricLabel(line.fabricKey, line.fabricName, lang)}</span>
                      </div>
                      <div className={styles.briefRow}>
                        <span className={styles.briefKey}>{t.sheet}</span>
                        <span>
                          {t.taken(taken, line.zoneCount)}
                          {/* A trouser or a skirt is not asked for a chest. */}
                          {typeof line.measurements.bust === 'number' && (
                            <>
                              {' · '}{t.chest} {formatValue(line.measurements.bust, line.unit)} {line.unit}
                            </>
                          )}
                        </span>
                      </div>
                    </div>

                  </div>

                  <div className={styles.lineAside}>
                    <span className={styles.linePrice}>{money(line.price)}</span>
                    <Approx chf={line.price} currency={currency} className={styles.approx} />
                    <button
                      type="button"
                      className={styles.remove}
                      onClick={() => remove(line.id)}
                    >
                      {t.remove}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          <div className={styles.summary}>
            <p className={styles.terms}>
              {t.terms}
            </p>

            <div className={styles.totals}>
              <div className={styles.totalRow}>
                <span>
                  {lines.length} {lines.length === 1 ? t.piece : t.pieces}
                </span>
                <span className={styles.totalValue}>{money(subtotal)}</span>
              </div>
              <div className={styles.totalRow}>
                <span>{t.shipping}</span>
                <span className={styles.totalValue}>{t.atCheckout}</span>
              </div>
              <div className={`${styles.totalRow} ${styles.grand}`}>
                <span>{t.total}</span>
                <span className={styles.totalValue}>{money(subtotal)}</span>
              </div>
              <Approx chf={subtotal} currency={currency} className={styles.approxTotal} />
              <ApproxNote className={styles.approxNote} />

              <div className={styles.checkout}>
                <ButtonLink href="/checkout" block>
                  {t.toCheckout}
                </ButtonLink>
              </div>

              <p className={styles.estimateNotice}>
                {t.estimate}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
