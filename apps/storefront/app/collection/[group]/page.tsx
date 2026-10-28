import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { CollectionGroupView } from '@/components/pages/collection-views';
import type { Group } from '@/lib/catalog';
import { pagesText } from '@/lib/i18n-pages';
import { languagesFor } from '@/lib/locale-routes';

const GROUPS: Group[] = ['women', 'men'];

export function generateStaticParams() {
  return GROUPS.map((group) => ({ group }));
}

const isGroup = (value: string): value is Group => GROUPS.includes(value as Group);

export async function generateMetadata(
  props: PageProps<'/collection/[group]'>,
): Promise<Metadata> {
  const { group } = await props.params;
  if (!isGroup(group)) return {};
  const t = pagesText('en').group;
  return {
    title: group === 'women' ? t.titleWomen : t.titleMen,
    description: group === 'women' ? t.descWomen : t.descMen,
    alternates: { canonical: `/collection/${group}`, languages: languagesFor(`/collection/${group}`) },
  };
}

export default async function CollectionGroupPage(
  props: PageProps<'/collection/[group]'>,
) {
  const { group } = await props.params;
  if (!isGroup(group)) notFound();
  return <CollectionGroupView group={group} lang="en" />;
}
