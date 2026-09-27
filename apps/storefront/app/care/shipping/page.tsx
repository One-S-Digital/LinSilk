import type { Metadata } from 'next';
import { DocPage, DocSection, DocP, DocRows } from '@/components/doc-page';
import { ButtonLink } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Shipping',
  description:
    'Everything is made in Hội An and dispatched from Zürich. Times, duty and tracking.',
};

export default function ShippingPage() {
  return (
    <DocPage
      title="Shipping"
      lead="Every garment is cut and finished in Hội An, checked against your sheet, then sent to Zürich and dispatched from there. Nothing ships directly from the atelier, because everything is inspected twice before it leaves the house."
      foot={
        <>
          <ButtonLink href="/care/returns" variant="rule">Returns and alterations</ButtonLink>
          <ButtonLink href="/care/questions" variant="rule">Questions</ButtonLink>
        </>
      }
    >
      <DocSection title="How long it takes">
        <DocP>
          The clock starts when your measurement sheet is confirmed in writing, not
          when you reserve. A seasonal piece takes three to five weeks at the bench. A
          commission takes four to six, because the pattern is drawn from nothing.
        </DocP>
        <DocRows
          rows={[
            ['Switzerland', 'Two to three days once dispatched. Duty included.'],
            ['European Union', 'Three to six days. Duty included in the price.'],
            ['United Kingdom', 'Three to six days. Import VAT payable on arrival.'],
            ['Rest of world', 'Five to ten days. Duties and import tax payable on arrival.'],
          ]}
        />
      </DocSection>

      <DocSection title="Duty and tax">
        <DocP>
          Prices are in Swiss francs and include duty within Switzerland and the
          European Union — the figure you agree is the figure you pay. Outside those
          markets the carrier collects duty and import tax at delivery, set by your
          own customs authority. The house does not mark parcels as gifts or
          understate their value.
        </DocP>
      </DocSection>

      <DocSection title="Tracking">
        <DocP>
          You are written to when the pattern is cut, when the piece passes its second
          check, and when it is dispatched with a tracking number. If a parcel stalls
          in customs, write to hello@linsilk.ch and the office in Zürich will chase
          it rather than asking you to.
        </DocP>
      </DocSection>
    </DocPage>
  );
}
