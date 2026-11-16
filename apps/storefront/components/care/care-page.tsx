import { JsonLd } from '@/components/json-ld';
import type { Lang } from '@/lib/i18n';
import { careCopy, type ClothKey } from '@/lib/care-guide';
import { LANG } from '@/lib/i18n';
import { SITE_URL } from '@/lib/sitemap-paths';
import { translatedPath } from '@/lib/locale-routes';
import { CareGuide } from './care-guide';

/* The care guide in any language: the page, plus the HowTo data for search. */
export function CarePage({ lang }: { lang: Lang }) {
  const { CARE, PAGE } = careCopy(lang);
  const path = lang === 'en' ? '/care' : translatedPath(lang, '/care')!;
  const howTo = (k: ClothKey) => ({
    '@type': 'HowTo',
    name: PAGE.howTo(CARE[k].forCloth),
    step: CARE[k].wash.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.title,
      text: s.body,
    })),
  });

  return (
    <div lang={lang === 'en' ? undefined : LANG[lang]}>
      <CareGuide lang={lang} />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'WebPage',
              '@id': `${SITE_URL}${path}`,
              url: `${SITE_URL}${path}`,
              name: PAGE.metaTitle,
              description: PAGE.description,
              inLanguage: lang === 'en' ? 'en' : LANG[lang],
            },
            howTo('silk'),
            howTo('linen'),
            howTo('cashmere'),
          ],
        }}
      />
    </div>
  );
}
