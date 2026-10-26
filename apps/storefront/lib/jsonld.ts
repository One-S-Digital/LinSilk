/* Structured data (schema.org JSON-LD), built from the same facts the pages
 * print (lib/house.ts) so the two never disagree. Rendered by
 * components/json-ld.tsx. docs/seo/COPY-PAGES.md §8 is the reference. */

import type { Piece } from './catalog';
import { CATEGORY, garmentType, type QA } from './garments';
import { absolute, EMAIL, ENTITY, HANDLING_DAYS, SAME_AS, SHIPPING, SITE_URL } from './house';

const ORG_ID = `${SITE_URL}/#organization`;

export const organizationLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': ORG_ID,
  name: 'LINSILK',
  url: SITE_URL,
  logo: absolute('/brand/lockup-gold.png'),
  description: ENTITY,
  email: EMAIL,
  address: { '@type': 'PostalAddress', addressLocality: 'Geneva', addressCountry: 'CH' },
  sameAs: SAME_AS,
});

export const websiteLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'LINSILK',
  url: SITE_URL,
  inLanguage: 'en',
  publisher: { '@id': ORG_ID },
});

/** Images may be relative (local placeholders) or absolute (the file host). */
const imageUrl = (src: string) => (src.startsWith('http') ? src : absolute(src));

export function productLd(piece: Piece) {
  const url = absolute(`/piece/${piece.slug}`);
  const cloth = piece.cloth === 'linen' ? 'linen' : 'silk';
  const type = garmentType(piece);
  const days = (min: number, max: number) => ({
    '@type': 'QuantitativeValue',
    minValue: min,
    maxValue: max,
    unitCode: 'DAY',
  });

  /* A zone is published only once the house has given its rate: Google reads
     a shipping block without a rate as an error, and a guessed rate is worse. */
  const shippingDetails = SHIPPING.filter((z) => z.rate !== null).map((z) => ({
    '@type': 'OfferShippingDetails',
    shippingDestination: { '@type': 'DefinedRegion', addressCountry: z.countries },
    shippingRate: { '@type': 'MonetaryAmount', value: String(z.rate), currency: 'CHF' },
    deliveryTime: {
      '@type': 'ShippingDeliveryTime',
      handlingTime: days(HANDLING_DAYS.min, HANDLING_DAYS.max),
      transitTime: days(z.transit.min, z.transit.max),
    },
  }));

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${url}#product`,
    name: piece.name,
    description: `${piece.name}, made to measure in 100% ${cloth}: cut and sewn to your own measurements in 2–4 weeks, then dispatched from Geneva.`,
    ...(piece.images.length ? { image: piece.images.map(imageUrl) } : {}),
    sku: piece.id,
    mpn: piece.id,
    brand: { '@type': 'Brand', name: 'LINSILK' },
    material: cloth === 'linen' ? 'Linen' : 'Silk',
    category: `${piece.group === 'men' ? 'Men' : 'Women'} > ${CATEGORY[type].label}`,
    /* A piece from a closed season, or one being phased out, is a record:
       it keeps its Product but offers nothing. */
    ...(piece.orderable && !piece.retired && piece.price > 0
      ? {
          offers: {
            '@type': 'Offer',
            url,
            price: String(piece.price),
            priceCurrency: 'CHF',
            availability: 'https://schema.org/MadeToOrder',
            itemCondition: 'https://schema.org/NewCondition',
            seller: { '@id': ORG_ID },
            ...(shippingDetails.length ? { shippingDetails } : {}),
          },
        }
      : {}),
  };
}

export const breadcrumbLd = (items: { name: string; path: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: item.name,
    item: absolute(item.path),
  })),
});

/** Only on pages that own their questions (plan §6.6), and word for word
    what the page shows. */
export const faqLd = (qas: QA[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: qas.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
});
