import type { Metadata } from 'next';
import { DocPage, DocRows, DocSection, DocP } from '@/components/doc-page';
import { EMAIL } from '@/lib/house';

/* The legal notice (Impressum) that sales to Germany and Austria require, and
   Swiss UWG Art. 3 lit. s (SEO-GEO-PLAN §6.13). Built now with placeholders;
   the bracketed values are the client's to supply (plan §13, row 13). The page
   stays `noindex`, like the other legal pages, so a placeholder is never
   shown in search; the footer link goes in with the real values. */
export const metadata: Metadata = {
  title: 'Legal notice',
  description: 'Who runs LINSILK, and how to reach the house.',
  robots: { index: false },
};

export default function LegalNoticePage() {
  return (
    <DocPage
      eyebrow="Legal"
      title="Legal notice"
      lead="LINSILK is a made-to-measure silk and linen clothing house based in Geneva, Switzerland."
    >
      <DocSection title="The house">
        <DocRows
          rows={[
            ['Legal name', '[LEGAL_NAME]'],
            ['Address', '[ADDRESS]'],
            ['Commercial register (UID)', '[UID]'],
            ['Email', <a key="mail" href={`mailto:${EMAIL}`}>{EMAIL}</a>],
          ]}
        />
      </DocSection>
      <DocSection title="Contact">
        <DocP>
          Questions about an order, a measurement sheet or the house are answered by a
          person, usually within a day.
        </DocP>
      </DocSection>
    </DocPage>
  );
}
