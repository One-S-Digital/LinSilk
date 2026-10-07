'use client';

import { useActionState } from 'react';
import { changePasswordAction } from '@/lib/account-actions';
import { Button } from '@/components/ui/button';
import styles from '@/app/account/account.module.css';

export function PasswordForm() {
  const [state, formAction, pending] = useActionState(changePasswordAction, {});

  return (
    <form action={formAction} className={styles.form}>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="current-password">
          Current password
        </label>
        <input
          id="current-password"
          name="current_password"
          type="password"
          autoComplete="current-password"
          required
          className={styles.input}
        />
      </div>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="new-password">
          New password
        </label>
        <input
          id="new-password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          className={styles.input}
        />
        <span className={styles.note}>At least eight characters.</span>
      </div>
      {state.error && <p className={styles.error}>{state.error}</p>}
      {state.saved && <p className={styles.note}>Changed.</p>}
      <div className={styles.actions}>
        <Button type="submit" variant="outline" disabled={pending}>
          {pending ? 'Saving…' : 'Change password'}
        </Button>
      </div>
    </form>
  );
}
