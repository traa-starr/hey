// The warm room's data: content, the compassionate voice, and what the voice says.
// Self-compassion has three parts (Neff, 2003): kindness, common humanity and mindfulness.
import * as z from "zod/mini";
import raw from "../../../content/growth/warm/warm.json";
import { dailyIndex } from "../../lib/time";
import type { GrowthRecord } from "../../store/types";

const text = z.string().check(z.minLength(1));
const source = z.object({ label: text, evidence: text });
const part = z.array(text).check(z.minLength(2));
const file = z.object({
  copy: z.record(z.string(), z.union([z.string(), z.record(z.string(), z.string())])),
  thingIdeas: z.array(text),
  nameIdeas: z.array(text),
  sources: z.record(z.string(), source),
  why: z.array(z.object({ say: text, know: z.optional(z.object({ text, source: text })) })),
  qualities: z.array(z.object({ id: text, label: text, blurb: text, kindness: part, humanity: part, mindfulness: part }))
});
export const WARM = file.parse(raw);
export const copy = WARM.copy as Record<string, string>;
export const parts = WARM.copy.parts as Record<Part, string>;

export type Part = "kindness" | "humanity" | "mindfulness";
export const PARTS: Part[] = ["kindness", "humanity", "mindfulness"];

export type Voice = { id: string; name: string | null; qualities: string[] };
const voice = z.object({ name: z.nullable(z.string()), qualities: z.array(z.string()) });
const line = z.object({ text: z.string(), truth: z.optional(z.number()) });
const visit = z.object({ lines: z.array(z.string()), thing: z.nullable(z.string()) });
export type Visit = z.infer<typeof visit> & { id: string; at: string };

// the newest voice that parses and still names at least one quality we know
export function voiceOf(grown: GrowthRecord[]): Voice | null {
  for (const g of [...grown].reverse()) {
    if (g.feature !== "warm" || g.type !== "voice") continue;
    const p = voice.safeParse(g.data);
    if (!p.success) continue;
    const qualities = p.data.qualities.filter((q) => WARM.qualities.some((x) => x.id === q));
    if (qualities.length) return { id: g.id, name: p.data.name?.trim() || null, qualities };
  }
  return null;
}

export function visitsOf(grown: GrowthRecord[]): Visit[] {
  return grown.flatMap((g) => {
    if (g.feature !== "warm" || g.type !== "visit") return [];
    const p = visit.safeParse(g.data);
    return p.success && p.data.lines.length ? [{ ...p.data, id: g.id, at: g.at }] : [];
  });
}

// the person's own kept lines (lines/line, written by another practice), read defensively.
// believable ones come first: a line far from what someone believes can backfire (Wood et al., 2009)
export function ownLines(grown: GrowthRecord[]): string[] {
  const found = grown.flatMap((g) => {
    if (g.feature !== "lines" || g.type !== "line") return [];
    const p = line.safeParse(g.data);
    return p.success && p.data.text.trim() ? [{ text: p.data.text.trim(), truth: p.data.truth ?? 100 }] : [];
  });
  const believable = found.filter((l) => l.truth >= 60);
  return believable.map((l) => l.text);
}

export const nameOf = (v: Voice | null) => v?.name ?? copy.voiceDefault!;
// "sam, " in front of a line when there's a name to use, nothing when there isn't
export const addressed = (s: string, name: string) => s.replace(/\{n\}/g, name.trim() ? `${name.trim().toLowerCase()}, ` : "");

export type Said = { part: Part; quality: string; text: string };

// three things the voice says, one per part, in the tone of the chosen qualities. `round` and `seed`
// shift which quality and which wording is used, so another try says something new
export function compose(qualities: string[], name: string, round: number, seed: number): Said[] {
  const chosen = WARM.qualities.filter((q) => qualities.includes(q.id));
  const list = chosen.length ? chosen : WARM.qualities.slice(0, 1);
  return PARTS.map((p, j) => {
    const pool = [0, 1].flatMap((k) => list.map((q) => ({ q, t: q[p][k] ?? q[p][0]! })));
    const pick = pool[(seed + j + round * 3) % pool.length]!;
    return { part: p, quality: pick.q.id, text: addressed(pick.t, name) };
  });
}

// today's own line to weave in, steady through the day and different across visits
export const weaveLine = (own: string[], round: number) => (own.length ? own[(dailyIndex(own.length) + round) % own.length]! : null);
