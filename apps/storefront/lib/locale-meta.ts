import type { Metadata } from 'next';
import { OG_LOCALE, type Locale } from './i18n';
import { languagesFor, translatedPath } from './locale-routes';

/** Title, description, own canonical, all alternates and the Open Graph
    locale for a translated page. `absolute` keeps the title without the
    " | LINSILK" suffix (the home page). */
export function localeMetadata(
  locale: Locale,
  enPath: string,
  title: string,
  description: string,
  absolute = false,
): Metadata {
  return {
    title: absolute ? { absolute: title } : title,
    description,
    alternates: { canonical: translatedPath(locale, enPath), languages: languagesFor(enPath) },
    openGraph: { locale: OG_LOCALE[locale] },
  };
}
