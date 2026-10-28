import type { Metadata } from 'next';
import { accountText } from '@/lib/i18n-account';
import { serverLang } from '@/lib/server-lang';
import { localHref } from '@/lib/locale-routes';
import { DocPage } from '@/components/doc-page';
import { Button, ButtonLink } from '@/components/ui/button';
import { AuthForms } from '@/components/account/auth-forms';
import { logoutAction } from '@/lib/account-actions';
import { fromLineItemMetadata } from '@/lib/measurements';
import { getCustomer, isEmailVerified } from '@/lib/session';
import { VerifyEmailBanner } from '@/components/account/verify-email-banner';
import styles from './account.module.css';

export async function generateMetadata(): Promise<Metadata> {
  const t = accountText(await serverLang()).home;
  return { title: t.metaTitle, description: t.metaDescription };
}

export default async function AccountPage(props: PageProps<'/account'>) {
  const lang = await serverLang();
  const a = accountText(lang);
  const t = a.home;
  const customer = await getCustomer();
  const params = await props.searchParams;

  if (!customer) {
    return (
      <DocPage
        eyebrow={a.eyebrow}
        title={t.title}
        lead={
          params.closed ? t.closed : t.lead
        }
      >
        <AuthForms />
      </DocPage>
    );
  }

  const verified = await isEmailVerified();
  const { values } = fromLineItemMetadata(customer.metadata);
  const taken = Object.keys(values).length;

  return (
    <DocPage
      eyebrow={a.eyebrow}
      title={`${t.welcome}${customer.first_name ? `, ${customer.first_name}` : ''}`}
      lead={customer.email}
      foot={
        <>
          <ButtonLink href={localHref(lang, '/collection')} variant="outline">
            {t.enter}
          </ButtonLink>
          <form action={logoutAction}>
            <Button type="submit" variant="solid">
              {t.signOut}
            </Button>
          </form>
        </>
      }
    >
      {!verified && <VerifyEmailBanner email={customer.email} />}
      <div className={styles.grid}>
        <div className={styles.card}>
          <span className={styles.cardTitle}>{t.measurements}</span>
          <span className={styles.cardNote}>
            {t.saved(taken)} {t.measurementsNote}
          </span>
          <ButtonLink href="/account/measurements" variant="rule">
            {taken > 0 ? t.review : t.save}
          </ButtonLink>
        </div>
        <div className={styles.card}>
          <span className={styles.cardTitle}>{t.orders}</span>
          <span className={styles.cardNote}>
            {t.ordersNote}
          </span>
          <ButtonLink href="/account/orders" variant="rule">
            {t.viewOrders}
          </ButtonLink>
        </div>
        <div className={styles.card}>
          <span className={styles.cardTitle}>{t.settings}</span>
          <span className={styles.cardNote}>
            {t.settingsNote}
          </span>
          <ButtonLink href="/account/settings" variant="rule">
            {t.manage}
          </ButtonLink>
        </div>
      </div>
    </DocPage>
  );
}
