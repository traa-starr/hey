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

const keep = z.enum(["my-words", "what-i-like", "what-i-think"]);

// a small typographic scene: the inner voice, your voice, or both
export const visual = z.object({
  inner: opt(z.string()),
  mine: opt(z.string()),
  loud: opt(z.int().check(z.minimum(1), z.maximum(5)))
});

const buildPart = z.object({
  key: text,
  label: text,
  chips: opt(list(text)),
  input: opt(z.boolean()),
  placeholder: opt(z.string()),
  ideas: opt(list(text)),
  allowCustom: opt(z.boolean())
});

const stage = opt(z.string());

export const step = z.discriminatedUnion("type", [
  z.object({ type: z.literal("welcome"), text, button: text, visual: opt(visual) }),
  z.object({ type: z.literal("show"), text, button: text, stage, more: opt(z.string()), source: opt(source), visual: opt(visual) }),
  z.object({ type: z.literal("try-on"), prompt: text, options: list(text, 2), question: text, answers: opt(list(text)), reply: text, stage }),
  z.object({ type: z.literal("promises"), prompt: text, items: list(text, 1), button: text }),
  z.object({ type: z.literal("this-or-that"), prompt: text, pairs: list(z.tuple([text, text]), 1), extras: opt(list(text)), keep: z.literal("what-i-like") }),
  z.object({ type: z.literal("build"), prompt: text, template: text, parts: list(buildPart, 1), reply: opt(z.string()), keep, optional: opt(z.boolean()) }),
  z.object({
    type: z.literal("write"), prompt: text, chips: opt(list(text)),
    input: opt(z.object({ label: text, placeholder: opt(z.string()) })),
    keep: z.union([keep, z.literal("name")]), skip: opt(z.string()), optional: opt(z.boolean()), stage
  }),
  z.object({ type: z.literal("pocket"), prompt: text, phrases: list(text, 1), keep, stage }),
  z.object({ type: z.literal("try"), prompt: text, options: list(text, 1), skip: opt(z.string()), stage }),
  z.object({ type: z.literal("close"), text, button: opt(z.string()), then: opt(z.literal("answer")), later: opt(z.string()) })
]);

export const lesson = z.object({
  id: text,
  practice: text,
  kind: opt(z.string()),
  title: text,
  subtitle: text,
  minutes: z.number().check(z.positive()),
  steps: list(step, 1),
  grounding: opt(list(z.object({ idea: text, source: text, url: opt(z.string()) })))
});

export const index = z.object({
  start: text,
  formulas: text,
  questions: text,
  copy: text,
  help: text,
  credits: text,
  practices: list(z.object({ id: text, name: text, blurb: text, lessons: list(text) }))
});

export const help = z.object({
  title: text,
  note: text,
  lines: list(z.object({ name: text, detail: text, url: opt(z.string()) }), 1)
});

export const credits = z.object({
  note: text,
  items: list(z.object({ name: text, by: text, license: text, use: text, url: z.string() }))
});

const strings = <T extends string>(...keys: T[]) => z.object(Object.fromEntries(keys.map((k) => [k, text])) as Record<T, typeof text>);

export const copy = z.object({
  app: strings("name", "loading", "close", "readAloud", "next", "skip", "done", "tellMore", "tellLess", "ideas", "progress"),
  tabs: strings("today", "explore", "book", "label"),
  greeting: strings("night", "dawn", "day", "dusk", "noName"),
  today: strings("toldYourself", "toldEmpty", "answerTitle", "answerSub", "questionLabel", "questionNote", "noted", "allAnswered", "explore"),
  loudness: z.object({ names: z.array(text).check(z.length(5)), label: text, unset: text, notSet: text, hardToSay: text }),
  answer: strings(
    "catchAsk", "catchLabel", "catchPlaceholder", "catchNote", "catchIdeas", "loudAsk", "calmAsk", "calmYes", "calmNo",
    "calmIn", "calmOut", "calmDone", "calmStatic", "wayAsk", "aboutWay", "evidence", "slotPlaceholder", "thisIsMine",
    "againAsk", "forBook", "quieter", "same", "louder", "plain", "keepSaid", "saidAs", "keep", "another", "letGo",
    "kept", "seeBook", "backToday"
  ),
  explore: strings("title", "waysTitle", "setsTitle", "tried", "minutes", "tryIt", "why", "example", "source"),
  lesson: strings("keep", "keepThese", "kept", "noPicks", "picks", "pickAs", "both", "neither", "tryReply", "nameHello", "thatsMe", "ofTotal", "orYourOwn"),
  book: strings("title", "voiceTab", "aboutTab", "voiceEmpty", "aboutEmpty", "edit", "save", "cancel", "remove", "removeAsk", "keepIt", "editLabel", "privacy"),
  settings: strings(
    "title", "nameTitle", "nameLabel", "nameSaved", "save", "voiceTitle", "voiceOn", "voiceAuto", "voicePick", "voiceDefault",
    "voiceRate", "voiceTest", "voiceSample", "voiceNone", "soundTitle", "soundOn", "resurface", "lookTitle", "lookTime", "lookLight", "lookDark",
    "aboutTitle", "about", "credits", "replay", "installTitle", "installIos", "installButton", "installOther", "dataTitle", "data",
    "export", "clear", "clearAsk", "clearYes", "clearNo", "storageNote"
  ),
  errors: strings("content", "missing")
});

export type Slot = z.infer<typeof slot>;
export type Formula = z.infer<typeof formula>;
export type Question = z.infer<typeof question>;
export type Step = z.infer<typeof step>;
export type Lesson = z.infer<typeof lesson>;
export type Copy = z.infer<typeof copy>;
export type Help = z.infer<typeof help>;
export type Credits = z.infer<typeof credits>;
export type Practice = z.infer<typeof index>["practices"][number];
export type Keep = z.infer<typeof keep>;
export type Visual = z.infer<typeof visual>;
