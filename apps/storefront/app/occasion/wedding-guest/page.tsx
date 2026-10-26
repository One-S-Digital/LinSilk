import { EditPage, editMetadata } from '@/components/edit-page';
import { EDITS } from '@/lib/edits';

export const generateMetadata = () => editMetadata(EDITS['wedding-guest']);

export default function WeddingGuestPage() {
  return <EditPage edit={EDITS['wedding-guest']} />;
}
