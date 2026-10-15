import type { Metadata } from 'next';
import { DocPage, DocSection, DocP } from '@/components/doc-page';
import { ButtonLink } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Returns',
  description:
    'Why made-to-measure work is not returnable, what is done about a fault, and when an order can be released.',
};

export default function ReturnsPage() {
  return (
    <DocPage
      title="Returns"
      lead="A garment cut to one person’s measurements cannot be resold, so the house does not offer a general right of return on made-to-measure work."
      foot={<ButtonLink href="mailto:hello@bylinsilk.com" variant="outline">Write to the house</ButtonLink>}
    >
      <DocSection title="Faults">
        <DocP>
          Natural fibre creases, softens and moves, and none of that is a fault. A
          manufacturing fault — a failed seam, a dropped hem or a button that pulls
          away — is repaired, or the piece replaced, whichever the bench judges right.
        </DocP>
      </DocSection>

      <DocSection title="Before anything is cut">
        <DocP>
          Nothing is cut until you have confirmed your sheet in writing, so a
          order can be released at any point up to that reply, in full and
          without a reason.
        </DocP>
      </DocSection>
    </DocPage>
  );
}
