import type { Metadata } from 'next';
import { DocPage, DocSection, DocP } from '@/components/doc-page';
import { JsonLd } from '@/components/json-ld';
import { ButtonLink } from '@/components/ui/button';
import { getPieces, money } from '@/lib/catalog';
import type { QA } from '@/lib/garments';
import { COLOURS, EMAIL, priceRange } from '@/lib/house';
import { faqLd } from '@/lib/jsonld';

/* The answer bank (docs/seo/COPY-GUIDES-FAQ.md §3). Each answer opens with
   the answer and stands alone if quoted. Answers that wait on a decision
   from the house — payment methods, a pattern fee, the high-frequency page —
   are left out until it is made, rather than published as a guess. */

export const metadata: Metadata = {
  title: 'Questions: made to measure, cloth, delivery and returns',
  description:
    'Answers to what LINSILK is asked most: how made-to-measure works, fittings, lead times, silk and linen care, delivery, duty and returns.',
  alternates: { canonical: '/care/questions' },
};

function bank(range: { from: number; to: number } | null): { title: string; items: QA[] }[] {
  return [
    {
      title: 'Made to measure',
      items: [
        {
          q: 'Why is there no size chart?',
          a: 'Because nothing is made to a size. A pattern is drawn to your fifteen measurements and kept, which is also why the second piece you order fits like the first.',
        },
        {
          q: 'What if I am between sizes?',
          a: 'There are no sizes to fall between. LINSILK cuts each piece to your fifteen measurements, not to a size.',
        },
        {
          q: 'Do I need a fitting?',
          a: 'No. LINSILK does not hold fittings: you measure yourself with the measuring guide, or take the guide to any tailor, and the piece is inspected twice against your measurements before it is dispatched from Geneva.',
        },
        {
          q: 'Can I have a dress made without a tailor?',
          a: 'Yes. LINSILK makes the dress; you only provide your measurements, which you can take yourself or have taken by any tailor.',
        },
        {
          q: 'What is the difference between made-to-measure and bespoke?',
          a: 'Made-to-measure draws a pattern from your measurements; bespoke adds fittings and a trial garment. LINSILK is made-to-measure and does not hold fittings.',
        },
        {
          q: 'What is the difference between a piece and a commission?',
          a: 'A piece is a design the house drew, cut to your measurements. A commission is a garment that exists because you described it: you give the shape, the cloth and a note, and the tailor builds one garment to that brief.',
        },
        {
          q: 'Does LINSILK offer alterations?',
          a: 'No. Each piece is made to your measurements; a manufacturing fault is repaired or the piece replaced.',
        },
      ],
    },
    {
      title: 'Cloth and care',
      items: [
        {
          q: 'Why does LINSILK use only silk and linen?',
          a: 'Silk and linen are natural fibres that breathe, move with the body and rest lightly on the skin, so LINSILK makes its garments in nothing else: 100% silk or 100% linen cloth, never a blend or a synthetic.',
        },
        {
          q: 'Are LINSILK pieces 100% silk or linen?',
          a: 'Yes: every LINSILK garment is made in 100% silk or 100% linen cloth. Buttons, zips and similar fastenings are not silk or linen.',
        },
        {
          q: 'Is silk or linen better for warm weather?',
          a: 'Both breathe. Linen is crisp, airy and cooling and softens with wear; silk is smooth and light and keeps you comfortable when it is cooler too.',
        },
        {
          q: 'How should I wash it?',
          a: 'Silk and linen both prefer cool hand-washing and drying flat out of direct sun; neither wants a tumble dryer.',
        },
        {
          q: 'Does linen crease?',
          a: 'Yes; natural linen creases, softens and ages, which is part of the cloth and not a fault.',
        },
        {
          q: 'How many colours can I choose from?',
          a: `${COLOURS.silk} silk colours (plain, jacquard and brocade) and ${COLOURS.linen} linen colours; you choose from swatches of the piece’s own cloth.`,
        },
        {
          q: 'Why does LINSILK avoid polyester?',
          a: 'Polyester, nylon and PU cloths are made from petroleum, do not breathe, trap heat and moisture against the skin and shed microplastic fibres when worn and washed.',
        },
      ],
    },
    {
      title: 'Ordering, delivery and returns',
      items: [
        {
          q: 'How long does made-to-measure take?',
          a: 'At LINSILK, 2–4 weeks from the day your measurement sheet is confirmed, plus delivery: Switzerland 2–3 days, the EU and UK 3–6, the rest of the world 5–10 days.',
        },
        {
          q: 'When should I order a dress for an event?',
          a: 'About six weeks before in Europe and eight weeks before elsewhere: 2–4 weeks to make from your confirmed sheet, plus delivery.',
        },
        ...(range
          ? [
              {
                q: 'How much do LINSILK pieces cost?',
                a: `${money(range.from)}–${range.to}, depending on the piece. Prices are in Swiss francs; the site can show an approximate figure in euros, pounds, dollars or dirhams.`,
              },
            ]
          : []),
        {
          q: 'Does LINSILK ship to Germany, Austria, France, Luxembourg, the Netherlands and the UAE?',
          a: 'Yes, from Geneva. EU and UK delivery takes 3–6 days after dispatch, the rest of the world 5–10 days, with tracking.',
        },
        {
          q: 'Who pays customs duty?',
          a: 'Prices include duty within Switzerland and the EU. In the UK, import VAT is payable on arrival; elsewhere the carrier collects duty and import tax on delivery.',
        },
        {
          q: 'Can I return a made-to-measure piece?',
          a: 'A piece cut to one person’s measurements cannot be returned for a change of mind. A manufacturing fault is repaired or the piece replaced, and you can cancel before it is cut.',
        },
        {
          q: 'Can I cancel an order?',
          a: 'Yes, up to the point you confirm your measurement sheet in writing, in full and without a reason.',
        },
        {
          q: 'Will a design still be available next season?',
          a: 'Most designs carry over into the next collection; a few are retired each season.',
        },
      ],
    },
    {
      title: 'The house',
      items: [
        {
          q: 'Where is LINSILK based?',
          a: 'LINSILK is based in Geneva, Switzerland.',
        },
        {
          q: 'Is LINSILK a real brand?',
          a: `LINSILK is a made-to-measure silk and linen house based in Geneva; every piece is cut and sewn to the customer’s measurements and sent with tracking. Contact: ${EMAIL}.`,
        },
        {
          q: 'Does LINSILK make menswear?',
          a: 'Yes: men’s linen shirts, trousers and two-piece looks, made to your measurements in 2–4 weeks.',
        },
        {
          q: 'Is a silk pyjama set a good gift?',
          a: 'Yes, with one caveat: it is made to measure, so the recipient’s measurements are needed.',
        },
      ],
    },
  ];
}

export default async function QuestionsPage() {
  const groups = bank(priceRange(await getPieces()));

  return (
    <DocPage
      title="Questions"
      lead={`What the office in Geneva is asked most often. Anything not here, write to ${EMAIL} — a person answers, usually within a day.`}
      foot={
        <>
          <ButtonLink href="/care/measuring" variant="rule">Measurement guide</ButtonLink>
          <ButtonLink href="/care/shipping" variant="rule">Shipping</ButtonLink>
        </>
      }
    >
      <JsonLd data={faqLd(groups.flatMap((g) => g.items))} />
      {groups.map((group) => (
        <DocSection key={group.title} title={group.title}>
          {group.items.map(({ q, a }) => (
            <DocP key={q}>
              <strong>{q}</strong>
              <br />
              {a}
            </DocP>
          ))}
        </DocSection>
      ))}
    </DocPage>
  );
}
