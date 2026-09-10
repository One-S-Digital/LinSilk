import type { Metadata } from 'next';
import { DocPage, DocSection, DocP } from '@/components/doc-page';
import { ButtonLink } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Returns and alterations',
  description:
    'What happens if a piece does not sit right: free alterations for the first year, and what the house does when it gets something wrong.',
};

export default function ReturnsPage() {
  return (
    <DocPage
      title="Returns and alterations"
      lead="A garment cut to one person’s measurements cannot be resold, so the house does not offer a general right of return on made-to-measure work. What it offers instead is a bench that will keep working on the piece until it sits properly."
      foot={<ButtonLink href="mailto:hello@maisonayla.ch" variant="outline">Write to the house</ButtonLink>}
    >
      <DocSection title="Alterations, free for a year">
        <DocP>
          Send a piece back within twelve months of receiving it and it is re-set at
          the bench at no charge, return postage included. Sleeves shortened, a waist
          taken in, a hem re-hung — the pattern drawn for you is kept on file, so the
          alteration is worked against the original rather than guessed at.
        </DocP>
      </DocSection>

      <DocSection title="When the house is wrong">
        <DocP>
          If a finished piece is more than half a centimetre out from your confirmed
          sheet, it is remade. Not altered — remade, in the same cloth, at no cost. The
          garment is checked twice before it leaves precisely so this is rare, but it
          is the house’s error and it is carried by the house.
        </DocP>
      </DocSection>

      <DocSection title="When the sheet was wrong">
        <DocP>
          If the measurements turn out not to match the body, the first alteration is
          still free — it is an easy mistake and the tape is not always kind. Write
          with corrected figures and the piece is re-set against them.
        </DocP>
      </DocSection>

      <DocSection title="Faults">
        <DocP>
          Natural fibre creases, softens and moves, and none of that is a fault. A
          failed seam, a dropped hem or a button that pulls away is, and it is repaired
          or the piece replaced, whichever the bench judges right, with no time limit.
        </DocP>
      </DocSection>

      <DocSection title="Before anything is cut">
        <DocP>
          Nothing is cut until you have confirmed your sheet in writing, so a
          reservation can be released at any point up to that reply, in full and
          without a reason.
        </DocP>
      </DocSection>
    </DocPage>
  );
}
