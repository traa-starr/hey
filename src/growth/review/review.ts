// Brings a finished lesson's main idea back on home after 1, 3, 7 and 21 days: trying to recall
// something (Roediger & Karpicke, 2006), spaced out over days (Cepeda et al., 2006), helps it stick.
// At most one look back a day, never more than four for a lesson, and no count is kept or shown.
import * as z from "zod/mini";
import raw from "../../../content/growth/review/review.json";
import { store } from "../../store/store";
import type { GrowthRecord } from "../../store/types";
import { dayKey } from "../../lib/time";

export const COPY = z.object({ label: z.string(), ask: z.string(), show: z.string(), thanks: z.string(), lesson: z.string() }).parse(raw);

const DAY = 864e5;
export const GAPS = [1, 3, 7, 21];

export type Lessonish = { key: string; title: string; takeaway: string };
export type LookBack = Lessonish;

const seenKey = (g: GrowthRecord) => {
  if (g.feature !== "review" || g.type !== "seen") return null;
  const key = (g.data as { key?: unknown } | null)?.key;
  return typeof key === "string" ? key : null;
};

// the lesson most overdue for a look back right now, or none
export function dueLookBack(lessons: Lessonish[], done: Record<string, string>, grown: GrowthRecord[], now = new Date()): LookBack | null {
  const seen = grown.flatMap((g) => { const key = seenKey(g); return key ? [{ key, at: g.at }] : []; });
  if (seen.some((s) => dayKey(new Date(s.at)) === dayKey(now))) return null;
  let best: { item: Lessonish; over: number } | null = null;
  for (const item of lessons) {
    const finished = done[item.key];
    if (!finished || !item.takeaway) continue;
    const mine = seen.filter((s) => s.key === item.key);
    const gap = GAPS[mine.length];
    if (gap === undefined) continue;
    const last = Math.max(Date.parse(finished), ...mine.map((s) => Date.parse(s.at)));
    if (Number.isNaN(last)) continue;
    const over = now.getTime() - last - gap * DAY;
    if (over >= 0 && (!best || over > best.over)) best = { item, over };
  }
  return best?.item ?? null;
}

export const markSeen = (key: string) => store.grow("review", "seen", { key });
