import type { Metadata } from 'next';
import { StoryPage } from '@/components/story-page';
import { ButtonLink } from '@/components/ui/button';
import { STORY } from '@/lib/catalog';

export const metadata: Metadata = {
  title: STORY.atelier.title,
  description: STORY.atelier.lead,
};

export default function AtelierPage() {
  return (
    <StoryPage storyKey="atelier">
      <ButtonLink href="/collection" variant="rule">
        See what the bench made this season
      </ButtonLink>
      <ButtonLink href="/design" variant="rule">
        Begin a commission
      </ButtonLink>
    </StoryPage>
  );
}
