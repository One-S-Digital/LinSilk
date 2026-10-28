'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { Lang } from './i18n';

/* The reader's remembered language as the server knows it, for pages with one
   address for everyone (cart, checkout, account, order, commission). It is the
   server snapshot of `useLang`, so the server HTML is already in their
   language and nothing flashes English before hydration. */
const InitialLang = createContext<Lang>('en');

export const InitialLangProvider = ({ lang, children }: { lang: Lang; children: ReactNode }) => (
  <InitialLang.Provider value={lang}>{children}</InitialLang.Provider>
);

export const useInitialLang = () => useContext(InitialLang);
