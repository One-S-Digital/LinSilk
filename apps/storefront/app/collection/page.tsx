import type { Metadata } from 'next';
import { CollectionHubView } from '@/components/pages/collection-views';
import { currentCollection } from '@/lib/catalog';
import { pagesText } from '@/lib/i18n-pages';
import { languagesFor } from '@/lib/locale-routes';

export async function generateMetadata(): Promise<Metadata> {
  const open = await currentCollection();
  const t = pagesText('en').collection;
  return {
    title: t.title,
    description: t.description(open ? `${open.title}. ` : ''),
    alternates: { canonical: '/collection', languages: languagesFor('/collection') },
  };
}

export default function CollectionPage() {
  return <CollectionHubView lang="en" />;
}
