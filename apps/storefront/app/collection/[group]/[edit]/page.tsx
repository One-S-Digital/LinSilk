import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { EditPage, editMetadata } from '@/components/edit-page';
import { EDITS, GROUP_EDITS } from '@/lib/edits';

export function generateStaticParams() {
  return GROUP_EDITS;
}

export const dynamicParams = false;

const editFor = (group: string, edit: string) =>
  GROUP_EDITS.some((e) => e.group === group && e.edit === edit) ? EDITS[`${group}/${edit}`] : undefined;

export async function generateMetadata(
  props: PageProps<'/collection/[group]/[edit]'>,
): Promise<Metadata> {
  const { group, edit } = await props.params;
  const found = editFor(group, edit);
  return found ? editMetadata(found) : {};
}

export default async function GroupEditPage(props: PageProps<'/collection/[group]/[edit]'>) {
  const { group, edit } = await props.params;
  const found = editFor(group, edit);
  if (!found) notFound();
  return <EditPage edit={found} />;
}
