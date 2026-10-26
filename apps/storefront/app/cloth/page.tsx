import type { Metadata } from 'next';
import { StoryPage } from '@/components/story-page';
import { ButtonLink } from '@/components/ui/button';
import { COLOURS } from '@/lib/house';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Silk and linen cloth: ${COLOURS.silk} silk and ${COLOURS.linen} linen colours`,
    description:
      'The cloths LINSILK makes in: pure silk (plain, jacquard, brocade) and pure linen. How they feel, how they wear, how to care for them, and all 88 colours.',
    alternates: { canonical: '/cloth' },
  };
}

export default function ClothPage() {
  return (
    <StoryPage storyKey="cloth">
      <ButtonLink href="/care/questions" variant="rule">
        Ask for a cutting
      </ButtonLink>
    </StoryPage>
  );
}
