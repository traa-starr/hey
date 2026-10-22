// Loads and validates content/. Files are bundled at build time, so the app works offline;
// adding a lesson, habit, or question is still only a JSON change.
import type { ZodMiniType } from "zod/mini";
import { habitLesson } from "./habitLesson";
import * as S from "./schema";

export type PathItem = { key: string; lesson: S.Lesson; habit?: S.Habit };
export type Content = {
  start: S.Lesson | null;
  intro: string;
  formulas: S.Formula[];
  catchIdeas: string[];
  questions: S.Question[];
  habits: S.Habit[];
  habitsNote: string;
  habitsSource: { label: string; url: string };
  paths: (S.Path & { items: PathItem[] })[];
  lessons: Record<string, S.Lesson>;
  copy: S.Copy;
  help: S.Help | null;
  credits: S.Credits | null;
  problems: string[];
};

export type Files = Record<string, unknown>;

export class ContentError extends Error {}

// a lesson's key is its file path without ".json", or "habit:<id>" for a voice habit
export const lessonKey = (ref: string) => ref.replace(/\.json$/, "");

// strict: throw on the first problem (development and tests); otherwise skip broken pieces
export function buildContent(files: Files, strict: boolean): Content {
  const problems: string[] = [];
  const fail = (where: string) => {
    problems.push(where);
    if (strict) throw new ContentError(`content/${where}`);
  };
  const read = <T>(path: string, schema: ZodMiniType<T>): T | null => {
    const raw = files[path];
    if (raw === undefined) {
      fail(`${path}: missing`);
      return null;
    }
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      fail(`${path} → ${issue ? `${issue.path.join(".")}: ${issue.message}` : "invalid"}`);
      return null;
    }
    return parsed.data;
  };
  const each = <T>(path: string, items: unknown[], schema: ZodMiniType<T>): T[] =>
    items.flatMap((item, n) => {
      const parsed = schema.safeParse(item);
      if (parsed.success) return [parsed.data];
      const issue = parsed.error.issues[0];
      fail(`${path}[${n}]${issue ? ` ${issue.path.join(".")}: ${issue.message}` : ""}`);
      return [];
    });

  const index = read("index.json", S.index);
  if (!index) throw new ContentError("content/index.json is missing or invalid");
  const copy = read(index.copy, S.copy);
  if (!copy) throw new ContentError(`content/${index.copy} is missing or invalid`);

  const ff = read(index.formulas, S.formulasFile);
  const qf = read(index.questions, S.questionsFile);
  const hf = read(index.habits, S.habitsFile);
  const habits = hf ? each(index.habits, hf.habits, S.habit) : [];
  const habitsSource = hf?.source ?? { label: "", url: "" };
  const formulas = ff ? each(index.formulas, ff.formulas, S.formula) : [];

  const lessons: Record<string, S.Lesson> = {};
  const lessonAt = (ref: string): PathItem | null => {
    const key = lessonKey(ref);
    if (ref.startsWith("habit:")) {
      const h = habits.find((x) => x.id === ref.slice(6));
      if (!h) {
        fail(`${index.habits}: no habit "${ref.slice(6)}"`);
        return null;
      }
      const lesson = habitLesson(h, habits, habitsSource, hf?.evidence ?? "", copy);
      lessons[key] = lesson;
      return { key, lesson, habit: h };
    }
    const lesson = read(ref, S.lesson);
    if (!lesson) return null;
    lessons[key] = lesson;
    return { key, lesson };
  };
  const startItem = lessonAt(index.start);
  const paths = index.paths.map((p) => ({ ...p, items: p.lessons.flatMap((ref) => lessonAt(ref) ?? []) }));

  // ways to answer that a habit points to must exist
  for (const h of habits) for (const a of h.answers) if (!formulas.some((f) => f.id === a.way)) fail(`${index.habits}: ${h.id} names an unknown way "${a.way}"`);

  return {
    start: startItem?.lesson ?? null,
    intro: ff?.intro ?? "",
    formulas,
    catchIdeas: ff?.catchIdeas ?? [],
    questions: qf ? each(index.questions, qf.questions, S.question) : [],
    habits,
    habitsNote: hf?.note ?? "",
    habitsSource,
    paths,
    lessons,
    copy,
    help: read(index.help, S.help),
    credits: read(index.credits, S.credits),
    problems
  };
}

// content/**/*.json, keyed by path inside content/
export function bundledFiles(): Files {
  const mods = import.meta.glob<unknown>(["../../content/**/*.json", "!../../content/language/**"], { eager: true, import: "default" });
  return Object.fromEntries(Object.entries(mods).map(([k, v]) => [k.replace(/^.*?content\//, ""), v]));
}

let cached: Content | null = null;
export function content(): Content {
  if (!cached) cached = buildContent(bundledFiles(), import.meta.env.DEV);
  return cached;
}

// where to go next: the first unfinished lesson, path by path
export function nextLesson(c: Content, done: Record<string, string>) {
  for (const p of c.paths) {
    const n = p.items.findIndex((it) => !done[it.key]);
    if (n >= 0) return { path: p, item: p.items[n]!, n: n + 1, total: p.items.length };
  }
  return null;
}
