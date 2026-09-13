'use client';

import { useActionState } from 'react';
import { updateProfileAction } from '@/lib/account-actions';
import { Button } from '@/components/ui/button';
import type { ApiCustomer } from '@/lib/session';
import styles from '@/app/account/account.module.css';

export function ProfileForm({ customer }: { customer: ApiCustomer }) {
  const [state, formAction, pending] = useActionState(updateProfileAction, {});

  return (
    <form action={formAction} className={styles.form}>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="profile-first-name">
          First name
        </label>
        <input
          id="profile-first-name"
          name="first_name"
          type="text"
          defaultValue={customer.first_name ?? ''}
          required
          className={styles.input}
        />
      </div>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="profile-last-name">
          Last name
        </label>
        <input
          id="profile-last-name"
          name="last_name"
          type="text"
          defaultValue={customer.last_name ?? ''}
          className={styles.input}
        />
      </div>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="profile-phone">
          Phone
        </label>
        <input
          id="profile-phone"
          name="phone"
          type="tel"
          defaultValue={customer.phone ?? ''}
          className={styles.input}
        />
        <span className={styles.note}>For the courier, if a delivery needs a word with you.</span>
      </div>
      {state.error && <p className={styles.error}>{state.error}</p>}
      {state.saved && <p className={styles.note}>Saved.</p>}
      <div className={styles.actions}>
        <Button type="submit" variant="outline" disabled={pending}>
          {pending ? 'Saving…' : 'Save changes'}
        </Button>
      </div>
    </form>
  );
}
