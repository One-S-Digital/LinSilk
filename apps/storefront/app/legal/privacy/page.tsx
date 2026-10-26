import type { Metadata } from 'next';
import { DocPage, DocSection, DocP, DocList } from '@/components/doc-page';

export const metadata: Metadata = {
  title: 'Privacy',
  description: 'How LINSILK handles your data.',
  robots: { index: false },
};

export default function PrivacyPage() {
  return (
    <DocPage
      eyebrow="Legal"
      title="Privacy"
      lead="The house collects your contact details, delivery address and fifteen body measurements. Body measurements are personal data, and under GDPR they need a lawful basis, a retention period and a deletion route like anything else."
    >
      <DocSection title="Visit statistics">
        <DocP>
          The site counts visits with Umami, a cookieless analytics service. It sets no
          cookies and stores no personal data about visitors.
        </DocP>
      </DocSection>

      <DocSection title="Awaiting legal review">
        <DocP>
          This page is a structural placeholder. A privacy notice must be drafted
          against the store’s actual data flows — which processors are used, where data
          is stored, and how long it is kept — and reviewed by someone competent in
          Swiss FADP and EU GDPR before the store goes live.
        </DocP>
        <DocP>The drafted notice needs to cover at least:</DocP>
        <DocList
          items={[
            'The data controller, and a contact point for data questions.',
            'What is collected: contact details, address, telephone, measurements, order history, and files uploaded to a commission.',
            'The lawful basis for each, and why measurements are necessary to perform the contract.',
            'Processors and where they hold data — Stripe, the hosting provider, email delivery, and the production team.',
            'Where measurements are held and processed, any transfer outside the EEA, and the safeguard relied on for that transfer.',
            'How long a measurement profile and a drawn pattern are kept, and how a client has both deleted.',
            'Cookies and analytics, and consent where it is required.',
            'The client’s rights of access, correction, erasure, portability and complaint.',
          ]}
        />
      </DocSection>
    </DocPage>
  );
}
