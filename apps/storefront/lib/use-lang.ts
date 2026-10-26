'use client';

import { usePathname } from 'next/navigation';
import { langFromPath, type Lang } from './i18n';

/** The language of the page being shown, read from its address so the server
    render and the browser agree. */
export function useLang(): Lang {
  return langFromPath(usePathname());
}
