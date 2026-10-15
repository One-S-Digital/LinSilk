'use client';

/* Shown on the account page until the address is confirmed. */

import { useActionState } from 'react';
import { resendVerificationAction } from '@/lib/account-actions';
import { Button } from '@/components/ui/button';
import styles from '@/app/account/account.module.css';

export function VerifyEmailBanner({ email }: { email: string }) {
  const [state, action, pending] = useActionState(resendVerificationAction, {});
  return (
    <form action={action} className={styles.card}>
      <span className={styles.cardTitle}>Confirm your email</span>
      <span className={styles.cardNote}>
        We sent a link to {email}. Until it is opened, your name, phone, measurements and addresses
        cannot be changed.
      </span>
      {state.error && <p role="alert">{state.error}</p>}
      {state.sent ? (
        <span className={styles.cardNote}>Sent again. Check your inbox.</span>
      ) : (
        <Button type="submit" variant="outline" disabled={pending}>
          {pending ? 'Sending…' : 'Send the link again'}
        </Button>
      )}
    </form>
  );
}
