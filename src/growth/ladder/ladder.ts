// One rung up: the content, the rules of the climb, and how a saved climb is read back.
// A rung is a thought that feels at least 60 of 100 true; below that, sol offers a smaller step.
import * as z from "zod/mini";
import copyRaw from "../../../content/growth/ladder/copy.json";
import pointsRaw from "../../../content/growth/ladder/points.json";
import type { GrowthRecord } from "../../store/types";

const text = z.string().check(z.minLength(1));
const copyFile = z.object({
  copy: z.object({
    title: text, tileSub: text, welcome: z.array(text), helpNote: text, helpLink: text, skip: text, next: text,
    startAsk: text, startWord: text, startSentence: text, startKind: text, wordIdeas: text,
    sentenceLabel: text, sentencePlaceholder: text, sentenceNote: text, sentenceIdeas: text,
    nearAsk: text, nearSol: text,
    whyTitle: text, why: z.array(text), whyMore: text, whyGot: text, whyHide: text, sources: text, evidence: text,
    from: text, rungAsk: text, smallerSol: text, smallerAsk: text, pickIdeas: text, ownLabel: text, ownPlaceholder: text,
    begin: text, begins: z.array(text), beginsSmaller: z.array(text), stop: text,
    trueAsk: text, trueNote: text, trueLabel: text, trueEnds: z.array(text), trueOf: text,
    heldSol: z.array(text), heldTop: text, more: text, enough: text, seeClimb: text,
    shortSol: z.array(text), shortAgain: text, smaller: text, stay: text,
    afterSol: text, afterSkip: text,
    climbTitle: text, climbNote: text, ladderLabel: text, startTag: text, rungTag: text, topTag: text, believe: text, before: text,
    keepSentence: text, keepSentenceNote: text, keep: text, letGo: text, kept: text,
    carry: text, carried: text, uncarry: text, seeBook: text, done: text,
    bookTitle: text, bookNote: text, remove: text, removeLabel: text, removed: text, bookStart: text, bookRungs: text, bookRung: text
  }),
  sources: z.array(z.object({ id: text, label: text, url: z.optional(z.string()), evidence: text }))
});
const tier = z.object({ pick: z.array(text).check(z.minLength(3), z.maxLength(4)), softer: z.array(text).check(z.minLength(1)) });
const pointsFile = z.object({
  points: z.array(z.object({ id: text, word: text, says: z.array(text).check(z.minLength(1)), tiers: z.array(tier).check(z.minLength(4)) }))
});

const parsedCopy = copyFile.parse(copyRaw);
export const COPY = parsedCopy.copy;
export const SOURCES = parsedCopy.sources;
export const POINTS = pointsFile.parse(pointsRaw).points;
export type Point = (typeof POINTS)[number];
export type Tier = Point["tiers"][number];

export const BELIEVED = 60;
export const MAX_RUNGS = 5;

export const pointById = (id: string | null) => POINTS.find((p) => p.id === id) ?? null;
export const pointByWord = (word: string) => POINTS.find((p) => p.word === word) ?? null;

const norm = (s: string) => s.trim().toLowerCase().replace(/[.!?\s]+$/, "");
// a typed sentence that matches one of the offered sentences tells us the starting point; anything else is theirs, and we ask
export const pointForSentence = (s: string) => POINTS.find((p) => p.says.some((x) => norm(x) === norm(s))) ?? null;

// a few sentences to tap, one from each starting point
export const sentenceIdeas = () => POINTS.map((p) => p.says[0]!);

// the rung being climbed now: one tier per rung, and the last tier again if the climb is longer than the tiers
export const tierFor = (p: Point, rungs: number): Tier => p.tiers[Math.min(rungs, p.tiers.length - 1)]!;

export const holds = (believe: number) => believe >= BELIEVED;

// the words under a rung: their own words, in the order they climbed
export type Rung = { text: string; believe: number };
export const topOf = (rungs: Rung[]) => rungs.at(-1)?.text ?? null;

export function trueWords(n: number) {
  return COPY.trueOf.replace("{n}", String(n));
}

// ---- saved climbs ----
const rung = z.object({ text: z.string(), believe: z.number() });
const climb = z.object({
  start: z.string(),
  rungs: z.array(rung),
  top: z.nullable(z.string()),
  from: z.optional(z.string()),
  carry: z.optional(z.boolean())
});
export type Climb = z.infer<typeof climb> & { id: string; at: string };

// every saved climb, newest first; anything malformed or empty is skipped
export function climbs(grown: GrowthRecord[]): Climb[] {
  return grown
    .flatMap((g) => {
      if (g.feature !== "ladder" || g.type !== "climb") return [];
      const p = climb.safeParse(g.data);
      return p.success && p.data.rungs.length ? [{ ...p.data, id: g.id, at: g.at }] : [];
    })
    .reverse();
}
