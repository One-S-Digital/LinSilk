import type { Metadata } from 'next';
import { Archivo, Newsreader, Caveat } from 'next/font/google';
import { SiteHeader } from '@/components/site/site-header';
import { SiteFooter } from '@/components/site/site-footer';
import { SmoothScroll } from '@/components/smooth-scroll';
import { CartProvider } from '@/lib/cart';
import { pastCollections } from '@/lib/catalog';
import './globals.css';

/* The house sets three faces and no more: Archivo for running text and
   interface, Newsreader for every display line, Caveat only ever for the
   tailor's chalk annotations. */

const archivo = Archivo({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-archivo',
  display: 'swap',
});

const newsreader = Newsreader({
  subsets: ['latin'],
  weight: ['200', '300', '400'],
  style: ['normal', 'italic'],
  variable: '--font-newsreader',
  display: 'swap',
});

const caveat = Caveat({
  subsets: ['latin'],
  weight: ['500'],
  variable: '--font-caveat',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://linsilk.ch'),
  title: {
    default: 'LinSilk — made to measure in pure natural fibre',
    template: '%s — LinSilk',
  },
  description:
    'Silk and linen garments cut to your measurements in a single atelier in Hội An. Four small collections a year, each made once and never restocked.',
  openGraph: {
    type: 'website',
    siteName: 'LinSilk',
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
    { href: '/design', label: 'Design Your Own' },
    { href: '/atelier', label: 'The Atelier' },
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
        {/* Motion primitives render their resting state server-side as
            opacity:0. If the script never arrives, this restores them rather
            than leaving the page blank. */}
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important;clip-path:none!important;filter:none!important}`}</style>
        </noscript>
      </head>
      <body>
        <CartProvider>
          <SmoothScroll>
            <a href="#main" className="sr-only">
              Skip to content
            </a>
            <SiteHeader nav={nav} />
            <main id="main">{children}</main>
            <SiteFooter />
          </SmoothScroll>
        </CartProvider>
      </body>
    </html>
  );
}
