import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { HomeView } from '@/components/pages/home-view';
import { getPieces } from '@/lib/catalog';
import { homeCopy } from '@/lib/home-i18n';
import { COLOURS, priceRange } from '@/lib/house';
import { isLocale, LOCALES } from '@/lib/i18n';
import { fromIn } from '@/lib/edits-i18n';
import { localeMetadata } from '@/lib/locale-meta';

/* The home page in a language: /de-ch, /fr-ch, /de, /fr. */

export const dynamicParams = false;
export const generateStaticParams = () => LOCALES.map((locale) => ({ locale }));

export async function generateMetadata(props: PageProps<'/[locale]'>): Promise<Metadata> {
  const { locale } = await props.params;
  if (!isLocale(locale)) return {};
  const c = homeCopy(locale);
  const range = priceRange(await getPieces());
  const colours = locale.startsWith('de')
    ? `${COLOURS.silk} Seidenfarben und ${COLOURS.linen} Leinenfarben`
    : `${COLOURS.silk} coloris de soie et ${COLOURS.linen} coloris de lin`;
  return localeMetadata(locale, '/', c.title, c.description(colours, fromIn(range?.from, locale)), true);
}

export default async function LocaleHome(props: PageProps<'/[locale]'>) {
  const { locale } = await props.params;
  if (!isLocale(locale)) notFound();
  return <HomeView lang={locale} />;
}
