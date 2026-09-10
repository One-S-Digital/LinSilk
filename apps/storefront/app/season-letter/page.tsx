import type { Metadata } from 'next';
import { DocPage, DocSection, DocP } from '@/components/doc-page';
import { ButtonLink } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Season letter',
  description:
    'Four letters a year, when a collection opens. What was made, what the cloth was, and what closed.',
};

export default function SeasonLetterPage() {
  return (
    <DocPage
      eyebrow="Connect"
      title="The season letter"
      lead="Four letters a year, sent when a collection opens. What the bench made, which bolts it came from, and which designs closed with the season. No discounts, because the house does not run them."
      foot={<ButtonLink href="mailto:hello@maisonayla.ch?subject=Season%20letter" variant="outline">Ask to be added</ButtonLink>}
    >
      <DocSection title="Signing up">
        <DocP>
          The subscription form arrives with the backend, so for now write to
          hello@maisonayla.ch with “season letter” in the subject and you will be added
          by hand. You can leave at any time by replying to any letter.
        </DocP>
      </DocSection>
    </DocPage>
  );
}
