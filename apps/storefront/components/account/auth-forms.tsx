'use client';

/* Sign in, or open an account. Two tabs over one shape of form — there is no
   reason to split them into separate pages when switching is one click. */

import { useActionState, useState } from 'react';
import { loginAction, registerAction } from '@/lib/account-actions';
import { Button } from '@/components/ui/button';
import styles from '@/app/account/account.module.css';
import { accountText } from '@/lib/i18n-account';
import { useLang } from '@/lib/use-lang';

export function AuthForms() {
  const t = accountText(useLang()).form;
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [loginState, loginFormAction, loginPending] = useActionState(loginAction, {});
  const [registerState, registerFormAction, registerPending] = useActionState(registerAction, {});

  return (
    <>
      <div className={styles.tabs} role="tablist">
        <button
          type="button"
          role="tab"
          className={styles.tab}
          data-active={tab === 'login'}
          aria-selected={tab === 'login'}
          onClick={() => setTab('login')}
        >
          {t.signIn}
        </button>
        <button
          type="button"
          role="tab"
          className={styles.tab}
          data-active={tab === 'register'}
          aria-selected={tab === 'register'}
          onClick={() => setTab('register')}
        >
          {t.open}
        </button>
      </div>

      {tab === 'login' ? (
        <form action={loginFormAction} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="login-email">
              {t.email}
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className={styles.input}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="login-password">
              {t.password}
            </label>
            <input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className={styles.input}
            />
          </div>
          {loginState.error && <p className={styles.error}>{loginState.error}</p>}
          <div className={styles.actions}>
            <Button type="submit" disabled={loginPending}>
              {loginPending ? t.signingIn : t.signIn}
            </Button>
            <a href="/account/reset-password" className={styles.switch}>
              {t.forgot}
            </a>
          </div>
        </form>
      ) : (
        <form action={registerFormAction} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="register-name">
              {t.name}
            </label>
            <input id="register-name" name="name" type="text" autoComplete="name" required className={styles.input} />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="register-email">
              {t.email}
            </label>
            <input
              id="register-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className={styles.input}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="register-password">
              {t.password}
            </label>
            <input
              id="register-password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              className={styles.input}
            />
            <span className={styles.note}>{t.eight}</span>
          </div>
          {registerState.error && <p className={styles.error}>{registerState.error}</p>}
          <div className={styles.actions}>
            <Button type="submit" disabled={registerPending}>
              {registerPending ? t.opening : t.open}
            </Button>
          </div>
        </form>
      )}
    </>
  );
}
