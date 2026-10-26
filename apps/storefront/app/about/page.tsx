import Link from 'next/link';
import type { Metadata } from 'next';
import { DocP, DocPage, DocRows, DocSection } from '@/components/doc-page';
import { ButtonLink } from '@/components/ui/button';
import { getPieces, money } from '@/lib/catalog';
import { COLOURS, EMAIL, ENTITY, priceRange } from '@/lib/house';

/* The entity page: who the house is, said in the same words as the schema,
   the profiles and the press sheet, with the facts in one fixed place
   ("LINSILK at a glance") for answer engines to quote. */

export const metadata: Metadata = {
  title: 'About LINSILK: made-to-measure silk and linen from Geneva',
  description:
    'LINSILK is a Geneva house making clothing to your measurements in 100% silk and 100% linen. How it is made, what it costs, and how to order.',
  alternates: { canonical: '/about' },
};

export default async function AboutPage() {
  const range = priceRange(await getPieces());

  return (
    <DocPage
      eyebrow="The house"
      title="About LINSILK"
      lead={ENTITY}
      foot={
        <>
          <ButtonLink href="/collection" variant="outline">See the collection</ButtonLink>
          <ButtonLink href="/contact" variant="rule">Contact</ButtonLink>
        </>
      }
    >
      <DocSection title="What made-to-measure means at LINSILK">
        <DocP>
          Nothing is made to a standard size. Your fifteen measurements become a pattern
          drawn for you alone. The piece is cut flat from it, one at a time, sewn,
          inspected twice against your measurements, then dispatched from Geneva. LINSILK
          does not hold fittings: you measure yourself, or take the{' '}
          <Link href="/care/measuring">measuring guide</Link> to any tailor.
        </DocP>
      </DocSection>

      <DocSection title="Why only silk and linen">
        <DocP>
          Silk and linen are natural fibres that breathe, move with the body and rest
          lightly on the skin. Every LINSILK garment is made in 100% silk or 100% linen
          cloth, never a blend or a synthetic. Polyester, nylon and PU cloths are made from
          petroleum, do not breathe, and shed microplastic fibres when worn and washed.
        </DocP>
      </DocSection>

      <DocSection title="LINSILK at a glance">
        <DocRows
          rows={[
            ['What', 'Made-to-measure clothing for women and men'],
            ['Where', 'Based in Geneva, Switzerland'],
            ['Cloth', '100% silk or 100% linen'],
            ['Colours', `${COLOURS.silk} silk colours (plain, jacquard, brocade); ${COLOURS.linen} linen colours`],
            ...(range ? [['Price', `${money(range.from)}–${range.to} per piece`] as [string, string]] : []),
            ['Making time', '2–4 weeks from your confirmed measurement sheet'],
            ['How to order', 'Choose a piece and its colour, enter 15 measurements, and it is cut and sewn for you'],
            ['Fittings', 'None; you measure yourself or use any tailor'],
            ['Delivery', 'Switzerland 2–3 days, EU and UK 3–6 days, rest of world 5–10 days, once dispatched from Geneva; tracking included'],
            ['Returns', 'Made-to-measure pieces cannot be returned for a change of mind; manufacturing faults are repaired or the piece replaced; an order can be cancelled before cutting'],
            ['Contact', `${EMAIL}, answered by a person, usually within a day`],
          ]}
        />
      </DocSection>
    </DocPage>
  );
}
