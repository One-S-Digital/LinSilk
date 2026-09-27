import Image from 'next/image';
import Link from 'next/link';
import { pastCollections } from '@/lib/catalog';
import styles from './site-footer.module.css';

const shopLinks = async () => [
  { href: '/collection', label: 'Collection' },
  { href: '/design', label: 'Design Your Own' },
  ...((await pastCollections()).length > 0
    ? [{ href: '/archive', label: 'Past Collections' }]
    : []),
];

const CARE = [
  { href: '/care/shipping', label: 'Shipping' },
  { href: '/care/measuring', label: 'Measurement guide' },
  { href: '/care/returns', label: 'Returns and alterations' },
  { href: '/care/questions', label: 'Questions' },
];

const HOUSE = [
  { href: '/contact', label: 'About' },
  { href: '/atelier', label: 'The Atelier' },
  { href: '/cloth', label: 'The Cloth' },
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
              alt="LinSilk"
              width={160}
              height={159}
            />
            <p className={styles.blurb}>
              Made to measure in pure natural fibre. Four small collections a year,
              each made once.
            </p>
            <p className={styles.where}>
              Atelier — Hội An, Việt Nam · Office — Zürich
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
            <a href="mailto:hello@linsilk.ch" className={styles.link}>
              hello@linsilk.ch
            </a>
          </div>
        </div>

        <div className={styles.legal}>
          <span>© {new Date().getFullYear()} LinSilk</span>
          <span>Prices in CHF</span>
          <Link href="/legal/terms" className={styles.link}>
            Terms
          </Link>
          <Link href="/legal/privacy" className={styles.link}>
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
}
