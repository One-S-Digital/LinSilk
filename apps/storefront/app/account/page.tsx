import type { Metadata } from 'next';
import { DocPage } from '@/components/doc-page';
import { Button, ButtonLink } from '@/components/ui/button';
import { AuthForms } from '@/components/account/auth-forms';
import { logoutAction } from '@/lib/account-actions';
import { fromLineItemMetadata } from '@/lib/measurements';
import { getCustomer } from '@/lib/session';
import styles from './account.module.css';

export const metadata: Metadata = {
  title: 'Account',
  description:
    'Your orders, your saved measurement profile, and the patterns the atelier holds for you.',
};

export default async function AccountPage(props: PageProps<'/account'>) {
  const customer = await getCustomer();
  const params = await props.searchParams;

  if (!customer) {
    return (
      <DocPage
        eyebrow="The house"
        title="Your account"
        lead={
          params.closed
            ? 'Your account is closed. Anything already ordered stays reachable the way a guest’s does, from the link in its confirmation email.'
            : 'An account holds the fifteen measurements so you never type them twice, keeps every order and its production status, and records the paper patterns the atelier has drawn for you.'
        }
      >
        <AuthForms />
      </DocPage>
    );
  }

  const { values } = fromLineItemMetadata(customer.metadata);
  const taken = Object.keys(values).length;

  return (
    <DocPage
      eyebrow="The house"
      title={`Welcome back${customer.first_name ? `, ${customer.first_name}` : ''}`}
      lead={customer.email}
      foot={
        <>
          <ButtonLink href="/collection" variant="outline">
            Enter the collection
          </ButtonLink>
          <form action={logoutAction}>
            <Button type="submit" variant="solid">
              Sign out
            </Button>
          </form>
        </>
      }
    >
      <div className={styles.grid}>
        <div className={styles.card}>
          <span className={styles.cardTitle}>Your measurements</span>
          <span className={styles.cardNote}>
            {taken > 0 ? `${taken} of 15 saved.` : 'Nothing saved yet.'} Used on every piece page
            and in Design Your Own, so it is never typed twice.
          </span>
          <ButtonLink href="/account/measurements" variant="rule">
            {taken > 0 ? 'Review your sheet' : 'Save your sheet'}
          </ButtonLink>
        </div>
        <div className={styles.card}>
          <span className={styles.cardTitle}>Your orders</span>
          <span className={styles.cardNote}>
            Every reservation and commission, and its confirmed sheet.
          </span>
          <ButtonLink href="/account/orders" variant="rule">
            View orders
          </ButtonLink>
        </div>
        <div className={styles.card}>
          <span className={styles.cardTitle}>Settings</span>
          <span className={styles.cardNote}>
            Your name and phone, your password, your saved addresses.
          </span>
          <ButtonLink href="/account/settings" variant="rule">
            Manage settings
          </ButtonLink>
        </div>
      </div>
    </DocPage>
  );
}
