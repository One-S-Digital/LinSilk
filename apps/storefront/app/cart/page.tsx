'use client';

import { ShotFrame } from '@/components/shot';
import { ButtonLink } from '@/components/ui/button';
import { useCart } from '@/lib/cart';
import { formatMoney } from '@/lib/medusa';
import { formatValue } from '@/lib/measurements';
import styles from './cart.module.css';

export default function CartPage() {
  const { lines, ready, remove, subtotal, currency } = useCart();
  /* The cart's own currency, not the catalogue's CHF: checkout can move this
     cart to another region, and a client coming back here afterwards must
     see the figures it is actually holding the pieces at. */
  const money = (amount: number) => formatMoney(amount, currency);

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Your order</h1>
      <p className={styles.lede}>
        Nothing is cut until the atelier has read your sheet and written back. An
        order holds the design against the season’s capped run in the meantime.
      </p>

      {/* Held until the stored cart is read, so the page never flashes an empty
          state at someone who has three pieces ordered. */}
      {!ready ? null : lines.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyText}>Nothing ordered yet.</p>
          <div className={styles.emptyActions}>
            <ButtonLink href="/collection" variant="outline">
              Enter the collection
            </ButtonLink>
            <ButtonLink href="/design" variant="solid">
              Design an outfit
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
                    alt={line.name}
                    note={line.thumbnail ? undefined : line.shot}
                    weave={line.group === 'men' ? 'sand' : 'bone'}
                    ratio="3 / 4"
                  />

                  <div>
                    <h2 className={styles.lineName}>{line.name}</h2>
                    <p className={styles.lineMaterial}>{line.material}</p>

                    <div className={styles.brief}>
                      <div className={styles.briefRow}>
                        <span className={styles.briefKey}>Cloth</span>
                        <span>{line.fabricName}</span>
                      </div>
                      <div className={styles.briefRow}>
                        <span className={styles.briefKey}>Sheet</span>
                        <span>
                          {taken} of {line.zoneCount} taken
                          {taken > 0 && (
                            <>
                              {' · '}
                              chest{' '}
                              {typeof line.measurements.bust === 'number'
                                ? `${formatValue(line.measurements.bust, line.unit)} ${line.unit}`
                                : '—'}
                            </>
                          )}
                        </span>
                      </div>
                    </div>

                  </div>

                  <div className={styles.lineAside}>
                    <span className={styles.linePrice}>{money(line.price)}</span>
                    <button
                      type="button"
                      className={styles.remove}
                      onClick={() => remove(line.id)}
                    >
                      Remove
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          <div className={styles.summary}>
            <p className={styles.terms}>
              Prices are in Swiss francs and include duty within Switzerland and the
              EU. A piece takes two to four weeks from the confirmed sheet.
            </p>

            <div className={styles.totals}>
              <div className={styles.totalRow}>
                <span>
                  {lines.length} {lines.length === 1 ? 'piece' : 'pieces'}
                </span>
                <span className={styles.totalValue}>{money(subtotal)}</span>
              </div>
              <div className={styles.totalRow}>
                <span>Shipping</span>
                <span className={styles.totalValue}>Calculated at checkout</span>
              </div>
              <div className={`${styles.totalRow} ${styles.grand}`}>
                <span>Total</span>
                <span className={styles.totalValue}>{money(subtotal)}</span>
              </div>

              <div className={styles.checkout}>
                <ButtonLink href="/checkout" block>
                  Continue to checkout
                </ButtonLink>
              </div>

              <p className={styles.estimateNotice}>
                Every figure here is the price of the piece. A commission is quoted
                separately: a tailor reads the brief and writes to you with its price.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
