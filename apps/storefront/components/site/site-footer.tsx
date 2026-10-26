import Image from 'next/image';
import Link from 'next/link';
import { pastCollections } from '@/lib/catalog';
import { CurrencyPicker } from './currency-picker';
import styles from './site-footer.module.css';

const shopLinks = async () => [
  { href: '/collection', label: 'Collection' },
  { href: '/collection/women/silk', label: 'Silk dresses and gowns' },
  { href: '/collection/sleepwear', label: 'Silk sleepwear' },
  { href: '/collection/men/shirts', label: 'Linen shirts' },
  { href: '/made-to-measure', label: 'Made to measure' },
  { href: '/design', label: 'Design Your Own' },
  ...((await pastCollections()).length > 0
    ? [{ href: '/archive', label: 'Past Collections' }]
    : []),
];

const CARE = [
  { href: '/care/shipping', label: 'Shipping' },
  { href: '/care/measuring', label: 'Measurement guide' },
  { href: '/care/returns', label: 'Returns' },
  { href: '/care/questions', label: 'Questions' },
];

const HOUSE = [
  { href: '/about', label: 'About' },
  { href: '/cloth', label: 'The Cloth' },
  { href: '/contact', label: 'Contact' },
];

export async function SiteFooter() {
  const shop = await shopLinks();

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
            <p className={styles.blurb}>
              Made-to-measure silk and linen, from Geneva. Cut and sewn to your
              measurements in 2–4 weeks. Four small collections a year.
            </p>
            <p className={styles.where}>
              Geneva, Switzerland
            </p>
          </div>

          <nav className={styles.column} aria-label="Shop">
            <div className={styles.columnHead}>Shop</div>
            {shop.map((l) => (
              <Link key={l.href} href={l.href} className={styles.link}>
                {l.label}
              </Link>
            ))}
          </nav>

          <nav className={styles.column} aria-label="Client care">
            <div className={styles.columnHead}>Client care</div>
            {CARE.map((l) => (
              <Link key={l.href} href={l.href} className={styles.link}>
                {l.label}
              </Link>
            ))}
          </nav>

          <nav className={styles.column} aria-label="The house">
            <div className={styles.columnHead}>The house</div>
            {HOUSE.map((l) => (
              <Link key={l.href} href={l.href} className={styles.link}>
                {l.label}
              </Link>
            ))}
          </nav>

          <div className={styles.column}>
            <div className={styles.columnHead}>Connect</div>
            <a
              href="https://instagram.com/linsilk"
              className={styles.link}
              rel="me noreferrer"
              target="_blank"
            >
              Instagram
            </a>
            <Link href="/season-letter" className={styles.link}>
              Season letter
            </Link>
            <a href="mailto:hello@bylinsilk.com" className={styles.link}>
              hello@bylinsilk.com
            </a>
          </div>
        </div>

        <div className={styles.legal}>
          <span>© {new Date().getFullYear()} LINSILK</span>
          <span>Prices in CHF</span>
          <CurrencyPicker />
          <Link href="/legal/terms" className={styles.link}>
            Terms
          </Link>
          <Link href="/legal/privacy" className={styles.link}>
            Privacy
          </Link>
          <span className={styles.credit}>
            Powered by:{' '}
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
