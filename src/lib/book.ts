// The shapes behind your book: a star for each kept thing, how answering moved the loudness,
// which ways you've used, and which habits you've met. Nothing here is a score.
import type { Formula, Habit } from "../content/schema";
import type { Entry, Kind, Log } from "../store/types";

export const hash = (s: string) => {
  let h = 2166136261;
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
};

export type Star = { id: string; kind: Kind; at: string; x: number; y: number; r: number; link: number | null };

// every kept thing is a star. the oldest sit in the middle and the book grows outward on a
// sunflower spiral, so stars never pile up. each star joins its nearest older neighbour.
export function constellation(entries: Entry[], w: number, h: number, max = 240): Star[] {
  const list = [...entries].sort((a, b) => a.at.localeCompare(b.at) || a.id.localeCompare(b.id)).slice(-max);
  // a young book stays small in the middle instead of stretching a few stars to the edges
  const n = Math.max(list.length, 24);
  const stars: Star[] = list.map((e, i) => {
    const r = Math.sqrt((i + 0.7) / n);
    const a = i * 2.399963 + 0.6;
    return {
      id: e.id, kind: e.kind, at: e.at,
      x: w / 2 + Math.cos(a) * r * (w / 2 - 14),
      y: h / 2 + Math.sin(a) * r * (h / 2 - 14),
      r: 1.7 + (hash(e.id) % 3) * 0.45,
      link: null
    };
  });
  const reach = (w * 0.28) ** 2;
  stars.forEach((s, i) => {
    let best = -1;
    let d = Infinity;
    for (let j = 0; j < i; j++) {
      const q = stars[j]!;
      const dd = (s.x - q.x) ** 2 + (s.y - q.y) ** 2;
      if (dd < d) { d = dd; best = j; }
    }
    s.link = best >= 0 && d < reach ? best : null;
  });
  return stars;
}

// answers with a loudness before and after, oldest first
export function shifts(entries: Entry[], max = 10) {
  return entries
    .filter((e) => e.kind === "voice" && !e.said && e.before && e.after)
    .sort((a, b) => a.at.localeCompare(b.at))
    .slice(-max)
    .map((e) => ({ id: e.id, at: e.at, before: e.before!, after: e.after! }));
}

// how many kept answers used each way to answer
export function wayUse(formulas: Formula[], entries: Entry[]): Record<string, number> {
  const byName = new Map(formulas.map((f) => [f.name, f.id]));
  const out: Record<string, number> = {};
  for (const e of entries) {
    if (e.kind !== "voice" || e.said) continue;
    const id = byName.get(e.from);
    if (id) out[id] = (out[id] ?? 0) + 1;
  }
  return out;
}

// a habit is met once its lesson is done or it has been caught
export function metHabits(habits: Habit[], done: Record<string, string>, logs: Log[]): Set<string> {
  const caught = new Set(logs.flatMap((l) => (l.type === "moment" && l.habit ? [l.habit] : [])));
  return new Set(habits.filter((h) => done[`habit:${h.id}`] || caught.has(h.id)).map((h) => h.id));
}

// entries grouped by the month they were kept, newest first, keyed "2026-10"
export function byMonth(entries: Entry[]) {
  const groups: { month: string; items: Entry[] }[] = [];
  for (const e of [...entries].sort((a, b) => b.at.localeCompare(a.at))) {
    const d = new Date(e.at);
    const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const last = groups.at(-1);
    if (last?.month === month) last.items.push(e);
    else groups.push({ month, items: [e] });
  }
  return groups;
}

export function monthName(month: string): string {
  const [y, m] = month.split("-").map(Number);
  return new Date(y!, (m ?? 1) - 1, 15).toLocaleDateString(undefined, { month: "long", year: "numeric" }).toLowerCase();
}
