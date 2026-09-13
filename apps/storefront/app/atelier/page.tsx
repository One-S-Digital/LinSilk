import type { Metadata } from 'next';
import { StoryPage } from '@/components/story-page';
import { ButtonLink } from '@/components/ui/button';
import { getStoryPage } from '@/lib/payload';

export async function generateMetadata(): Promise<Metadata> {
  const story = await getStoryPage('atelier');
  return { title: story.title, description: story.lead };
}

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
