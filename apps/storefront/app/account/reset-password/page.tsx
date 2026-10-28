import type { Metadata } from 'next';
import { accountText } from '@/lib/i18n-account';
import { serverLang } from '@/lib/server-lang';
import { DocPage } from '@/components/doc-page';
import { CompleteResetForm, RequestResetForm } from '@/components/account/reset-password-form';

export async function generateMetadata(): Promise<Metadata> {
  const t = accountText(await serverLang()).reset;
  return { title: t.metaTitle, description: t.metaDescription };
}

export default async function ResetPasswordPage(props: PageProps<'/account/reset-password'>) {
  const a = accountText(await serverLang());
  const t = a.reset;
  const params = await props.searchParams;
  const token = typeof params.token === 'string' ? params.token : null;
  const email = typeof params.email === 'string' ? params.email : null;

  return (
    <DocPage
      eyebrow={a.eyebrow}
      title={t.title}
      lead={
        token && email ? t.leadToken : t.lead
      }
    >
      {token && email ? <CompleteResetForm token={token} email={email} /> : <RequestResetForm />}
    </DocPage>
  );
}
