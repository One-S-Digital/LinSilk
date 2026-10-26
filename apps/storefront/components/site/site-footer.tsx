import { pastCollections } from '@/lib/catalog';
import { FooterView } from './footer-view';

/* The archive link exists only while there is an archive; everything else is
   the same in every language, so the words are chosen in the client part. */
export async function SiteFooter() {
  const hasArchive = (await pastCollections()).length > 0;
  return <FooterView hasArchive={hasArchive} />;
}
