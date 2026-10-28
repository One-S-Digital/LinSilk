import { cookies } from 'next/headers';
import type { Lang } from './i18n';
import { asLang, LANG_COOKIE } from './lang-pref';

/** The reader's language on a page with one address for every language. */
export async function serverLang(): Promise<Lang> {
  return asLang((await cookies()).get(LANG_COOKIE)?.value);
}
