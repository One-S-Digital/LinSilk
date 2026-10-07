import type { Metadata } from 'next';
import { StoryPage } from '@/components/story-page';
import { ButtonLink } from '@/components/ui/button';
import { getStoryPage } from '@/lib/payload';

export async function generateMetadata(): Promise<Metadata> {
  const story = await getStoryPage('contact');
  return { title: story.title, description: story.lead };
}

export default function ContactPage() {
  return (
    <StoryPage storyKey="contact">
      <ButtonLink href="mailto:hello@linsilk.ch" variant="outline">
        hello@linsilk.ch
      </ButtonLink>
      <ButtonLink href="/care/measuring" variant="rule">
        Measurement help
      </ButtonLink>
    </StoryPage>
  );
}
