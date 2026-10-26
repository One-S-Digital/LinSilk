import { EditPage, editMetadata } from '@/components/edit-page';
import { EDITS } from '@/lib/edits';

export const generateMetadata = () => editMetadata(EDITS.sleepwear);

export default function SleepwearPage() {
  return <EditPage edit={EDITS.sleepwear} />;
}
