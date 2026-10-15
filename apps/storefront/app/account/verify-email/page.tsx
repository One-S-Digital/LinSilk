import type { Metadata } from 'next';
import { DocPage } from '@/components/doc-page';
import { ButtonLink } from '@/components/ui/button';
import { MEDUSA_URL, medusaHeaders } from '@/lib/medusa';

export const metadata: Metadata = {
  title: 'Confirm your email',
  description: 'Opening the link from your email confirms the address on your account.',
};

/* The link in the email lands here. The token is the proof, so no session is
   needed; opening it twice does no harm. */
export default async function VerifyEmailPage(props: PageProps<'/account/verify-email'>) {
  const params = await props.searchParams;
  const token = typeof params.token === 'string' ? params.token : '';

  const ok =
    token !== '' &&
    (
      await fetch(`${MEDUSA_URL}/store/email-verification`, {
        method: 'POST',
        headers: { ...medusaHeaders(), 'content-type': 'application/json' },
        body: JSON.stringify({ token }),
        cache: 'no-store',
      }).catch(() => null)
    )?.ok === true;

  return (
    <DocPage
      eyebrow="The house"
      title={ok ? 'Email confirmed' : 'This link did not work'}
      lead={
        ok
          ? 'Your address is confirmed. Your account is fully open.'
          : 'It has expired or was not complete. Sign in and ask for a new one from your account page.'
      }
      foot={
        <ButtonLink href="/account" variant="outline">
          Go to your account
        </ButtonLink>
      }
    >
      {null}
    </DocPage>
  );
}
