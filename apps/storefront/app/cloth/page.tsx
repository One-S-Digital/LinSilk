import type { Metadata } from 'next';
import { StoryPage } from '@/components/story-page';
import { ButtonLink } from '@/components/ui/button';
import { COLOURS } from '@/lib/house';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Silk, linen and high frequency fabrics: ${COLOURS.silk} silk, ${COLOURS.linen} linen and ${COLOURS.cashmere} cashmere colours`,
    description:
      'The cloths LINSILK makes in: pure silk (plain, jacquard, brocade), pure linen and cashmere. How they feel, how they wear, how to care for them, and all 100 colours.',
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
