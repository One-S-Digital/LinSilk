import type { Metadata } from 'next';
import { DocPage, DocSection, DocP, DocList } from '@/components/doc-page';
import { ButtonLink } from '@/components/ui/button';
import { ZONES } from '@/lib/catalog';

export const metadata: Metadata = {
  title: 'Measurement guide',
  description:
    'How to take the fifteen measurements the atelier needs, and what to do if you would rather a tailor took them.',
};

export default function MeasuringPage() {
  return (
    <DocPage
      title="Measurement guide"
      lead="There is no small, medium or large. Fifteen measurements decide the garment, and they are the part of the order worth slowing down for. Ten minutes with a soft tape and someone to help you is enough."
      foot={
        <>
          <ButtonLink href="/collection" variant="outline">Enter the collection</ButtonLink>
          <ButtonLink href="mailto:hello@linsilk.ch" variant="rule">Ask for help</ButtonLink>
        </>
      }
    >
      <DocSection title="Before you start">
        <DocList
          items={[
            'Wear close-fitting clothes, or none. Never measure over a jumper.',
            'Use a soft tape. A metal builder’s tape cannot follow the body.',
            'Keep the tape flat against you and level all the way round — check the back in a mirror.',
            'Stand as you normally stand. Pulling your shoulders back changes the garment.',
            'Ask someone else to take the back and shoulder measurements if you can.',
            'Write centimetres if you have them. The site converts inches, but the tape is easier to read in cm.',
          ]}
        />
      </DocSection>

      <DocSection title="The fifteen">
        <DocList
          items={ZONES.map((z) => (
            <>
              <strong style={{ fontWeight: 400 }}>{z.label}</strong>{' '}
              <span lang="vi" style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--t-mono-sm)', letterSpacing: 'var(--ls-mono)', color: 'var(--gold)' }}>
                {z.vi}
              </span>{' '}
              — {z.hint}
            </>
          ))}
        />
      </DocSection>

      <DocSection title="If you would rather not">
        <DocP>
          Any tailor or alterations shop will take these fifteen in a few minutes, often
          for nothing. Print this page, or show them the list on your phone. In Zürich
          the house keeps appointments on Thursday afternoons — write to
          hello@linsilk.ch and someone will take them for you and enter the sheet.
        </DocP>
      </DocSection>

      <DocSection title="If a measurement looks wrong">
        <DocP>
          The sheet flags a figure that sits outside the usual range for that zone.
          That is a prompt to check the tape, not a refusal — bodies vary, and the
          atelier would rather cut to an unusual number you have confirmed than to a
          typing error you did not notice.
        </DocP>
      </DocSection>
    </DocPage>
  );
}
