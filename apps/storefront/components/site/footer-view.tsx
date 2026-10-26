'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CHROME, LANGUAGE_NAMES } from '@/lib/chrome-i18n';
import { LOCALES, type Lang } from '@/lib/i18n';
import { localHref, switchPath } from '@/lib/locale-routes';
import { useLang } from '@/lib/use-lang';
import { CurrencyPicker } from './currency-picker';
import styles from './site-footer.module.css';

const SHOP = [
  '/collection',
  '/collection/women/silk',
  '/collection/sleepwear',
  '/collection/men/shirts',
  '/made-to-measure',
  '/design',
];
const CARE = ['/care/shipping', '/care/measuring', '/care/returns', '/care/questions'];
const HOUSE = ['/about', '/cloth', '/contact'];

const LANGS: Lang[] = ['en', ...LOCALES];

export function FooterView({ hasArchive }: { hasArchive: boolean }) {
  const lang = useLang();
  const pathname = usePathname();
  const t = CHROME[lang];
  const label = (href: string) => t.links[href] ?? t.nav[href];
  const link = (href: string) => (
    <Link key={href} href={localHref(lang, href)} className={styles.link}>
      {label(href)}
    </Link>
  );

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.columns}>
          <div>
            <Image
              className={styles.brand}
              src="/brand/lockup-gold.png"
              alt="LINSILK"
              width={160}
              height={159}
            />
            <p className={styles.blurb}>{t.blurb}</p>
            <p className={styles.where}>{t.where}</p>
          </div>

          <nav className={styles.column} aria-label={t.shop}>
            <div className={styles.columnHead}>{t.shop}</div>
            {SHOP.map(link)}
            {hasArchive && link('/archive')}
          </nav>

          <nav className={styles.column} aria-label={t.care}>
            <div className={styles.columnHead}>{t.care}</div>
            {CARE.map(link)}
          </nav>

          <nav className={styles.column} aria-label={t.house}>
            <div className={styles.columnHead}>{t.house}</div>
            {HOUSE.map(link)}
          </nav>

          <div className={styles.column}>
            <div className={styles.columnHead}>{t.connect}</div>
            <a
              href="https://instagram.com/linsilk"
              className={styles.link}
              rel="me noreferrer"
              target="_blank"
            >
              Instagram
            </a>
            <Link href="/season-letter" className={styles.link}>
              {t.links['/season-letter']}
            </Link>
            <a href="mailto:hello@bylinsilk.com" className={styles.link}>
              hello@bylinsilk.com
            </a>
          </div>
        </div>

        <nav className={styles.legal} aria-label={t.language}>
          <span>{t.language}:</span>
          {LANGS.map((l) =>
            l === lang ? (
              <span key={l} aria-current="true">
                {LANGUAGE_NAMES[l]}
              </span>
            ) : (
              <Link
                key={l}
                href={switchPath(pathname, lang, l)}
                className={styles.link}
                hrefLang={l === 'en' ? 'en' : l}
                lang={l === 'en' ? 'en' : l.slice(0, 2)}
              >
                {LANGUAGE_NAMES[l]}
              </Link>
            ),
          )}
        </nav>

        <div className={styles.legal} style={{ marginTop: 16 }}>
          <span>© {new Date().getFullYear()} LINSILK</span>
          <span>{t.prices}</span>
          <CurrencyPicker />
          <Link href="/legal/terms" className={styles.link}>
            {t.links['/legal/terms']}
          </Link>
          <Link href="/legal/privacy" className={styles.link}>
            {t.links['/legal/privacy']}
          </Link>
          <span className={styles.credit}>
            {t.credit}{' '}
            <a
              href="https://onesdigital.online"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.creditLink}
            >
              One S Digital
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
