import type { Metadata } from 'next';
import { accountText } from '@/lib/i18n-account';
import { serverLang } from '@/lib/server-lang';
import { redirect } from 'next/navigation';
import { DocPage } from '@/components/doc-page';
import { ProfileForm } from '@/components/account/profile-form';
import { PasswordForm } from '@/components/account/password-form';
import { AddressBook } from '@/components/account/address-book';
import { DeleteAccount } from '@/components/account/delete-account';
import { getAddresses, getCustomer } from '@/lib/session';
import styles from '../account.module.css';

export async function generateMetadata(): Promise<Metadata> {
  const t = accountText(await serverLang()).settings;
  return { title: t.metaTitle, description: t.description };
}

export default async function SettingsPage() {
  const a = accountText(await serverLang());
  const t = a.settings;
  const customer = await getCustomer();
  if (!customer) redirect('/account');

  const addresses = await getAddresses();

  return (
    <DocPage eyebrow={a.yourAccount} title={t.metaTitle} lead={t.description}>
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t.details}</h2>
        <ProfileForm customer={customer} />
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t.password}</h2>
        <PasswordForm />
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t.addresses}</h2>
        <p className={styles.sectionNote}>
          {t.addressesNote}
        </p>
        <AddressBook addresses={addresses} />
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t.close}</h2>
        <DeleteAccount />
      </section>
    </DocPage>
  );
}
