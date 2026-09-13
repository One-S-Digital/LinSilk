'use client';

import { useActionState, useState } from 'react';
import { deleteAccountAction } from '@/lib/account-actions';
import { Button } from '@/components/ui/button';
import styles from '@/app/account/account.module.css';

export function DeleteAccount() {
  const [confirming, setConfirming] = useState(false);
  const [state, formAction, pending] = useActionState(deleteAccountAction, {});

  return (
    <div className={styles.danger}>
      <p className={styles.dangerNote}>
        This closes the account and signs you out everywhere. Your past orders stay on
        record, as they would for a guest — nothing else here is kept.
      </p>

      {!confirming ? (
        <Button type="button" variant="outline" onClick={() => setConfirming(true)}>
          Close my account
        </Button>
      ) : (
        <form action={formAction} className={styles.form} style={{ marginTop: 0 }}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="delete-password">
              Enter your password to confirm
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
              {pending ? 'Closing…' : 'Permanently close my account'}
            </Button>
            <button type="button" onClick={() => setConfirming(false)} className={styles.switch}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
