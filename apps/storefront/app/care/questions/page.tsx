import type { Metadata } from 'next';
import { DocPage, DocSection, DocP } from '@/components/doc-page';
import { ButtonLink } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Questions',
  description:
    'Cloth, sizing, commissions, cuttings and appointments — the questions the house is asked most.',
};

export default function QuestionsPage() {
  return (
    <DocPage
      title="Questions"
      lead="What the office in Zürich is asked most often. Anything not here, write to hello@linsilk.ch — a person answers, usually within a day."
      foot={
        <>
          <ButtonLink href="/care/measuring" variant="rule">Measurement guide</ButtonLink>
          <ButtonLink href="/care/shipping" variant="rule">Shipping</ButtonLink>
        </>
      }
    >
      <DocSection title="Can I have a cutting of the cloth first?">
        <DocP>
          Yes, and for a commission one is posted to you before anything is cut. Ask
          for any of the four weaves at any time and it is sent free, anywhere.
        </DocP>
      </DocSection>

      <DocSection title="Why is there no size chart?">
        <DocP>
          Because nothing is made to a size. A pattern is drawn to your fifteen
          measurements and kept, which is also why the second piece you order fits like
          the first.
        </DocP>
      </DocSection>

      <DocSection title="What is the difference between a piece and a commission?">
        <DocP>
          A seasonal piece is a design the house drew, cut to your measurements, made in
          a capped run and then archived. A commission is a garment that exists because
          you described it — you give the shape, the cloth and a note, and no version of
          it enters a collection.
        </DocP>
      </DocSection>

      <DocSection title="Will a design be made again?">
        <DocP>
          No. A season is cut in a capped run and none has ever been restocked. When
          a season closes its designs go to the archive and stay there.
        </DocP>
      </DocSection>

      <DocSection title="Can I see something in person?">
        <DocP>
          There are appointments in Zürich on Thursday afternoons — cloth to handle,
          finished pieces to try, and a tailor who will take your measurements. Write to
          arrange one.
        </DocP>
      </DocSection>

      <DocSection title="How should I wash it?">
        <DocP>
          Silk and linen both prefer cool hand-washing and drying flat out of direct
          sun; neither wants a tumble dryer. A ticket with instructions for your
          specific cloth comes with the garment, written for that bolt.
        </DocP>
      </DocSection>
    </DocPage>
  );
}
