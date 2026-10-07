import type { Metadata } from 'next';
import { DocPage, DocSection, DocP, DocRows } from '@/components/doc-page';
import { ButtonLink } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Shipping',
  description:
    'Everything is made to order and dispatched from Geneva. Times, duty and tracking.',
};

export default function ShippingPage() {
  return (
    <DocPage
      title="Shipping"
      lead="Every garment is cut and finished to your measurement sheet, inspected twice, then dispatched from Geneva."
      foot={
        <>
          <ButtonLink href="/care/returns" variant="rule">Returns</ButtonLink>
          <ButtonLink href="/care/questions" variant="rule">Questions</ButtonLink>
        </>
      }
    >
      <DocSection title="How long it takes">
        <DocP>
          The clock starts when your measurement sheet is confirmed in writing, not
          when you reserve. A piece takes two to four weeks at the bench, whether it
          comes from a collection or from a commission.
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
          in customs, write to hello@bylinsilk.com and the office in Geneva will chase
          it rather than asking you to.
        </DocP>
      </DocSection>
    </DocPage>
  );
}
