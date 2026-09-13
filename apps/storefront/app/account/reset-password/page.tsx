import type { Metadata } from 'next';
import { DocPage } from '@/components/doc-page';
import { CompleteResetForm, RequestResetForm } from '@/components/account/reset-password-form';

export const metadata: Metadata = {
  title: 'Reset your password',
  description: 'Ask for a link, or use the one already emailed to you.',
};

export default async function ResetPasswordPage(props: PageProps<'/account/reset-password'>) {
  const params = await props.searchParams;
  const token = typeof params.token === 'string' ? params.token : null;
  const email = typeof params.email === 'string' ? params.email : null;

  return (
    <DocPage
      eyebrow="The house"
      title="Reset your password"
      lead={
        token && email
          ? 'Choose a new password. This link works once, and only for fifteen minutes from when it was sent.'
          : 'Tell us the email on the account and we will send a link to choose a new one.'
      }
    >
      {token && email ? <CompleteResetForm token={token} email={email} /> : <RequestResetForm />}
    </DocPage>
  );
}
