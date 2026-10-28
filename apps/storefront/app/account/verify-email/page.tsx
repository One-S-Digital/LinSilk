import type { Metadata } from 'next';
import { accountText } from '@/lib/i18n-account';
import { serverLang } from '@/lib/server-lang';
import { DocPage } from '@/components/doc-page';
import { ButtonLink } from '@/components/ui/button';
import { MEDUSA_URL, medusaHeaders } from '@/lib/medusa';

export async function generateMetadata(): Promise<Metadata> {
  const t = accountText(await serverLang()).verify;
  return { title: t.metaTitle, description: t.metaDescription };
}

/* The link in the email lands here. The token is the proof, so no session is
   needed; opening it twice does no harm. */
export default async function VerifyEmailPage(props: PageProps<'/account/verify-email'>) {
  const a = accountText(await serverLang());
  const t = a.verify;
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
      eyebrow={a.eyebrow}
      title={ok ? t.ok : t.bad}
      lead={
        ok ? t.okLead : t.badLead
      }
      foot={
        <ButtonLink href="/account" variant="outline">
          {t.go}
        </ButtonLink>
      }
    >
      {null}
    </DocPage>
  );
}
