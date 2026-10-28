'use client';

/* Shown on the account page until the address is confirmed. */

import { useActionState } from 'react';
import { resendVerificationAction } from '@/lib/account-actions';
import { Button } from '@/components/ui/button';
import styles from '@/app/account/account.module.css';
import { accountText } from '@/lib/i18n-account';
import { useLang } from '@/lib/use-lang';

export function VerifyEmailBanner({ email }: { email: string }) {
  const t = accountText(useLang()).verify;
  const [state, action, pending] = useActionState(resendVerificationAction, {});
  return (
    <form action={action} className={styles.card}>
      <span className={styles.cardTitle}>{t.bannerTitle}</span>
      <span className={styles.cardNote}>
        {t.bannerNote(email)}
      </span>
      {state.error && <p role="alert">{state.error}</p>}
      {state.sent ? (
        <span className={styles.cardNote}>{t.sentAgain}</span>
      ) : (
        <Button type="submit" variant="outline" disabled={pending}>
          {pending ? t.sending : t.again}
        </Button>
      )}
    </form>
  );
}
