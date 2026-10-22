// Proof's records and the small rules around them. Kept free of content and components so home's card stays light.
// Records can be old, partial or from another version, so everything is parsed and anything that doesn't fit is skipped.
import * as z from "zod/mini";
import type { GrowthRecord } from "../../store/types";

const experiment = z.object({
  claim: z.string(),
  prediction: z.string(),
  result: z.nullable(z.string()),
  closedAt: z.nullable(z.string()),
  plan: z.optional(z.string()),
  source: z.optional(z.string()),
  believe: z.optional(z.number()),
  believeAfter: z.optional(z.number()),
  letGo: z.optional(z.boolean())
});
const proof = z.object({ text: z.string().check(z.minLength(1)), from: z.nullable(z.string()), claim: z.optional(z.string()), experiment: z.optional(z.string()) });

export type Experiment = z.infer<typeof experiment> & { id: string; at: string };
export type Proof = z.infer<typeof proof> & { id: string; at: string };

export function experiments(grown: GrowthRecord[]): Experiment[] {
  return grown.flatMap((g) => {
    if (g.feature !== "proof" || g.type !== "experiment") return [];
    const p = experiment.safeParse(g.data);
    return p.success ? [{ ...p.data, id: g.id, at: g.at }] : [];
  });
}

export function proofs(grown: GrowthRecord[]): Proof[] {
  return grown.flatMap((g) => {
    if (g.feature !== "proof" || g.type !== "proof") return [];
    const p = proof.safeParse(g.data);
    return p.success ? [{ ...p.data, id: g.id, at: g.at }] : [];
  });
}

export const isOpen = (e: Experiment) => e.closedAt === null;

// an experiment waits as long as it likes, but home only asks about a recent one
const RECENT_DAYS = 2;
export function eveningExperiment(list: Experiment[], now = new Date()): Experiment | null {
  const from = now.getTime() - RECENT_DAYS * 86_400_000;
  const open = list.filter((e) => isOpen(e) && new Date(e.at).getTime() >= from);
  return open.length ? open[open.length - 1]! : null;
}

export const isEvening = (d = new Date()) => d.getHours() >= 17;

// ---------- the same claim coming back ----------
const norm = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();
const bag = (s: string) => new Set(norm(s).split(" ").filter((w) => w.length > 2));

export function sameClaim(a: string, b: string): boolean {
  const x = norm(a), y = norm(b);
  if (!x || !y) return false;
  if (x === y) return true;
  const p = bag(a), q = bag(b);
  if (p.size < 3 || q.size < 3) return false;
  const shared = [...p].filter((w) => q.has(w)).length;
  return shared / (p.size + q.size - shared) >= 0.6;
}

// proof gathered against a claim, newest first; `except` leaves out one experiment (the one being looked at now)
export function proofAgainst(grown: GrowthRecord[], claim: string, except?: string): Proof[] {
  const claims = new Map(experiments(grown).map((e) => [e.id, e.claim]));
  return proofs(grown)
    .filter((p) => p.experiment !== except && sameClaim(claim, p.claim ?? (p.experiment ? claims.get(p.experiment) ?? "" : "")))
    .reverse();
}

// ---------- what other practices keep, read defensively ----------
const climb = z.object({ top: z.nullable(z.string()) });
const line = z.object({ text: z.string() });
export type Source = { kind: "ladder" | "line"; text: string };

// recent ladder tops and lines, newest first, at most `n` of each; none if those practices haven't been used
export function sources(grown: GrowthRecord[], n = 3): Source[] {
  const pick = (feature: string, type: string, kind: Source["kind"], read: (d: unknown) => string | null) =>
    grown
      .filter((g) => g.feature === feature && g.type === type)
      .flatMap((g) => { const t = read(g.data); return t && t.trim() ? [t.trim()] : []; })
      .filter((t, i, all) => all.indexOf(t) === i)
      .slice(-n).reverse()
      .map((text) => ({ kind, text }));
  return [
    ...pick("ladder", "climb", "ladder", (d) => { const p = climb.safeParse(d); return p.success ? p.data.top : null; }),
    ...pick("lines", "line", "line", (d) => { const p = line.safeParse(d); return p.success ? p.data.text : null; })
  ];
}
