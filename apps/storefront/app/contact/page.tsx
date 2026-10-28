import type { Metadata } from 'next';
import { ContactView } from '@/components/pages/care-views';
import { pagesText } from '@/lib/i18n-pages';
import { languagesFor } from '@/lib/locale-routes';
import { getStoryPage } from '@/lib/payload';

export async function generateMetadata(): Promise<Metadata> {
  const story = await getStoryPage('contact');
  return {
    title: pagesText('en').contact.metaTitle,
    description: story.lead,
    alternates: { canonical: '/contact', languages: languagesFor('/contact') },
  };
}

export default function ContactPage() {
  return <ContactView lang="en" />;
}
