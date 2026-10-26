/* The product feed for Google Merchant Center (and Microsoft Merchant Center,
 * which imports it): one item per design, built from the same pieces, prices
 * and facts as the pages and the Product schema, so the three never disagree
 * (docs/seo/SEO-GEO-PLAN.md §8).
 *
 * Left out on purpose until the house settles them in a Merchant Center test
 * feed: `color` and `size` (sold by swatch and by measurement, plan §8.2),
 * and shipping and returns, which are set in the Merchant Center account. */

import type { Piece } from './catalog';
import { CATEGORY, garmentType } from './garments';
import { COLOURS, HANDLING_DAYS, SITE_URL } from './house';

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const tag = (name: string, value: string | number) => `<${name}>${esc(String(value))}</${name}>`;

/** Orderable now, priced, photographed, not being phased out. */
export const inFeed = (p: Piece) =>
  p.orderable && !p.retired && p.price > 0 && p.images.length > 0 && p.cloth !== null;

export function feedItem(p: Piece) {
  const cloth = p.cloth === 'linen' ? 'linen' : 'silk';
  const type = garmentType(p);
  const group = p.group === 'men' ? 'Men' : 'Women';
  const colours = cloth === 'linen' ? `${COLOURS.linen} linen colours` : `${COLOURS.silk} silk colours`;
  const link = `${SITE_URL}/piece/${p.slug}?utm_source=google&utm_medium=feed`;

  return [
    '<item>',
    tag('g:id', p.id),
    tag('g:title', `${p.name}, made to measure`),
    tag(
      'g:description',
      `${p.name}, made to measure in 100% ${cloth}: cut and sewn to your own measurements in 2–4 weeks from your confirmed measurement sheet, then dispatched from Geneva. Choose from ${colours}. No fittings: measure yourself or use any tailor.`,
    ),
    tag('g:link', link),
    tag('g:image_link', p.images[0]),
    ...p.images.slice(1, 11).map((src) => tag('g:additional_image_link', src)),
    tag('g:price', `${p.price.toFixed(2)} CHF`),
    tag('g:availability', 'in_stock'),
    tag('g:min_handling_time', HANDLING_DAYS.min),
    tag('g:max_handling_time', HANDLING_DAYS.max),
    tag('g:brand', 'LINSILK'),
    tag('g:mpn', p.id),
    tag('g:identifier_exists', 'no'),
    tag('g:condition', 'new'),
    tag('g:google_product_category', CATEGORY[type].google),
    tag('g:product_type', `${group} > ${cloth === 'linen' ? 'Linen' : 'Silk'} > ${CATEGORY[type].label}`),
    tag('g:material', cloth),
    tag('g:gender', p.group === 'men' ? 'male' : 'female'),
    tag('g:age_group', 'adult'),
    tag('g:custom_label_0', cloth),
    tag('g:custom_label_1', type),
    tag('g:custom_label_2', p.collection),
    '</item>',
  ].join('');
}

export function googleFeed(pieces: Piece[]) {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0"><channel>',
    tag('title', 'LINSILK'),
    tag('link', SITE_URL),
    tag('description', 'Made-to-measure silk and linen clothing from Geneva.'),
    ...pieces.filter(inFeed).map(feedItem),
    '</channel></rss>',
  ].join('\n');
}

/* The ChatGPT merchant feed (plan §8.3 step 3), stable spec at
 * developers.openai.com/commerce/specs/feed, read 22 Oct 2026. JSONL: one
 * record per line, UTF-8. Search only: `is_eligible_checkout` stays false until
 * the house is set up for checkout (that also needs seller_tos and
 * seller_privacy_policy). Left out until settled, as in the Google feed:
 * `color`, `size`, `shipping` and the returns fields. The spec describes upload
 * delivery, not a URL pull, so this route is the file to download and upload. */
export function openaiRecord(p: Piece) {
  const cloth = p.cloth === 'linen' ? 'linen' : 'silk';
  const type = garmentType(p);
  const group = p.group === 'men' ? 'Men' : 'Women';
  const colours = cloth === 'linen' ? `${COLOURS.linen} linen colours` : `${COLOURS.silk} silk colours`;

  return {
    item_id: p.id,
    title: `${p.name}, made to measure`,
    description: `${p.name}, made to measure in 100% ${cloth}: cut and sewn to your own measurements in 2–4 weeks from your confirmed measurement sheet, then dispatched from Geneva. Choose from ${colours}. No fittings: measure yourself or use any tailor.`,
    url: `${SITE_URL}/piece/${p.slug}?utm_source=chatgpt.com&utm_medium=feed`,
    brand: 'LINSILK',
    seller_name: 'LINSILK',
    seller_url: SITE_URL,
    image_url: p.images[0],
    additional_image_urls: p.images.slice(1, 11),
    availability: 'in_stock',
    price: `${p.price.toFixed(2)} CHF`,
    mpn: p.id,
    condition: 'new',
    product_category: `${group} > ${CATEGORY[type].label}`,
    material: cloth,
    gender: p.group === 'men' ? 'male' : 'female',
    age_group: 'adult',
    is_eligible_search: true,
    is_eligible_checkout: false,
  };
}

export const openaiFeed = (pieces: Piece[]) =>
  pieces
    .filter(inFeed)
    .map((p) => JSON.stringify(openaiRecord(p)))
    .join('\n') + '\n';
