'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { CHROME, LANGUAGE_NAMES } from '@/lib/chrome-i18n';
import { LANG, LOCALES, type Lang } from '@/lib/i18n';
import { isSharedRoute, setLangPref } from '@/lib/lang-pref';
import { switchPath } from '@/lib/locale-routes';
import { useLang } from '@/lib/use-lang';
import styles from './language-menu.module.css';

const ALL: Lang[] = ['en', ...LOCALES];
const SHORT: Record<Lang, string> = { en: 'EN', 'de-ch': 'DE·CH', 'fr-ch': 'FR·CH', de: 'DE', fr: 'FR' };

/* The language drop-down in the header. On pages with a translated address the
   choices are links to the same page in each language (so they can be crawled);
   on the cart, checkout and account pages, which have one address, choosing
   sets the remembered language and refreshes. */
export function LanguageMenu() {
  const lang = useLang();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const t = CHROME[lang];
  const shared = isSharedRoute(pathname);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const choose = (l: Lang) => {
    setLangPref(l);
    setOpen(false);
    router.refresh();
  };

  return (
    <div className={styles.menu} ref={root}>
      <button
        type="button"
        className={styles.button}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={`${t.language}: ${LANGUAGE_NAMES[lang]}`}
        onClick={() => setOpen((o) => !o)}
      >
        {SHORT[lang]}
        <span className={styles.chevron} aria-hidden="true" data-open={open || undefined} />
      </button>
      {open && (
        <ul className={styles.list}>
          {ALL.map((l) => {
            const current = l === lang;
            const label = LANGUAGE_NAMES[l];
            const code = l === 'en' ? 'en' : LANG[l];
            return (
              <li key={l}>
                {shared ? (
                  <button
                    type="button"
                    className={styles.item}
                    aria-current={current || undefined}
                    lang={code}
                    onClick={() => choose(l)}
                  >
                    {label}
                  </button>
                ) : (
                  <Link
                    href={switchPath(pathname, lang, l)}
                    className={styles.item}
                    aria-current={current || undefined}
                    hrefLang={code}
                    lang={code}
                    onClick={() => setOpen(false)}
                  >
                    {label}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
