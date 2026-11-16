import type { ReactNode } from 'react';

/* The care guide's icon set, drawn for the house rather than borrowed.
 *
 * One 24-unit grid, round caps and joins, currentColor, no fills except the
 * iron dots and letters. The stroke is kept at a fixed hairline whatever the
 * size, so a 56 px step illustration and a 22 px chip read as one family.
 * The care symbols follow the ISO 3758 shapes (tub, triangle, square, iron,
 * circle) in our own line, as explanations, not as a label. */

const T = (s: string, y = 17.6, size = 6.2) => (
  <text
    x="12"
    y={y}
    textAnchor="middle"
    fontSize={size}
    fill="currentColor"
    stroke="none"
    style={{ fontFamily: 'var(--font-sans)', fontWeight: 400, letterSpacing: 0 }}
  >
    {s}
  </text>
);

const CROSS = <path d="M3 3.5 21 20.5M21 3.5 3 20.5" />;

const TUB = (
  <>
    <path d="M2.5 9.5q2.375-2.2 4.75 0t4.75 0 4.75 0 4.75 0" />
    <path d="M2.5 9.5 4.6 19.5h14.8l2.1-10" />
  </>
);
const BAR1 = <path d="M5 21.6h14" />;
const BAR2 = <path d="M5 21.6h14M5 23.3h14" />;
const HAND = <path d="M9.6 17.6v-3.9m2-.9v4.8m2-4.4v4.4m2-2.9v2.9m-6 0c0 1.1 6 1.1 6 0" />;

const SQUARE = <rect x="3.5" y="3.5" width="17" height="17" rx="1" />;
const SHADE = <path d="M3.5 8 8 3.5M3.5 11.5l8-8" />;

const IRON_BODY = (
  <>
    <path d="M2.5 18.5 4.6 12.4c.5-1.3 1.5-1.9 2.9-1.9h13v8z" />
    <path d="M9 10.5v-2c0-1.2.8-2 2-2h9.5v4" />
  </>
);
const dot = (x: number) => <circle cx={x} cy="14.9" r="1" fill="currentColor" stroke="none" />;

const CIRCLE = <circle cx="12" cy="12" r="8.5" />;

const BASIN = (
  <>
    <path d="M3 11h18c0 5-3.5 8.5-9 8.5S3 16 3 11z" />
    <path d="M6 13.6q1.5-1 3 0t3 0 3 0 3 0M9.5 19.4v1.6h5v-1.6" />
  </>
);

const SHIRT = (
  <path d="M8 4 4 6.5l1.5 3.5L7 9.3V20h10V9.3l1.5.7L20 6.5 16 4c-.7 1.3-2.2 2-4 2s-3.3-.7-4-2z" />
);

const HOOK = <path d="M12 7.2V6a1.8 1.8 0 1 1 1.8-1.8" />;

const IRON_SMALL = (
  <>
    <path d="M5 13 6.4 9.3c.4-1 1-1.5 2.1-1.5H18V13z" />
    <path d="M10 7.8V6.4c0-.9.6-1.5 1.5-1.5H18v2.9" />
  </>
);

const SPRAY = (
  <path d="M8 10h6v10a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1zm1 0V6.5h5.5V10m0-2.5H16m2.5-1.5h0m1 2.2h0m-1 2.2h0" />
);

const DROP = <path d="M12 3.5S6 10.5 6 14.5a6 6 0 0 0 12 0c0-4-6-11-6-11z" />;

