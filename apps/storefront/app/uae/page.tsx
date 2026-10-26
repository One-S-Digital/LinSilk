import Link from 'next/link';
import type { Metadata } from 'next';
import { DocP, DocPage, DocSection } from '@/components/doc-page';
import { JsonLd } from '@/components/json-ld';
import { ButtonLink } from '@/components/ui/button';
import { getPieces, money } from '@/lib/catalog';
import type { QA } from '@/lib/garments';
import { garmentType } from '@/lib/garments';
import { priceRange } from '@/lib/house';
import { faqLd } from '@/lib/jsonld';

/* The UAE market page (SEO-GEO-PLAN §5, copy in COPY-GUIDES-FAQ §2.2).
   "Tailor made" is the everyday local term, so it leads here. Duty follows
   the live shipping page: outside Switzerland, the EU and the UK, the
   carrier collects duty and import tax on delivery. */

const FAQ: QA[] = [
  {
    q: 'Do you deliver to Dubai and Abu Dhabi?',
    a: 'Yes. LINSILK delivers across the UAE from Geneva, with tracking, in 5–10 days once the piece is dispatched.',
  },
  {
    q: 'Do I pay customs duty?',
    a: 'Yes. For the UAE the carrier collects duty and import tax on delivery, set by UAE customs. The house does not mark parcels as gifts or understate their value.',
  },
  {
    q: 'Can I order a tailor-made dress without a fitting?',
    a: 'Yes. You measure yourself with the measuring guide, or take it to any tailor in Dubai or Abu Dhabi, and the piece is cut and sewn to your fifteen measurements.',
  },
  {
    q: 'Is linen good for the heat in Dubai?',
    a: 'Linen is crisp, airy and cooling; it breathes in the heat and softens with every wear.',
  },
];

export async function generateMetadata(): Promise<Metadata> {
  const range = priceRange(await getPieces());
  return {
    title: 'Tailor made silk dresses and linen, delivered to Dubai',
    description: `Tailor-made silk gowns and linen clothing, made to your measurements in 2–4 weeks and delivered across the UAE from Geneva.${range ? ` From ${money(range.from)}.` : ''} Duty explained.`,
    alternates: { canonical: '/uae' },
  };
}

export default async function UaePage() {
  const pieces = (await getPieces()).filter((p) => p.orderable && !p.retired);
  const silkDresses = priceRange(pieces.filter((p) => ['gown', 'dress'].includes(garmentType(p))));
  const linenShirts = priceRange(pieces.filter((p) => garmentType(p) === 'shirt'));

  return (
    <DocPage
      eyebrow="United Arab Emirates"
      title="Tailor made silk dresses and linen clothing, delivered to Dubai and the UAE"
      lead={`LINSILK, a Geneva house, makes tailor-made silk dresses and linen clothing to your own measurements in 2–4 weeks from your confirmed sheet, and delivers across the UAE in 5–10 days after dispatch.${silkDresses ? ` Silk dresses from ${money(silkDresses.from)}` : ''}${linenShirts ? `, linen shirts from ${money(linenShirts.from)}.` : '.'}`}
      foot={
        <>
          <ButtonLink href="/collection/women/silk" variant="outline">Silk dresses and gowns</ButtonLink>
          <ButtonLink href="/collection/men/shirts" variant="rule">Linen shirts</ButtonLink>
        </>
      }
    >
      <JsonLd data={faqLd(FAQ)} />

      <DocSection title="Made for the season">
        <DocP>
          The UAE season runs from October to April: silk gowns for evenings and
          weddings, and 100% linen for the heat. Every piece is cut and sewn to your
          measurements, so there is no size to choose.
        </DocP>
      </DocSection>

      <DocSection title="Long sleeves and full length">
        <DocP>
          The long-sleeve wrap maxi dress and the floor-length silk gowns are cut with
          long sleeves or to the floor; you set the length yourself when you enter your
          measurements. <Link href="/collection/women/silk">See the silk dresses and gowns</Link>
        </DocP>
      </DocSection>

      <DocSection title="Eid">
        <DocP>
          For Eid al-Fitr, around 10 March 2027, confirm your measurement sheet by about
          1 February: up to four weeks to make, then 5–10 days to arrive.
        </DocP>
      </DocSection>

      <DocSection title="Delivery, duty and prices">
        <DocP>
          Delivery takes 5–10 days once dispatched from Geneva, with tracking. Duty and
          import tax are collected by the carrier on delivery. Prices are charged in Swiss
          francs; the site can show an approximate figure in dirhams (choose AED at the
          foot of any page). <Link href="/care/shipping">Shipping and duty</Link>
        </DocP>
      </DocSection>

      <DocSection title="Questions">
        {FAQ.map(({ q, a }) => (
          <DocP key={q}>
            <strong>{q}</strong>
            <br />
            {a}
          </DocP>
        ))}
      </DocSection>
    </DocPage>
  );
}
