import type { Metadata } from 'next';
import { StoryPage } from '@/components/story-page';
import { ButtonLink } from '@/components/ui/button';
import { STORY } from '@/lib/catalog';

export const metadata: Metadata = {
  title: STORY.cloth.title,
  description: STORY.cloth.lead,
};

export default function ClothPage() {
  return (
    <StoryPage storyKey="cloth">
      <ButtonLink href="/care/questions" variant="rule">
        Ask for a cutting
      </ButtonLink>
    </StoryPage>
  );
}
