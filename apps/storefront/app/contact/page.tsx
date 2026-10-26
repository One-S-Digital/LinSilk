import type { Metadata } from 'next';
import { StoryPage } from '@/components/story-page';
import { ButtonLink } from '@/components/ui/button';
import { getStoryPage } from '@/lib/payload';

export async function generateMetadata(): Promise<Metadata> {
  const story = await getStoryPage('contact');
  return {
    title: 'Contact the house',
    description: story.lead,
    alternates: { canonical: '/contact' },
  };
}

export default function ContactPage() {
  return (
    <StoryPage storyKey="contact">
      <ButtonLink href="mailto:hello@bylinsilk.com" variant="outline">
        hello@bylinsilk.com
      </ButtonLink>
      <ButtonLink href="/care/measuring" variant="rule">
        Measurement help
      </ButtonLink>
    </StoryPage>
  );
}
