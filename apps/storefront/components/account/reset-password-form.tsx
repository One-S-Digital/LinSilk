'use client';

/* Two states of the one page: asking for the link, and using it. Which one
   shows is just whether a token arrived on the URL. */

import { useActionState } from 'react';
import { completePasswordResetAction, requestPasswordResetAction } from '@/lib/account-actions';
import { Button } from '@/components/ui/button';
import styles from '@/app/account/account.module.css';
import { accountText } from '@/lib/i18n-account';
import { useLang } from '@/lib/use-lang';

export function RequestResetForm() {
  const t = accountText(useLang()).reset;
  const f = accountText(useLang()).form;
  const [state, formAction, pending] = useActionState(requestPasswordResetAction, {});

  if (state.sent) {
    return (
      <p className={styles.note} style={{ marginTop: 28 }}>
        {t.sent}
      </p>
    );
  }

  return (
    <form action={formAction} className={styles.form}>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="reset-email">
          {f.email}
        </label>
        <input id="reset-email" name="email" type="email" autoComplete="email" required className={styles.input} />
      </div>
      {state.error && <p className={styles.error}>{state.error}</p>}
      <div className={styles.actions}>
        <Button type="submit" disabled={pending}>
          {pending ? t.sending : t.send}
        </Button>
      </div>
    </form>
  );
}

export function CompleteResetForm({ token, email }: { token: string; email: string }) {
  const t = accountText(useLang()).reset;
  const f = accountText(useLang()).form;
  const [state, formAction, pending] = useActionState(completePasswordResetAction, {});

  return (
    <form action={formAction} className={styles.form}>
      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="email" value={email} />
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
        <span className={styles.note}>{f.eight}</span>
      </div>
      {state.error && <p className={styles.error}>{state.error}</p>}
      <div className={styles.actions}>
        <Button type="submit" disabled={pending}>
          {pending ? t.saving : t.set}
        </Button>
      </div>
    </form>
  );
}
