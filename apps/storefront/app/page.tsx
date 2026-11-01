import type { Metadata } from 'next';
import { HomeView } from '@/components/pages/home-view';
import { getPieces, money } from '@/lib/catalog';
import { COLOURS, priceRange } from '@/lib/house';
import { languagesFor } from '@/lib/locale-routes';

export async function generateMetadata(): Promise<Metadata> {
  const range = priceRange(await getPieces());
  return {
    title: { absolute: 'LINSILK | Made-to-measure silk, linen and high frequency fabrics, Geneva' },
    description:
      `LINSILK makes clothing in silk, linen and high frequency fabrics to your own measurements in 2–4 weeks. ` +
      `${COLOURS.silk} silk, ${COLOURS.linen} linen and ${COLOURS.cashmere} cashmere colours${range ? `, from ${money(range.from)}` : ''}. No fittings needed. From Geneva.`,
    alternates: { canonical: '/', languages: languagesFor('/') },
  };
}

export default function HomePage() {
  return <HomeView lang="en" />;
}
