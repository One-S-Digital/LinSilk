'use client';

/* Two states of the one page: asking for the link, and using it. Which one
   shows is just whether a token arrived on the URL. */

import { useActionState } from 'react';
import { completePasswordResetAction, requestPasswordResetAction } from '@/lib/account-actions';
import { Button } from '@/components/ui/button';
import styles from '@/app/account/account.module.css';

export function RequestResetForm() {
  const [state, formAction, pending] = useActionState(requestPasswordResetAction, {});

  if (state.sent) {
    return (
      <p className={styles.note} style={{ marginTop: 28 }}>
        If that email has an account, a link to reset its password is on its way — it
        works for fifteen minutes.
      </p>
    );
  }

  return (
    <form action={formAction} className={styles.form}>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="reset-email">
          Email
        </label>
        <input id="reset-email" name="email" type="email" autoComplete="email" required className={styles.input} />
      </div>
      {state.error && <p className={styles.error}>{state.error}</p>}
      <div className={styles.actions}>
        <Button type="submit" disabled={pending}>
          {pending ? 'Sending…' : 'Send the link'}
        </Button>
      </div>
    </form>
  );
}

export function CompleteResetForm({ token, email }: { token: string; email: string }) {
  const [state, formAction, pending] = useActionState(completePasswordResetAction, {});

  return (
    <form action={formAction} className={styles.form}>
      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="email" value={email} />
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
      <div className={styles.actions}>
        <Button type="submit" disabled={pending}>
          {pending ? 'Saving…' : 'Set the new password'}
        </Button>
      </div>
    </form>
  );
}
