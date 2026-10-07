import type { Metadata } from 'next';
import { DocPage, DocSection, DocP, DocList } from '@/components/doc-page';

export const metadata: Metadata = {
  title: 'Terms',
  description: 'Terms of sale for LinSilk.',
  robots: { index: false },
};

export default function TermsPage() {
  return (
    <DocPage
      eyebrow="Legal"
      title="Terms of sale"
      lead="LinSilk sells made-to-measure garments from Geneva. These terms govern reservations, confirmation, payment and delivery."
    >
      <DocSection title="Awaiting legal review">
        <DocP>
          This page is a structural placeholder. Binding terms of sale must be drafted
          or approved by a qualified lawyer in the seller’s jurisdiction before the
          store accepts a live order — they carry statutory obligations that cannot be
          written from a template, and getting them wrong is a legal exposure rather
          than a content gap.
        </DocP>
        <DocP>The drafted terms need to cover at least:</DocP>
        <DocList
          items={[
            'The parties, the registered entity and its Swiss commercial register number.',
            'When a contract is formed — on reservation, or on written confirmation of the measurement sheet.',
            'Price, currency, and that duty is included within Switzerland and the EU but not elsewhere.',
            'Payment terms, and how a commission’s confirmed price replaces its estimate.',
            'The statutory right of withdrawal, and the made-to-measure exemption under EU and Swiss law.',
            'Delivery times as estimates, and what happens when they are missed.',
            'Warranty, liability limits, governing law and the competent court.',
          ]}
        />
      </DocSection>
    </DocPage>
  );
}
