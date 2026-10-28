'use client';

import { useActionState, useState } from 'react';
import { deleteAccountAction } from '@/lib/account-actions';
import { Button } from '@/components/ui/button';
import styles from '@/app/account/account.module.css';
import { accountText } from '@/lib/i18n-account';
import { useLang } from '@/lib/use-lang';

export function DeleteAccount() {
  const t = accountText(useLang()).form;
  const [confirming, setConfirming] = useState(false);
  const [state, formAction, pending] = useActionState(deleteAccountAction, {});

  return (
    <div className={styles.danger}>
      <p className={styles.dangerNote}>
        {t.deleteNote}
      </p>

      {!confirming ? (
        <Button type="button" variant="outline" onClick={() => setConfirming(true)}>
          {t.closeMine}
        </Button>
      ) : (
        <form action={formAction} className={styles.form} style={{ marginTop: 0 }}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="delete-password">
              {t.confirmPassword}
            </label>
            <input
              id="delete-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className={styles.input}
            />
          </div>
          {state.error && <p className={styles.error}>{state.error}</p>}
          <div className={styles.actions}>
            <Button type="submit" variant="solid" disabled={pending}>
              {pending ? t.closing : t.closeForever}
            </Button>
            <button type="button" onClick={() => setConfirming(false)} className={styles.switch}>
              {t.cancel}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
