'use client';

import { useActionState } from 'react';
import { updateProfileAction } from '@/lib/account-actions';
import { Button } from '@/components/ui/button';
import type { ApiCustomer } from '@/lib/session';
import styles from '@/app/account/account.module.css';
import { accountText } from '@/lib/i18n-account';
import { useLang } from '@/lib/use-lang';

export function ProfileForm({ customer }: { customer: ApiCustomer }) {
  const t = accountText(useLang()).form;
  const [state, formAction, pending] = useActionState(updateProfileAction, {});

  return (
    <form action={formAction} className={styles.form}>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="profile-first-name">
          {t.firstName}
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
          {t.lastName}
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
          {t.phone}
        </label>
        <input
          id="profile-phone"
          name="phone"
          type="tel"
          defaultValue={customer.phone ?? ''}
          className={styles.input}
        />
        <span className={styles.note}>{t.phoneNote}</span>
      </div>
      {state.error && <p className={styles.error}>{state.error}</p>}
      {state.saved && <p className={styles.note}>{t.savedOk}</p>}
      <div className={styles.actions}>
        <Button type="submit" variant="outline" disabled={pending}>
          {pending ? t.saving : t.saveChanges}
        </Button>
      </div>
    </form>
  );
}
