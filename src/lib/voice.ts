// Turning voice checks and caught moments into a picture of how someone's inner voice tends to talk.
import type { Habit } from "../content/schema";
import type { Log, Moment, VoiceCheck } from "../store/types";

// the voice check deck: every habit's first line, then every habit's second line, so habits interleave
export function deck(habits: Habit[]): { habit: string; line: string }[] {
  const rounds = Math.max(...habits.map((h) => h.quiz.length), 0);
  const out: { habit: string; line: string }[] = [];
  for (let r = 0; r < rounds; r++) for (const h of habits) if (h.quiz[r]) out.push({ habit: h.id, line: h.quiz[r]! });
  return out;
}

// answers are 2 (that's me), 1 (sometimes), 0 (not really); each habit's score is 0 to 1
export function scoreCheck(cards: { habit: string }[], answers: number[]): Record<string, number> {
  const sum: Record<string, number> = {};
  const max: Record<string, number> = {};
  cards.forEach((c, n) => {
    sum[c.habit] = (sum[c.habit] ?? 0) + (answers[n] ?? 0);
    max[c.habit] = (max[c.habit] ?? 0) + 2;
  });
  return Object.fromEntries(Object.keys(max).map((k) => [k, Math.round(((sum[k] ?? 0) / max[k]!) * 100) / 100]));
}

export const moments = (logs: Log[]) => logs.filter((l): l is Moment => l.type === "moment");
export const lastCheck = (logs: Log[]) => logs.filter((l): l is VoiceCheck => l.type === "check").at(-1) ?? null;

// how present each habit is: the latest voice check, nudged by everything that's been caught
export function weights(habits: Habit[], logs: Log[]): { habit: Habit; weight: number; caught: number }[] {
  const check = lastCheck(logs);
  const caught = moments(logs);
  const counts: Record<string, number> = {};
  caught.forEach((m) => { if (m.habit) counts[m.habit] = (counts[m.habit] ?? 0) + 1; });
  const most = Math.max(1, ...Object.values(counts));
  return habits
    .map((habit) => {
      const s = check?.scores[habit.id] ?? 0;
      const c = (counts[habit.id] ?? 0) / most;
      const weight = check ? 0.75 * s + 0.25 * c : c;
      return { habit, weight: Math.round(weight * 100) / 100, caught: counts[habit.id] ?? 0 };
    })
    .filter((x) => x.weight > 0)
    .sort((a, b) => b.weight - a.weight);
}

// where caught habits show up, most often first
export function places(logs: Log[]): { place: string; n: number }[] {
  const counts: Record<string, number> = {};
  moments(logs).forEach((m) => { if (m.where) counts[m.where] = (counts[m.where] ?? 0) + 1; });
  return Object.entries(counts).map(([place, n]) => ({ place, n })).sort((a, b) => b.n - a.n);
}

// a local calendar day, so an evening entry stays on the evening it happened
export const localDay = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

// loudness over the last `days` days from check-ins and caught moments: one point per day with data (the day's average),
// with `ago` (days before today) so the chart can place points by date
export function loudness(logs: Log[], days = 14, now = new Date()): { day: string; ago: number; loud: number }[] {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const byDay: Record<string, number[]> = {};
  logs.forEach((l) => {
    if (l.type === "check") return;
    const d = localDay(l.at);
    (byDay[d] = byDay[d] ?? []).push(l.loud);
  });
  return Object.entries(byDay)
    .map(([day, ls]) => {
      const [y, m, dd] = day.split("-").map(Number) as [number, number, number];
      const ago = Math.round((today.getTime() - new Date(y, m - 1, dd).getTime()) / 864e5);
      return { day, ago, loud: Math.round((ls.reduce((x, z) => x + z, 0) / ls.length) * 10) / 10 };
    })
    .filter((p) => p.ago >= 0 && p.ago < days)
    .sort((a, b) => b.ago - a.ago);
}
