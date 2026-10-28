import type { ReactNode } from 'react';
import { InitialLangProvider } from '@/lib/initial-lang';
import { serverLang } from '@/lib/server-lang';

/* These pages have one address for every language, so the server reads the
   reader's remembered language and renders in it. */
export default async function Layout({ children }: { children: ReactNode }) {
  return <InitialLangProvider lang={await serverLang()}>{children}</InitialLangProvider>;
}
