'use client';

import { useActionState } from 'react';
import { changePasswordAction } from '@/lib/account-actions';
import { Button } from '@/components/ui/button';
import styles from '@/app/account/account.module.css';
import { accountText } from '@/lib/i18n-account';
import { useLang } from '@/lib/use-lang';

export function PasswordForm() {
  const t = accountText(useLang()).form;
  const [state, formAction, pending] = useActionState(changePasswordAction, {});

  return (
    <form action={formAction} className={styles.form}>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="current-password">
          {t.currentPassword}
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
          {t.newPassword}
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
        <span className={styles.note}>{t.eight}</span>
      </div>
      {state.error && <p className={styles.error}>{state.error}</p>}
      {state.saved && <p className={styles.note}>{t.changed}</p>}
      <div className={styles.actions}>
        <Button type="submit" variant="outline" disabled={pending}>
          {pending ? t.saving : t.change}
        </Button>
      </div>
    </form>
  );
}
