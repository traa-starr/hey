// Your lines: affirmations the person builds from a value and a real, small moment, in their own
// words. Never handed down: lines far from what someone believes can backfire (Wood et al., 2009),
// so every line is checked against "how true does this feel?" and can always be made smaller.
import * as z from "zod/mini";
import raw from "../../../content/growth/lines/lines.json";
import { dailyIndex, dayKey } from "../../lib/time";
import { fill, finish, trimEnd } from "../../lib/template";
import type { Entry, GrowthRecord } from "../../store/types";

const str = z.string().check(z.minLength(1));
const source = z.object({ label: str, url: z.string(), evidence: str });
const file = z.object({
  copy: z.record(z.string(), z.union([z.string(), z.array(z.string())])),
  templates: z.object({ moment: z.array(str), plain: z.array(str), ownMoment: z.array(str), ownPlain: z.array(str) }),
  lead: z.array(str),
  tail: z.array(str),
  suggest: z.array(str),
  ownIdeas: z.array(str),
  ownMoments: z.array(str),
  stopwords: z.array(str),
  values: z.array(z.object({ id: str, word: str, third: str, first: str, moments: z.array(str) })),
  why: z.array(z.object({ id: str, text: str, source }))
});
export const LINES = file.parse(raw);
export const T = raw.copy;
export type Value = (typeof LINES.values)[number];

// what a kept line looks like in the store (records can be old or partial, so parse, don't assume)
const lineData = z.object({
  text: str, value: z.string(), moment: z.nullable(z.string()), truth: z.number(),
  own: z.optional(z.boolean())
});
export type Line = z.infer<typeof lineData> & { id: string; at: string };

export function linesFrom(grown: GrowthRecord[]): Line[] {
  return grown.flatMap((g) => {
    if (g.feature !== "lines" || g.type !== "line") return [];
    const p = lineData.safeParse(g.data);
    return p.success ? [{ ...p.data, id: g.id, at: g.at }] : [];
  });
}

export type Make = { name: string; value: Value | null; own: string; moment: string | null };

// the lines dawn can offer for a value and a moment: first person without a name, never second person
export function candidates({ name, value, own, moment }: Make): string[] {
  const n = name.trim().toLowerCase();
  const who = n || "i";
  const m = moment ? trimEnd(moment).toLowerCase() : "";
  const k = LINES.templates;
  const list = value
    ? (m ? k.moment : k.plain)
    : (m ? k.ownMoment : k.ownPlain);
  const vals = { who, whoObj: n || "me", verb: value ? (n ? value.third : value.first) : "", word: (value?.word ?? own).trim().toLowerCase(), moment: m };
  return list.map((t) => finish(fill(t, vals)));
}

// lead words go right after who ("sam sometimes shows up"), tail words close the line
export const canLead = (text: string, name: string) => text.toLowerCase().startsWith(`${name.trim().toLowerCase() || "i"} `);
export function addLead(text: string, name: string, word: string): string {
  const who = name.trim().toLowerCase() || "i";
  if (!canLead(text, name) || text.toLowerCase().startsWith(`${who} ${word} `)) return text;
  return `${text.slice(0, who.length)} ${word}${text.slice(who.length)}`;
}
export function addTail(text: string, word: string): string {
  const t = trimEnd(text);
  return !t || t.toLowerCase().includes(word) ? text : finish(`${t}, ${word}`);
}

// put a word where the caret is, or in place of the selected words
export function insertWord(text: string, word: string, from: number, to: number): { text: string; caret: number } {
  const a = Math.max(0, Math.min(from, text.length)), b = Math.max(a, Math.min(to, text.length));
  const before = text.slice(0, a), after = text.slice(b);
  const left = before && !/\s$/.test(before) ? " " : "";
  const right = after && !/^[\s.,!?;:]/.test(after) ? " " : "";
  const out = `${before}${left}${word}${right}${after}`;
  return { text: out, caret: before.length + left.length + word.length };
}

const heavy = /^(sad|stupid|idiot|fail|failed|failing|hate|worthless|annoyed|embarrassed|disappointed|tired|anxious|worried|stressed|behind|never|always|toxic|broken|wrong|ugly|hopeless|useless|hard|difficult|struggle)$/;
const stop = new Set(LINES.stopwords);

// words from the person's own book and past lines: kind things only, never what an inner voice said
export function ownWords(entries: Entry[], lines: Line[], skip: string[] = [], max = 10): string[] {
  const texts = [
    ...lines.slice().reverse().flatMap((l) => [l.text, l.moment ?? ""]),
    ...entries.filter((e) => !e.said && !e.holdsSaid).map((e) => e.text)
  ];
  const counts = new Map<string, number>();
  const order: string[] = [];
  for (const t of texts) {
    for (const w of t.toLowerCase().match(/[a-z][a-z']{2,}/g) ?? []) {
      const word = w.replace(/'s$/, "");
      if (word.length < 4 || word.length > 14 || stop.has(word) || heavy.test(word) || /^(you|your|i')/.test(word)) continue;
      if (!counts.has(word)) order.push(word);
      counts.set(word, (counts.get(word) ?? 0) + 1);
    }
  }
  const gone = new Set(skip.map((s) => s.toLowerCase()));
  return order
    .filter((w) => !gone.has(w))
    .sort((a, b) => (counts.get(b)! - counts.get(a)!) || order.indexOf(a) - order.indexOf(b))
    .slice(0, max);
}

// today's line: one a day, steady until tomorrow. lines that felt reasonably true come first
export function todayLine(lines: Line[], d = new Date()): Line | null {
  const fit = lines.filter((l) => l.truth >= 40);
  const pool = fit.length ? fit : lines;
  return pool[dailyIndex(pool.length, d)] ?? null;
}

// the feel check opens and closes the first session of the day, once
let askedDay = "";
export function firstOfDay(grown: GrowthRecord[], d = new Date()): boolean {
  const today = dayKey(d);
  if (askedDay === today) return false;
  return !grown.some((g) => (g.feature === "lines" || (g.feature === "feel" && (g.data as { practice?: unknown }).practice === "lines")) && dayKey(new Date(g.at)) === today);
}
export const markAsked = (d = new Date()) => { askedDay = dayKey(d); };
