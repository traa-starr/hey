// Line icons: tabs, tools, and one glyph per voice habit.
import type { Glyph } from "../content/schema";

const svg = (d: React.ReactNode) => <svg viewBox="0 0 24 24" aria-hidden="true">{d}</svg>;

export const Icon = {
  home: svg(<path d="M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1z" />),
  learn: svg(<><path d="M3 7l9-4 9 4-9 4z" /><path d="M7 9v5c0 1.7 2.2 3 5 3s5-1.3 5-3V9" /><path d="M21 7v6" /></>),
  practice: svg(<><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r=".6" /></>),
  you: svg(<><circle cx="8" cy="9" r="3.5" /><circle cx="16.5" cy="14" r="4.5" /><circle cx="8" cy="18" r="2" /></>),
  close: svg(<path d="M6 6l12 12M18 6L6 18" />),
  back: svg(<path d="M15 5l-7 7 7 7" />),
  arrow: svg(<path d="M5 12h14M13 6l6 6-6 6" />),
  speaker: svg(<><path d="M4 10v4h4l5 4V6L8 10z" /><path d="M16.5 9a4 4 0 0 1 0 6M19 6.5a7.5 7.5 0 0 1 0 11" /></>),
  catch: svg(<><path d="M12 3v3M12 18v3M3 12h3M18 12h3" /><circle cx="12" cy="12" r="5" /></>),
  answer: svg(<path d="M5 6h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-7l-5 4v-4H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" />),
  breathe: svg(<><path d="M4 12c3-5 13-5 16 0-3 5-13 5-16 0z" /><circle cx="12" cy="12" r="2" /></>),
  check: svg(<><circle cx="8" cy="9" r="4" /><circle cx="16" cy="15" r="5" /></>),
  tot: svg(<><circle cx="8" cy="12" r="5" /><circle cx="16" cy="12" r="5" /></>),
  book: svg(<><path d="M5 4h10a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z" /><path d="M5 17a3 3 0 0 1 3-3h10" /></>),
  gear: svg(<><circle cx="12" cy="12" r="3" /><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4" /></>),
  more: svg(<><circle cx="5" cy="12" r="1.3" /><circle cx="12" cy="12" r="1.3" /><circle cx="19" cy="12" r="1.3" /></>),
  sun: svg(<><circle cx="12" cy="13" r="4" /><path d="M12 4v2M5 13H3M21 13h-2M6.3 7.3l1.4 1.4M17.7 7.3l-1.4 1.4M4 19h16" /></>),
  heart: svg(<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />),
  path: svg(<><path d="M5 19c4-1 3-6 7-7s3-6 7-7" /><circle cx="5" cy="19" r="1.5" /><circle cx="19" cy="5" r="1.5" /></>)
};

export const GLYPH: Record<Glyph, React.ReactNode> = {
  ruler: svg(<><rect x="3" y="8" width="18" height="8" rx="1.5" /><path d="M7 8v3M11 8v4M15 8v3M19 8v2" /></>),
  eye: svg(<><path d="M2 12c3-6 17-6 20 0-3 6-17 6-20 0z" /><circle cx="12" cy="12" r="3" /></>),
  loop: svg(<><path d="M4 12a6 6 0 0 1 10-4.5L16 9" /><path d="M20 12a6 6 0 0 1-10 4.5L8 15" /><path d="M16 5v4h-4M8 19v-4h4" /></>),
  cloud: svg(<><path d="M7 16a4 4 0 0 1 .5-8 5 5 0 0 1 9.5 1.5A3.5 3.5 0 0 1 17 16z" /><path d="M12 16l-2 4h3l-2 3" /></>),
  scales: svg(<><path d="M12 4v16M5 20h14M6 8h12" /><path d="M6 8l-3 6h6zM18 8l-3 6h6z" /></>),
  tag: svg(<><path d="M3 12V4h8l10 10-8 8z" /><circle cx="7.5" cy="8.5" r="1.5" /></>),
  shrink: svg(<><path d="M4 14h6v6M20 10h-6V4" /><path d="M14 10l7-7M3 21l7-7" /></>),
  target: svg(<><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" /><path d="M12 2v4M12 18v4" /></>),
  split: svg(<><circle cx="12" cy="12" r="8" /><path d="M12 4v16" /><path d="M12 4a8 8 0 0 0 0 16z" fill="currentColor" stroke="none" /></>),
  wave: svg(<path d="M2 12c2.5-4 5-4 7.5 0s5 4 7.5 0 3.5-3 5-2" />)
};
