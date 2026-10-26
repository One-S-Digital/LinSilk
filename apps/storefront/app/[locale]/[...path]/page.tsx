import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { EditPage, editMetadata } from '@/components/edit-page';
import { editForSlug } from '@/lib/edits-i18n';
import { isLocale } from '@/lib/i18n';

/* The translated category pages, at /{locale}/{translated-slug}
   (docs/seo/SEO-GEO-PLAN.md §6.7). An unknown locale or slug is a 404. */

const find = async (props: PageProps<'/[locale]/[...path]'>) => {
  const { locale, path } = await props.params;
  return isLocale(locale) ? editForSlug(locale, path.join('/')) : undefined;
};

export async function generateMetadata(props: PageProps<'/[locale]/[...path]'>): Promise<Metadata> {
  const edit = await find(props);
  return edit ? editMetadata(edit) : {};
}

export default async function LocalePage(props: PageProps<'/[locale]/[...path]'>) {
  const edit = await find(props);
  if (!edit) notFound();
  return <EditPage edit={edit} />;
}
