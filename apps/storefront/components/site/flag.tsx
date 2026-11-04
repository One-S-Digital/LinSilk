import type { Lang } from '@/lib/i18n';

/* The country behind each language, as inline SVG: emoji flags do not draw on
   Windows. English is the United Kingdom, both Swiss languages are
   Switzerland, and German and French are Germany and France. */
export function Flag({ lang, className }: { lang: Lang; className?: string }) {
  const common = { viewBox: '0 0 30 20', width: 22, height: 15, 'aria-hidden': true, focusable: false, className };
  const frame = <rect x=".5" y=".5" width="29" height="19" fill="none" stroke="rgba(42,38,32,.25)" />;
  switch (lang) {
    case 'de-ch':
    case 'fr-ch':
      return (
        <svg {...common}>
          <rect width="30" height="20" fill="#d52b1e" />
          <path d="M13 4h4v5h5v4h-5v5h-4v-5H8V9h5z" fill="#fff" transform="translate(0 -1.5)" />
          {frame}
        </svg>
      );
    case 'de':
      return (
        <svg {...common}>
          <rect width="30" height="7" fill="#000" />
          <rect y="7" width="30" height="6.5" fill="#dd0000" />
          <rect y="13.5" width="30" height="6.5" fill="#ffce00" />
          {frame}
        </svg>
      );
    case 'fr':
      return (
        <svg {...common}>
          <rect width="10" height="20" fill="#0055a4" />
          <rect x="10" width="10" height="20" fill="#fff" />
          <rect x="20" width="10" height="20" fill="#ef4135" />
          {frame}
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <g>
            <rect width="30" height="20" fill="#012169" />
            <path d="M0 0l30 20M30 0L0 20" stroke="#fff" strokeWidth="4" />
            <path d="M0 0l30 20M30 0L0 20" stroke="#c8102e" strokeWidth="1.6" />
            <path d="M15 0v20M0 10h30" stroke="#fff" strokeWidth="6.5" />
            <path d="M15 0v20M0 10h30" stroke="#c8102e" strokeWidth="3.6" />
          </g>
          {frame}
        </svg>
      );
  }
}
