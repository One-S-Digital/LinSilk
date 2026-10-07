import type { Metadata } from 'next';
import { StoryPage } from '@/components/story-page';
import { ButtonLink } from '@/components/ui/button';
import { getStoryPage } from '@/lib/payload';

export async function generateMetadata(): Promise<Metadata> {
  const story = await getStoryPage('cloth');
  return { title: story.title, description: story.lead };
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
