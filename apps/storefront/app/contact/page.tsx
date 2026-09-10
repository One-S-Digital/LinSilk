import type { Metadata } from 'next';
import { StoryPage } from '@/components/story-page';
import { ButtonLink } from '@/components/ui/button';
import { STORY } from '@/lib/catalog';

export const metadata: Metadata = {
  title: STORY.contact.title,
  description: STORY.contact.lead,
};

export default function ContactPage() {
  return (
    <StoryPage storyKey="contact">
      <ButtonLink href="mailto:hello@maisonayla.ch" variant="outline">
        hello@maisonayla.ch
      </ButtonLink>
      <ButtonLink href="/care/measuring" variant="rule">
        Measurement help
      </ButtonLink>
    </StoryPage>
  );
}
