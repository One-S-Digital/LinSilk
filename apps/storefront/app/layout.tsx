import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { SiteHeader } from '@/components/site/site-header';
import { SiteFooter } from '@/components/site/site-footer';
import { LocaleChrome, SkipLink } from '@/components/site/locale-chrome';
import { SmoothScroll } from '@/components/smooth-scroll';
import { JsonLd } from '@/components/json-ld';
import { organizationLd } from '@/lib/jsonld';
import { CartProvider } from '@/lib/cart';
import { CurrencyProvider } from '@/lib/currency';
import { pastCollections } from '@/lib/catalog';
import './globals.css';

/* The house sets three faces and no more: Archivo for running text and
   interface, Newsreader for every display line, Caveat only ever for the
   tailor's chalk annotations. */

/* Self-hosted (Google's latin variable files in ./fonts) so the build never
   has to reach Google Fonts; a bad answer from Google failed a deploy. */

const archivo = localFont({
  src: './fonts/archivo-latin.woff2',
  weight: '300 500',
  variable: '--font-archivo',
  display: 'swap',
});

const newsreader = localFont({
  src: [
    { path: './fonts/newsreader-latin.woff2', weight: '200 400', style: 'normal' },
    { path: './fonts/newsreader-italic-latin.woff2', weight: '200 400', style: 'italic' },
  ],
  variable: '--font-newsreader',
  display: 'swap',
  adjustFontFallback: 'Times New Roman',
});

const caveat = localFont({
  src: './fonts/caveat-latin.woff2',
  weight: '500',
  variable: '--font-caveat',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://bylinsilk.com'),
  title: {
    default: 'LINSILK | Made-to-measure silk, linen and high frequency fabrics, Geneva',
    template: '%s | LINSILK',
  },
  description:
    'Made-to-measure clothing in silk, linen and high frequency fabrics from Geneva, Switzerland.',
  openGraph: {
    type: 'website',
    siteName: 'LINSILK',
    locale: 'en_CH',
    images: ['/brand/social-card.png'],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/brand/social-card.png'],
  },
};

/* Built here, on the server, from whatever collections actually exist. */
async function buildNav() {
  return [
    { href: '/collection', label: 'Collection' },
    { href: '/made-to-measure', label: 'Made to Measure' },
    { href: '/design', label: 'Design Your Own' },
    { href: '/cloth', label: 'The Cloth' },
    ...((await pastCollections()).length > 0
      ? [{ href: '/archive', label: 'Past Collections' }]
      : []),
    { href: '/contact', label: 'Contact' },
  ];
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const nav = await buildNav();

  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${archivo.variable} ${newsreader.variable} ${caveat.variable}`}
    >
      <head>
        {/* Umami Cloud, cookieless (SEO-GEO-PLAN §6.10). */}
        <script
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id="b072ba84-e4d3-4c20-b747-326fbdf3f3ba"
        />
        {/* Motion primitives render their resting state server-side as
            opacity:0. If the script never arrives, this restores them rather
            than leaving the page blank. */}
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important;clip-path:none!important;filter:none!important}`}</style>
        </noscript>
      </head>
      <body>
        <JsonLd data={organizationLd()} />
        <CartProvider>
         <CurrencyProvider>
          <SmoothScroll>
            <SkipLink />
            <SiteHeader nav={nav} />
            <main id="main">{children}</main>
            <SiteFooter />
            <LocaleChrome />
          </SmoothScroll>
         </CurrencyProvider>
        </CartProvider>
      </body>
    </html>
  );
}
