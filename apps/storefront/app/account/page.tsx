import type { Metadata } from 'next';
import { DocPage, DocSection, DocP, DocList } from '@/components/doc-page';
import { ButtonLink } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Account',
  description:
    'Your orders, your saved measurement profile, and the patterns the atelier holds for you.',
};

export default function AccountPage() {
  return (
    <DocPage
      eyebrow="The house"
      title="Your account"
      lead="An account holds the fifteen measurements so you never type them twice, keeps every order and its production status, and records the paper patterns the atelier has drawn for you."
      foot={
        <>
          <ButtonLink href="/collection" variant="outline">Enter the collection</ButtonLink>
          <ButtonLink href="/care/measuring" variant="rule">Measurement guide</ButtonLink>
        </>
      }
    >
      <DocSection title="Not yet connected">
        <DocP>
          Sign-in arrives with the Medusa backend. Until then, the measurement sheet
          saves to this device from any product page or from the commission flow, so
          nothing you have already typed is lost.
        </DocP>
        <DocP>When accounts are live, this page will carry:</DocP>
        <DocList
          items={[
            'Sign in, registration, and password reset.',
            'Your saved measurement profile, with a history of revisions.',
            'Every order, its confirmed sheet, and where it is at the bench.',
            'Invoices, and the tracking number once a piece is dispatched.',
            'Delivery addresses.',
            'The patterns the atelier holds in your name.',
          ]}
        />
      </DocSection>
    </DocPage>
  );
}
