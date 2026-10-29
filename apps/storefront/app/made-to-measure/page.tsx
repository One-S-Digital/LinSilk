import Link from 'next/link';
import type { Metadata } from 'next';
import { DocList, DocP, DocPage, DocSection } from '@/components/doc-page';
import { JsonLd } from '@/components/json-ld';
import { ButtonLink } from '@/components/ui/button';
import { getPieces, money } from '@/lib/catalog';
import type { QA } from '@/lib/garments';
import { COLOURS, priceRange } from '@/lib/house';
import { faqLd } from '@/lib/jsonld';

/* Owns the made-to-measure process cluster (SEO-GEO-PLAN §5): what it is,
   how ordering works, what it costs, fittings. Home owns the brand query,
   /design owns the commission. */

const FAQ: QA[] = [
  {
    q: 'What is made-to-measure clothing?',
    a: 'Made-to-measure clothing is cut and sewn to your own body measurements instead of a standard size. At LINSILK you enter fifteen measurements and the piece is cut and sewn for you in 2–4 weeks.',
  },
  {
    q: 'How long does made-to-measure take?',
    a: 'At LINSILK, 2–4 weeks from the day your measurement sheet is confirmed, plus delivery: Switzerland 2–3 days, the EU and UK 3–6 days, the rest of the world 5–10 days.',
  },
  {
    q: 'Do I need a fitting?',
    a: 'No. LINSILK does not hold fittings: you measure yourself with the measuring guide, or take the guide to any tailor, and the piece is inspected twice against your measurements before it is dispatched from Geneva.',
  },
  {
    q: 'What if I measure wrong?',
    a: 'The measurement sheet flags a figure outside the usual range for that zone so you can check the tape, and nothing is cut until you confirm your sheet in writing.',
  },
  {
    q: 'Can I have a dress made online?',
    a: 'Yes. Choose a silk or linen piece, choose its colour from the swatches, enter your measurements, and LINSILK cuts and sews it for you in 2–4 weeks, then dispatches it from Geneva.',
  },
];

export async function generateMetadata(): Promise<Metadata> {
  const range = priceRange(await getPieces());
  return {
    title: 'Made-to-measure clothing online: how it works',
    description: `How to order made-to-measure silk and linen clothing online: choose, enter 15 measurements, ready in 2–4 weeks. No fittings.${range ? ` From ${money(range.from)}.` : ''}`,
    alternates: { canonical: '/made-to-measure' },
  };
}

export default async function MadeToMeasurePage() {
  const pieces = await getPieces();
  const all = priceRange(pieces);
  const silk = priceRange(pieces.filter((p) => p.cloth === 'silk'));
  const linen = priceRange(pieces.filter((p) => p.cloth === 'linen'));

  return (
    <DocPage
      eyebrow="Made to measure"
      title="Made-to-measure clothing, ordered online"
      lead="Made-to-measure clothing is cut and sewn to your own measurements instead of a standard size. At LINSILK you order online: choose a silk or linen piece, choose its colour, enter fifteen measurements, and it is cut and sewn for you in 2–4 weeks, then dispatched from Geneva."
      foot={
        <>
          <ButtonLink href="/collection" variant="outline">See the collection</ButtonLink>
          <ButtonLink href="/care/measuring" variant="rule">Measuring guide</ButtonLink>
        </>
      }
    >
      <JsonLd data={faqLd(FAQ)} />

      <DocSection title="How it works">
        <DocList
          items={[
            'Choose a piece from the women’s or men’s collection.',
            `Choose its colour from the swatches of its cloth (${COLOURS.silk} silk colours, ${COLOURS.linen} linen colours).`,
            'Enter your measurements, with the measuring guide beside you. No fittings: measure yourself, or take the guide to any tailor.',
            'It is cut and sewn in 2–4 weeks from your confirmed sheet, inspected twice, then sent with tracking.',
          ]}
        />
      </DocSection>

      {all && (
        <DocSection title="What you pay">
          <DocP>
            Pieces run from {money(all.from)} to {money(all.to)}
            {silk && linen
              ? ` (silk from ${money(silk.from)}, linen from ${money(linen.from)})`
              : ''}
            . There is no extra charge for cutting to your measurements: every piece is made that way.
            Prices are in Swiss francs; <Link href="/care/shipping">duty and delivery</Link>{' '}
            depend on where you are.
          </DocP>
        </DocSection>
      )}

      <DocSection title="Made-to-measure, tailor-made, custom-made or bespoke?">
        <DocP>
          LINSILK is made to measure, also called tailor-made or custom-made: a pattern
          drawn from your measurements, cut and sewn individually. It is not bespoke in
          the strict tailoring sense, which adds fittings and a trial garment. LINSILK
          does not hold fittings.
        </DocP>
      </DocSection>

      <DocSection title="Have a dress made online, without a fitting">
        <DocP>
          You measure yourself with the guide (about ten minutes with a soft tape), or
          take the guide to any tailor. Nothing is cut until you confirm your sheet in
          writing, and each piece is checked twice against your numbers before dispatch.
        </DocP>
      </DocSection>

      <DocSection title="Want something not in the collection?">
        <DocP>
          Design your own piece as a commission: choose a base silhouette and the cloth,
          write a brief, and the tailor replies with a price.{' '}
          <Link href="/design">Design your own</Link>
        </DocP>
      </DocSection>

      <DocSection title="Questions">
        {FAQ.map(({ q, a }) => (
          <div key={q}>
            <DocP>
              <strong>{q}</strong>
              <br />
              {a}
            </DocP>
          </div>
        ))}
      </DocSection>
    </DocPage>
  );
}
