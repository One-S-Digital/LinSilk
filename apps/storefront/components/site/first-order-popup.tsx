'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useId, useRef } from 'react';
import { Photo } from '@/components/photo';
import { offerText } from '@/lib/i18n-offer';
import { isSharedRoute } from '@/lib/lang-pref';
import { localHref } from '@/lib/locale-routes';
import { useLang } from '@/lib/use-lang';
import styles from './first-order-popup.module.css';

const SEEN = 'linsilk-first-order-offer';

/* The first-order offer, once per visit: a native modal <dialog>, opened a
   moment after the first page and not again however many pages are read or
   however often the home page is returned to. Not shown where a client is
   already buying or signed in to an account. Storage that is blocked only
   means it may show again on the next page, which is harmless. */
export function FirstOrderPopup() {
  const lang = useLang();
  const pathname = usePathname();
  const t = offerText(lang);
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const quiet = isSharedRoute(pathname);

  useEffect(() => {
    if (quiet) return;
    let seen = false;
    try {
      seen = Boolean(sessionStorage.getItem(SEEN));
    } catch {
      /* unreadable: treated as not seen */
    }
    if (seen) return;
    const timer = window.setTimeout(() => {
      const el = dialog.current;
      if (!el || el.open) return;
      try {
        sessionStorage.setItem(SEEN, '1');
      } catch {
        /* nothing to remember it in */
      }
      el.showModal();
    }, 2500);
    return () => window.clearTimeout(timer);
  }, [quiet]);

  const close = () => dialog.current?.close();

  return (
    <dialog
      ref={dialog}
      className={styles.dialog}
      aria-labelledby={titleId}
      data-lenis-prevent
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className={styles.panel}>
        <div className={styles.photo}>
          <Photo src="/images/door-women.webp" alt="" fill sizes="(max-width: 720px) 100vw, 340px" />
        </div>
        <div className={styles.body}>
          <button type="button" className={styles.close} onClick={close} aria-label={t.close}>
            ×
          </button>
          <div className={styles.eyebrow}>{t.eyebrow}</div>
          <h2 id={titleId} className={styles.title}>
            {t.title}
          </h2>
          <p className={styles.lead}>{t.lead}</p>
          <Link href={localHref(lang, '/collection')} className={styles.cta} onClick={close}>
            {t.cta}
          </Link>
          <p className={styles.terms}>{t.terms}</p>
        </div>
      </div>
    </dialog>
  );
}
