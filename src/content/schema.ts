// Schemas for everything in content/. A file that doesn't match fails the tests,
// and in the app the broken piece is skipped instead of taking everything down.
// Uses zod/mini to keep what ships to phones small.
import * as z from "zod/mini";

const text = z.string().check(z.minLength(1));
const list = <T extends z.ZodMiniType>(item: T, min = 0) => (min ? z.array(item).check(z.minLength(min)) : z.array(item));
const opt = z.optional;

export const source = z.object({ label: text, url: z.string() });

export const slot = z.object({
  key: text,
  label: text,
  fill: opt(z.enum(["name", "original", "original-i"])),
  chips: opt(list(text, 1)),
  placeholder: opt(z.string()),
  ideas: opt(list(text))
}).check(z.refine((s) => !!(s.fill || s.chips || (s.ideas && s.ideas.length > 0)), "a typed slot needs ideas, so nobody starts from an empty box"));

export const formula = z.object({
  id: text,
  name: text,
  frame: text,
  why: text,
  example: z.object({ before: text, after: text }),
  template: text,
  slots: list(slot),
  source,
  evidence: text
}).check(z.refine((f) => f.slots.every((s) => f.template.includes(`{${s.key}}`)), "every slot needs a {key} in the template"));

export const formulasFile = z.object({ intro: text, formulas: list(z.unknown()), catchIdeas: list(text, 1) });

export const question = z.object({
  id: text,
  prompt: text,
  options: list(text, 2),
  keep: z.enum(["like", "think"]),
  as: text.check(z.refine((s) => s.includes("{x}"), "needs {x}"))
});
export const questionsFile = z.object({ intro: text, questions: list(z.unknown()) });

export const keep = z.enum(["my-words", "what-i-like", "what-i-think"]);

// ---------- voice habits ----------
export const COLORS = ["violet", "pink", "coral", "gold", "teal", "plum", "blue", "orange", "lime", "mint"] as const;
export const GLYPHS = ["ruler", "eye", "loop", "cloud", "scales", "tag", "shrink", "target", "split", "wave"] as const;

export const habit = z.object({
  id: text,
  name: text,
  short: text,
  color: z.enum(COLORS),
  glyph: z.enum(GLYPHS),
  says: list(text, 1),
  quiz: list(text, 1),
  job: text,
  misses: text,
  spot: z.object({ scene: text, quote: text }),
  answers: list(z.object({ way: text, line: text }), 1),
  // kind lines offered to keep in the book; answers often quote the voice, so they stay in the lesson
  kind: opt(list(text, 1)),
  keep: text,
  try: text
});
export const habitsFile = z.object({ intro: text, note: text, source, evidence: text, habits: list(z.unknown(), 1) });

// ---------- chat lessons: sol talks, you tap ----------
const mood = opt(z.enum(["calm", "happy", "curious", "sleepy"]));
const option = z.object({ label: text, reply: opt(z.string()) });

export const step = z.discriminatedUnion("type", [
  z.object({ type: z.literal("say"), text, mood }),
  z.object({ type: z.literal("scene"), quote: text, label: opt(z.string()) }),
  z.object({ type: z.literal("mine"), text }),
  z.object({ type: z.literal("ask"), text, options: list(option, 2) }),
  z.object({ type: z.literal("tryon"), prompt: text, lines: list(text, 2), reply: text }),
  z.object({ type: z.literal("pick"), prompt: text, options: list(text, 2), reply: text, keep: opt(keep), as: opt(z.string()), max: opt(z.number()) }),
  // said: the sentence wraps something the inner voice says, so it is never resurfaced on home
  z.object({ type: z.literal("write"), prompt: text, template: text.check(z.refine((t) => t.includes("{x}"), "needs {x}")), ideas: list(text, 1), keep: opt(keep), placeholder: opt(z.string()), said: opt(z.boolean()) }),
  z.object({ type: z.literal("spot"), scene: text, quote: text, options: list(text, 2), answer: z.number(), explain: text }),
  z.object({ type: z.literal("tot"), prompt: text, pairs: list(z.tuple([text, text]), 1), keep: z.literal("what-i-like") }),
  z.object({ type: z.literal("takeaway"), text, source, evidence: opt(z.string()) }),
  z.object({ type: z.literal("experiment"), text }),
  // a little background between steps: where an idea comes from, with its source (a short break that gives the mind something to hold)
  z.object({ type: z.literal("know"), text, source, evidence: opt(z.string()) }),
  // a gentle look back at an earlier lesson: think of it first, then see it. never graded.
  // when the earlier lesson isn't done yet, it shows as a small preview instead
  z.object({ type: z.literal("recall"), from: text, prompt: text, answer: text }),
  z.object({ type: z.literal("breathe") }),
  z.object({ type: z.literal("list"), text, items: list(text, 1) }),
  z.object({ type: z.literal("name"), text, placeholder: opt(z.string()) }),
  z.object({ type: z.literal("end"), text, button: text, then: z.enum(["check", "home"]), later: opt(z.string()) })
]);

export const lesson = z.object({
  id: text,
  title: text,
  subtitle: text,
  minutes: z.number().check(z.positive()),
  steps: list(step, 1),
  grounding: opt(list(z.object({ idea: text, source: text, url: opt(z.string()) })))
});

export const path = z.object({ id: text, name: text, blurb: text, color: z.enum(COLORS), lessons: list(text, 1) });

export const index = z.object({
  start: text,
  formulas: text,
  questions: text,
  habits: text,
  copy: text,
  help: text,
  credits: text,
  tour: opt(text),
  paths: list(path, 1)
});

export const help = z.object({
  title: text,
  note: text,
  lines: list(z.object({ name: text, detail: text, url: opt(z.string()), href: opt(z.string()) }), 1)
});

// the quick look around after the welcome: one tab (or home itself) lit per step
export const TOUR_TABS = ["home", "learn", "practice", "book", "you"] as const;
export const tour = z.object({
  label: text,
  next: text,
  done: text,
  skip: text,
  count: text,
  steps: list(z.object({ tab: z.enum(TOUR_TABS), say: text }), 1)
});

export const credits = z.object({
  note: text,
  items: list(z.object({ name: text, by: text, license: text, use: text, url: z.string() }))
});

// every interface string: the type comes from copy.json itself, so a missing key fails the typecheck,
// and at load every value is checked to be real text
type Strings = string | string[] | { [k: string]: Strings };
const isStrings = (v: unknown): v is Strings =>
  (typeof v === "string" && v.length > 0) ||
  (Array.isArray(v) && v.length > 0 && v.every((x) => typeof x === "string" && x.length > 0)) ||
  (!!v && typeof v === "object" && !Array.isArray(v) && Object.values(v).every(isStrings));
export const copy = z.custom<typeof import("../../content/copy.json")>((v) => isStrings(v), "every value in copy.json must be non-empty text");

export type Slot = z.infer<typeof slot>;
export type Formula = z.infer<typeof formula>;
export type Question = z.infer<typeof question>;
export type Step = z.infer<typeof step>;
export type Habit = z.infer<typeof habit>;
export type Path = z.infer<typeof path>;
export type Color = (typeof COLORS)[number];
export type Glyph = (typeof GLYPHS)[number];
export type Lesson = z.infer<typeof lesson>;
export type Copy = z.infer<typeof copy>;
export type Help = z.infer<typeof help>;
export type Tour = z.infer<typeof tour>;
export type Credits = z.infer<typeof credits>;
export type Keep = z.infer<typeof keep>;
