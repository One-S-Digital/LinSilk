'use client';

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { contactText } from '@/lib/i18n-contact';
import type { Lang } from '@/lib/i18n';
import { medusaFetch } from '@/lib/medusa';
import styles from './contact-form.module.css';

/* The contact form. Every value is sent as JSON and shown by React, never
   written into the page as markup. The `website` field is a trap for
   programs: it is out of sight and out of the tab order, and a person leaves
   it empty. The backend validates and limits again, whatever is checked here. */
export function ContactForm({ lang }: { lang: Lang }) {
  const t = contactText(lang);
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [problem, setProblem] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const value = (key: string) => String(data.get(key) ?? '').trim();
    if (!value('name') || !value('message') || !event.currentTarget.checkValidity()) {
      setProblem(t.invalid);
      return;
    }
    setProblem(null);
    setState('sending');
    try {
      await medusaFetch('/store/contact', {
        method: 'POST',
        json: {
          name: value('name'),
          email: value('email'),
          message: value('message'),
          website: value('website'),
        },
      });
      setState('sent');
    } catch {
      setProblem(t.failed);
      setState('idle');
    }
  }

  if (state === 'sent') {
    return (
      <p className={styles.sent} role="status">
        {t.sent}
      </p>
    );
  }

  return (
    <form className={styles.form} onSubmit={submit} noValidate aria-labelledby="contact-title">
      <h2 id="contact-title" className={styles.title}>
        {t.title}
      </h2>
      <label className={styles.field}>
        <span className={styles.label}>{t.name}</span>
        <input className={styles.input} name="name" required maxLength={200} autoComplete="name" />
      </label>
      <label className={styles.field}>
        <span className={styles.label}>{t.email}</span>
        <input className={styles.input} name="email" type="email" required maxLength={254} autoComplete="email" />
      </label>
      <label className={styles.field}>
        <span className={styles.label}>{t.message}</span>
        <textarea className={styles.input} name="message" required maxLength={5000} rows={6} />
      </label>
      <div className={styles.trap} aria-hidden="true">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      {problem && (
        <p className={styles.problem} role="alert">
          {problem}
        </p>
      )}
      <Button type="submit" variant="solid" disabled={state === 'sending'}>
        {state === 'sending' ? t.sending : t.send}
      </Button>
      <p className={styles.privacy}>{t.privacy}</p>
    </form>
  );
}
