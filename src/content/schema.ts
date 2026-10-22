// Schemas for everything in content/. A file that doesn't match fails the tests,
// and in the app the broken piece is skipped instead of taking everything down.
import { z } from "zod";

const text = z.string().min(1);

export const source = z.object({ label: text, url: z.string() });

export const slot = z.object({
  key: text,
  label: text,
  fill: z.enum(["name", "original", "original-i"]).optional(),
  chips: z.array(text).min(1).optional(),
  placeholder: z.string().optional(),
  ideas: z.array(text).optional()
}).refine((s) => s.fill || s.chips || (s.ideas && s.ideas.length > 0), {
  message: "a typed slot needs ideas, so nobody starts from an empty box"
});

export const formula = z.object({
  id: text,
  name: text,
  frame: text,
  why: text,
  example: z.object({ before: text, after: text }),
  template: text,
  slots: z.array(slot),
  source,
  evidence: text
}).refine((f) => f.slots.every((s) => f.template.includes(`{${s.key}}`)), {
  message: "every slot needs a {key} in the template"
});

export const formulasFile = z.object({
  intro: text,
  formulas: z.array(z.unknown()),
  catchIdeas: z.array(text).min(1)
});

export const question = z.object({
  id: text,
  prompt: text,
  options: z.array(text).min(2),
  keep: z.enum(["like", "think"]),
  as: text.refine((s) => s.includes("{x}"), "needs {x}")
});
export const questionsFile = z.object({ intro: text, questions: z.array(z.unknown()) });

const keep = z.enum(["my-words", "what-i-like", "what-i-think"]);

// a small typographic scene: the inner voice, your voice, or both
export const visual = z.object({ inner: z.string().optional(), mine: z.string().optional(), loud: z.number().int().min(1).max(5).optional() });

const buildPart = z.object({
  key: text,
  label: text,
  chips: z.array(text).optional(),
  input: z.boolean().optional(),
  placeholder: z.string().optional(),
  ideas: z.array(text).optional(),
  allowCustom: z.boolean().optional()
});

export const step = z.discriminatedUnion("type", [
  z.object({ type: z.literal("welcome"), text, button: text, visual: visual.optional() }),
  z.object({
    type: z.literal("show"), text, button: text, stage: z.string().optional(),
    more: z.string().optional(), source: source.optional(), visual: visual.optional()
  }),
  z.object({
    type: z.literal("try-on"), prompt: text, options: z.array(text).min(2), question: text,
    answers: z.array(text).optional(), reply: text, stage: z.string().optional()
  }),
  z.object({ type: z.literal("promises"), prompt: text, items: z.array(text).min(1), button: text }),
  z.object({
    type: z.literal("this-or-that"), prompt: text, pairs: z.array(z.tuple([text, text])).min(1),
    extras: z.array(text).optional(), keep: z.literal("what-i-like")
  }),
  z.object({
    type: z.literal("build"), prompt: text, template: text, parts: z.array(buildPart).min(1),
    reply: z.string().optional(), keep, optional: z.boolean().optional()
  }),
  z.object({
    type: z.literal("write"), prompt: text, chips: z.array(text).optional(),
    input: z.object({ label: text, placeholder: z.string().optional() }).optional(),
    keep: z.union([keep, z.literal("name")]), skip: z.string().optional(), optional: z.boolean().optional(), stage: z.string().optional()
  }),
  z.object({ type: z.literal("pocket"), prompt: text, phrases: z.array(text).min(1), keep, stage: z.string().optional() }),
  z.object({ type: z.literal("try"), prompt: text, options: z.array(text).min(1), skip: z.string().optional(), stage: z.string().optional() }),
  z.object({
    type: z.literal("close"), text, button: z.string().optional(),
    then: z.literal("answer").optional(), later: z.string().optional()
  })
]);

export const lesson = z.object({
  id: text,
  practice: text,
  kind: z.string().optional(),
  title: text,
  subtitle: text,
  minutes: z.number().positive(),
  steps: z.array(step).min(1),
  grounding: z.array(z.object({ idea: text, source: text, url: z.string().optional() })).optional()
});

export const index = z.object({
  start: text,
  formulas: text,
  questions: text,
  copy: text,
  help: text,
  credits: text,
  practices: z.array(z.object({ id: text, name: text, blurb: text, lessons: z.array(text) }))
});

export const help = z.object({
  title: text,
  note: text,
  lines: z.array(z.object({ name: text, detail: text, url: z.string().optional() })).min(1)
});

export const credits = z.object({
  note: text,
  items: z.array(z.object({ name: text, by: text, license: text, use: text, url: z.string() }))
});

const strings = <T extends string>(...keys: T[]) => z.object(Object.fromEntries(keys.map((k) => [k, text])) as Record<T, typeof text>);

export const copy = z.object({
  app: strings("name", "loading", "close", "readAloud", "next", "skip", "done", "tellMore", "tellLess", "ideas", "progress"),
  tabs: strings("today", "explore", "book", "label"),
  greeting: strings("night", "dawn", "day", "dusk", "noName"),
  today: strings("toldYourself", "toldEmpty", "answerTitle", "answerSub", "questionLabel", "questionNote", "noted", "allAnswered", "explore"),
  loudness: z.object({ names: z.array(text).length(5), label: text, unset: text, notSet: text, hardToSay: text }),
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
