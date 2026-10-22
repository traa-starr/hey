// One small illustration per learning path, drawn in the same rounded line language as the habit glyphs.
// They sit on the path's color and draw in currentColor; a path without art falls back to a plain mark.
// Brief and provenance: docs/art/path-marks.brief.md
import type { ReactNode } from "react";
import { Icon } from "./icons";

const art = (d: ReactNode) => (
  <svg className="pa" viewBox="0 0 64 64" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">{d}</svg>
);

export const PATH_ART: Record<string, ReactNode> = {
  // two voices: the loud familiar one, and a smaller one of your own in front of it
  "inner-voice": art(<>
    <path d="M14 10h22a8 8 0 0 1 8 8v8a8 8 0 0 1-8 8H22l-8 7v-7a8 8 0 0 1-8-8v-8a8 8 0 0 1 8-8z" fill="currentColor" fillOpacity=".28" stroke="none" />
    <path d="M14 10h22a8 8 0 0 1 8 8v8a8 8 0 0 1-8 8H22l-8 7v-7a8 8 0 0 1-8-8v-8a8 8 0 0 1 8-8z" strokeOpacity=".55" />
    <path d="M32 31h18a7 7 0 0 1 7 7v6a7 7 0 0 1-7 7h-1v6l-7-6H32a7 7 0 0 1-7-7v-6a7 7 0 0 1 7-7z" fill="currentColor" stroke="none" />
    <path d="M33 41.5c2.5-3 5-3 7.5 0s5 3 7.5 0" stroke="var(--art-bg)" strokeWidth="2.6" />
  </>),
  // the voice map: habits as overlapping rounds of different sizes
  habits: art(<>
    <circle cx="25" cy="27" r="15" fill="currentColor" fillOpacity=".3" stroke="none" />
    <circle cx="43" cy="22" r="9" fill="currentColor" fillOpacity=".55" stroke="none" />
    <circle cx="40" cy="43" r="12" fill="currentColor" stroke="none" />
    <circle cx="17" cy="48" r="6" fill="currentColor" fillOpacity=".7" stroke="none" />
    <circle cx="25" cy="27" r="15" strokeOpacity=".6" />
  </>),
  // a hand mirror, with something kind inside it
  "talk-to-you": art(<>
    <ellipse cx="32" cy="25" rx="17" ry="19" fill="currentColor" fillOpacity=".28" />
    <path d="M32 44v14M25 58h14" />
    <path d="M32 33c-6-4-9-7-9-10.5a4.5 4.5 0 0 1 9-1.5 4.5 4.5 0 0 1 9 1.5C41 26 38 29 32 33z" fill="currentColor" stroke="none" />
    <path d="M20 17a14 14 0 0 1 5-5" strokeOpacity=".7" />
  </>),
  // a sunrise: small good things, noticed
  "what-you-like": art(<>
    <path d="M12 44a20 20 0 0 1 40 0z" fill="currentColor" stroke="none" />
    <path d="M6 44h52M14 52h36" />
    <path d="M32 12v6M15 20l4 4M49 20l-4 4M8 33h5M51 33h5" strokeOpacity=".75" />
    <path d="M52 8l1.5 3.5L57 13l-3.5 1.5L52 18l-1.5-3.5L47 13l3.5-1.5z" fill="currentColor" stroke="none" />
  </>),
  // a sprout with a thought above it: opinions that grow
  "what-you-think": art(<>
    <path d="M32 58V34" />
    <path d="M32 40c-12 0-17-7-17-15 9 0 17 4 17 15z" fill="currentColor" fillOpacity=".35" />
    <path d="M32 36c0-11 7-17 18-17 0 11-7 17-18 17z" fill="currentColor" stroke="none" />
    <circle cx="18" cy="10" r="5" fill="currentColor" fillOpacity=".55" stroke="none" />
    <circle cx="10" cy="19" r="2.6" fill="currentColor" fillOpacity=".55" stroke="none" />
    <path d="M22 58h20" />
  </>)
};

export const pathArt = (id: string) => PATH_ART[id] ?? Icon.path;
