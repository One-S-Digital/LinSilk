import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { DocPage } from '@/components/doc-page';
import { ProfileForm } from '@/components/account/profile-form';
import { PasswordForm } from '@/components/account/password-form';
import { AddressBook } from '@/components/account/address-book';
import { DeleteAccount } from '@/components/account/delete-account';
import { getAddresses, getCustomer } from '@/lib/session';
import styles from '../account.module.css';

export const metadata: Metadata = {
  title: 'Settings',
  description: 'Your details, your password, your addresses.',
};

export default async function SettingsPage() {
  const customer = await getCustomer();
  if (!customer) redirect('/account');

  const addresses = await getAddresses();

  return (
    <DocPage eyebrow="Your account" title="Settings" lead="Your details, your password, your addresses.">
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Your details</h2>
        <ProfileForm customer={customer} />
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Password</h2>
        <PasswordForm />
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Addresses</h2>
        <p className={styles.sectionNote}>
          Saved here for next time — checkout still asks you to confirm one.
        </p>
        <AddressBook addresses={addresses} />
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Close your account</h2>
        <DeleteAccount />
      </section>
    </DocPage>
  );
}
