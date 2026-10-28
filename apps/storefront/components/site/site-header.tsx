'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { EASE } from '@/components/motion';
import { useCart } from '@/lib/cart';
import { CHROME } from '@/lib/chrome-i18n';
import { localHref } from '@/lib/locale-routes';
import { useLang } from '@/lib/use-lang';
import { LanguageMenu } from './language-menu';
import styles from './site-header.module.css';

export type NavItem = { href: string; label: string };

/* The nav is passed in rather than hardcoded: once the catalogue comes from
   Medusa, a house with no archived seasons should not advertise an archive. */
export function SiteHeader({ nav }: { nav: NavItem[] }) {
  const pathname = usePathname();
  const lang = useLang();
  const t = CHROME[lang];
  const label = (item: NavItem) => t.nav[item.href] ?? item.label;
  const [open, setOpen] = useState(false);
  const still = useReducedMotion();
  const { count, ready } = useCart();
  // Render nothing until the stored cart is read, so the server markup and the
  // first client paint agree.
  const cartCount = ready ? ` (${count})` : '';

  // Close the panel on navigation.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  // Trap the page behind the panel and allow Escape to dismiss it.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const isCurrent = (href: string) => {
    const here = localHref(lang, href);
    return pathname === here || (here !== `/${lang}` && pathname.startsWith(`${here}/`));
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.inner}>
          <Link href={localHref(lang, '/')} className={styles.wordmark} aria-label={t.home}>
            <Image src="/brand/logo-horizontal-black.png" alt="LINSILK Genève" width={142} height={32} priority />
          </Link>

          <nav className={styles.nav} aria-label={t.primary}>
            {nav.map((item) => (
              <Link
                key={item.href}
                href={localHref(lang, item.href)}
                className={styles.navLink}
                data-current={isCurrent(item.href)}
              >
                {label(item)}
              </Link>
            ))}
          </nav>

          <div className={styles.utility}>
            <button
              type="button"
              className={styles.menuButton}
              onClick={() => setOpen(true)}
              aria-expanded={open}
              aria-controls="nav-panel"
            >
              <span className={styles.burger} aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
              {t.menu}
            </button>
            <LanguageMenu />
            <Link href="/account" className={`${styles.navLink} ${styles.accountLink}`}>
              {t.account}
            </Link>
            <Link href="/cart" className={styles.navLink}>
              {t.cart} <span className={styles.count}>{cartCount}</span>
            </Link>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="nav-panel"
            className={styles.panel}
            initial={still ? false : { opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={still ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            <div className={styles.panelTop}>
              <Link href={localHref(lang, '/')} className={styles.wordmark} aria-label={t.home}>
                <Image
                  className={styles.panelLogo}
                  src="/brand/logo-horizontal-black.png"
                  alt="LINSILK Genève"
                  width={142}
                  height={32}
                />
              </Link>
              <button type="button" className={styles.closeButton} onClick={() => setOpen(false)}>
                {t.close}
                <span className={styles.cross} aria-hidden="true" />
              </button>
            </div>

            <p className={styles.panelLabel}>{t.menu}</p>
            <nav className={styles.panelNav} aria-label={t.primary}>
              {nav.map((item, i) => (
                <motion.span
                  key={item.href}
                  initial={still ? false : { opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.06 + i * 0.045, ease: EASE }}
                >
                  <Link href={localHref(lang, item.href)} className={styles.panelLink}>
                    <span className={styles.panelNum} aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                    <span>{label(item)}</span>
                    <span className={styles.panelArrow} aria-hidden="true">→</span>
                  </Link>
                </motion.span>
              ))}
            </nav>

            <div className={styles.panelFoot}>
              <Link href="/account">{t.account}</Link>
              <Link href="/cart">{t.cart}{cartCount}</Link>
              <span>{t.where}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