const ICONS = {
  /* ---- care symbols ---- */
  wash30: <>{TUB}{T('30')}</>,
  wash30Gentle: <>{TUB}{T('30')}{BAR1}</>,
  wash30Wool: <>{TUB}{T('30')}{BAR2}</>,
  washHand: <>{TUB}{HAND}</>,
  noWash: <>{TUB}{CROSS}</>,
  bleachAny: <path d="M12 3.5 21.5 20h-19z" />,
  noBleach: <><path d="M12 3.5 21.5 20h-19z" />{CROSS}</>,
  tumble: <>{SQUARE}<circle cx="12" cy="12" r="6" /></>,
  noTumble: <>{SQUARE}<circle cx="12" cy="12" r="6" />{CROSS}</>,
  lineDry: <>{SQUARE}<path d="M12 7v10" /></>,
  lineDryShade: <>{SQUARE}<path d="M14 7.5v9.5" />{SHADE}</>,
  dripDry: <>{SQUARE}<path d="M8 7v10m4-10v10m4-10v10" /></>,
  dryFlat: <>{SQUARE}<path d="M7 12h10" /></>,
  dryFlatShade: <>{SQUARE}<path d="M7.5 14h10" />{SHADE}</>,
  iron1: <>{IRON_BODY}{dot(13.5)}</>,
  iron2: <>{IRON_BODY}{dot(11.5)}{dot(15.5)}</>,
  iron3: <>{IRON_BODY}{dot(9.8)}{dot(13.5)}{dot(17.2)}</>,
  noIron: <>{IRON_BODY}{CROSS}</>,
  dryCleanP: <>{CIRCLE}{T('P', 14.4, 7)}</>,
  dryCleanF: <>{CIRCLE}{T('F', 14.4, 7)}</>,
  wetCleanW: <>{CIRCLE}{T('W', 14.4, 7)}</>,
  noDryClean: <>{CIRCLE}{CROSS}</>,

  /* ---- washing ---- */
  basin: BASIN,
  soak: (
    <>
      {BASIN}
      <circle cx="9" cy="7" r="1" />
      <circle cx="12.6" cy="5" r=".8" />
      <circle cx="15.4" cy="7.6" r=".6" />
    </>
  ),
  bottle: (
    <path d="M9 8h6v12a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 20zm1.5 0V5h3v3M10 3h4v2h-4zm-1 10h6" />
  ),
  swirl: (
    <>
      <path d="M18 12a6 6 0 1 1-1.8-4.3" />
      <path d="M16.6 4.5 16.2 7.8l3.2.2" />
      <path d="M14.6 12a2.6 2.6 0 1 1-1-2" />
    </>
  ),
  rinse: (
    <path d="M3 7h10c2.2 0 3.5 1.3 3.5 3.5v1M8 7V4.5M6 4.5h4m6.5 10v1m0 2.5v1M14 16.5v1M10 21h11" />
  ),
  pressPalms: (
    <>
      <path d="M6 10V6.5C6 5 7 4 8.5 4h7C17 4 18 5 18 6.5V10zm0 4h12v3.5c0 1.5-1 2.5-2.5 2.5h-7C7 20 6 19 6 17.5z" />
      <path d="M3 12q2.25-1.2 4.5 0t4.5 0 4.5 0 4.5 0" />
    </>
  ),
  towelRoll: <path d="M13.5 12a1.5 1.5 0 1 0-3 0 3 3 0 1 0 6 0 4.5 4.5 0 1 0-9 0 6 6 0 0 0 6 6H21" />,
  meshBag: (
    <path d="M5 6h14v14H5zm0 0c3-2.2 11-2.2 14 0M5 10.7h14M5 15.3h14M9.7 6v14m4.6-14v14" />
  ),
  similar: (
    <>
      <circle cx="9" cy="12" r="5.5" />
      <circle cx="15" cy="12" r="5.5" />
    </>
  ),
  insideOut: (
    <>
      {SHIRT}
      <path d="M10 15.5a2.3 2.3 0 1 1 3.9 1.6" />
      <path d="M14.3 15.2 13.9 17.3 11.9 17" />
    </>
  ),
  shake: (
    <>
      <g transform="translate(12 12) scale(.82) translate(-12 -12)">{SHIRT}</g>
      <path d="M1.8 9.5 3.3 11 1.8 12.5m20.4-3L20.7 11l1.5 1.5" />
    </>
  ),
  blot: (
    <path d="M6 4h12v7H6zm2 7v2.5h8V11m-4 2.5V16m-4.5 3.2c0-.9 2-1.6 4.5-1.6s4.5.7 4.5 1.6-2 1.6-4.5 1.6-4.5-.7-4.5-1.6z" />
  ),

  /* ---- drying ---- */
  shade: (
    <path d="M3 11c0-4.5 4-7.5 9-7.5s9 3 9 7.5c-1.5-1.2-3-1.2-4.5 0-1.5-1.2-3-1.2-4.5 0-1.5-1.2-3-1.2-4.5 0-1.5-1.2-3-1.2-4.5 0zm9 0v8.5a1.5 1.5 0 0 1-3 0" />
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  hangerPadded: (
    <>
      {HOOK}
      <path d="M12 7.2 3.6 13.4c-.9.7-.5 2.1.7 2.1h15.4c1.2 0 1.6-1.4.7-2.1z" />
      <path d="M4 15.5h16v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" />
    </>
  ),
  hangerWide: (
    <>
      {HOOK}
      <path d="M12 7.2 2.5 14h19zM2.5 14v2.6H6V14m15.5 0v2.6H18V14" />
    </>
  ),
  hangerClip: (
    <>
      {HOOK}
      <path d="M12 7.2V9.5M3.5 9.5h17M5 9.5h3v3.5H5zm11 0h3v3.5h-3zM6 13l-1 8h6l1-5 1 5h6l-1-8" />
    </>
  ),
  roll: <path d="M14 12a2 2 0 1 0-4 0 4 4 0 1 0 8 0 6 6 0 1 0-12 0 8 8 0 0 0 8 8" />,

  /* ---- pressing ---- */
  pressCloth: (
    <>
      {IRON_SMALL}
      <path d="M2.5 15.5h19M2.5 19q2.4-1 4.75 0t4.75 0 4.75 0 4.75 0" />
    </>
  ),
  steamer: (
    <path d="M4 5.5h7v4H4zm2 4L7.5 20H10L9 9.5M14 4.5c1 1-1 2 0 3m3-4c1 1-1 2 0 3m-3 3c1 1-1 2 0 3M21 3v18" />
  ),
  spray: SPRAY,
  noSpray: <>{SPRAY}{CROSS}</>,
  crease: (
    <path d="M3 7c4-2 6 2 9 0s5-2 9 0M3 12c4-2 6 2 9 0s5-2 9 0M3 17c4-2 6 2 9 0s5-2 9 0" />
  ),
  noShine: (
    <>
      <path d="M12 3.5 13.4 10.6 20.5 12l-7.1 1.4L12 20.5l-1.4-7.1L3.5 12l7.1-1.4z" />
      {CROSS}
    </>
  ),
  shower: <path d="M5 4h6c3 0 5 2 5 5v1m-3 0h6m-5 3v1.5m2-1.5v1.5m2-1.5v1.5M15 17v1.5m2-1.5v1.5" />,

  /* ---- wearing ---- */
  perfume: (
    <path d="M7 10h10v9.5a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 7 19.5zm3.5 0V7.5h3V10M10 4.5h4v3h-4zm7.2.3h0m2 1.6h0m-1.2 2.2h0" />
  ),
  air: <path d="M3 9h11a2.5 2.5 0 1 0-2.5-2.5M3 13h15a2.5 2.5 0 1 1-2.5 2.5M3 17h7" />,
  rest: <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2m0 15v2M2.5 12h2m15 0h2M5.3 5.3l1.4 1.4m10.6 10.6 1.4 1.4m0-13.4-1.4 1.4M6.7 17.3l-1.4 1.4" />
    </>
  ),
  brush: <path d="M3 9h18v3H3zm2 3v4m3-4v4m3-4v4m3-4v4m3-4v4m2.5-4v4M7 9c0-2.5 2-3.5 5-3.5s5 1 5 3.5" />,
  comb: <path d="M3 8h18v3H3zm1.5 3v6m2.5-6v6m2.5-6v6m2.5-6v6m2.5-6v6m2.5-6v6m2.5-6v6" />,
  tie: <path d="M10 3h4l-1 3.5h-2zm1 3.5L8.5 17l3.5 4 3.5-4L13 6.5" />,

  /* ---- keeping ---- */
  bag: <path d="M6 3.5h12a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-16a1 1 0 0 1 1-1zM12 3.5V2m0 4v13" />,
  dark: <path d="M4 3h16v18H4zm8 0v18m-2-10v2m4-2v2" />,
  fold: <path d="M4 15h16v4H4zm1-4h14v4M6 7h12v4" />,
  cedar: (
    <path d="M4 7l8-3.5L20 7v10l-8 3.5L4 17zm0 0 8 3.5L20 7m-8 3.5v10M7 12.5q1.5 1 0 2.2m9.5-2.2q-1.5 1 0 2.2" />
  ),
  travel: <path d="M4 8h16v12H4zm5 0V5h6v3M8 8v12m8-12v12" />,
  tissue: <path d="M5 7l7-3 7 3-7 3zm0 0v9l7 3V10m7-3v9l-7 3" />,

  /* ---- stains ---- */
  wine: <path d="M7.5 3h9c0 4.5-1.5 7.5-4.5 7.5S7.5 7.5 7.5 3zM8 5.5h8M12 10.5V19m-3.5 1.5h7" />,
  coffee: (
    <path d="M4 9h12v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4zm12 2h2a2 2 0 0 1 0 4h-2M8 6c-.7-1 .7-2 0-3m4 3c-.7-1 .7-2 0-3" />
  ),
  oil: <path d="M9 9h6l1 11H8zm1.5 0V6L12 4l1.5 2v3" />,
  makeup: <path d="M9 13h6v8H9zm1 0V7l4-2v8m-5.5 0h7" />,
  deodorant: <path d="M8 7h8v14H8zm2 0V4h4v3m4-3h0m1.5 2h0" />,
  droplet: DROP,

  /* ---- interface ---- */
  check: <path d="M5 12.5l5 5 9.5-10.5" />,
  cross: <path d="M6 6l12 12M18 6 6 18" />,
  mail: <path d="M3 6h18v12H3zm0 0 9 7 9-7" />,
  print: <path d="M7 9V3.5h10V9M7 17H4.5V9h15v8H17M7 14h10v7H7z" />,
  arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
  info: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5.5m0-9h0" />
    </>
  ),
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof ICONS;

export const ICON_NAMES = Object.keys(ICONS) as IconName[];

export function CareIcon({
  name,
  size = 24,
  className,
  label,
}: {
  name: IconName;
  size?: number;
  className?: string;
  /** Read out to screen readers; omit when the icon sits beside its own text. */
  label?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={(size >= 40 ? 1.4 : 1.25) * (24 / size)}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      overflow="visible"
    >
      {ICONS[name]}
    </svg>
  );
}
