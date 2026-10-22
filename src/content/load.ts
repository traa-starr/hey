// Loads and validates content/. Files are bundled at build time, so the app works offline;
// adding a lesson is still only a JSON change.
import type { ZodType } from "zod";
import * as S from "./schema";

export type Content = {
  start: S.Lesson | null;
  startPath: string;
  intro: string;
  formulas: S.Formula[];
  catchIdeas: string[];
  questions: S.Question[];
  copy: S.Copy;
  help: S.Help | null;
  credits: S.Credits | null;
  practices: (S.Practice & { sets: { path: string; lesson: S.Lesson }[] })[];
  lessons: Record<string, S.Lesson>;
  problems: string[];
};

export type Files = Record<string, unknown>;

export class ContentError extends Error {}

// strict: throw on the first problem (development and tests); otherwise skip broken pieces
export function buildContent(files: Files, strict: boolean): Content {
  const problems: string[] = [];
  const read = <T>(path: string, schema: ZodType<T>): T | null => {
    const raw = files[path];
    if (raw === undefined) {
      problems.push(`${path}: missing`);
      if (strict) throw new ContentError(`content/${path} is missing`);
      return null;
    }
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      const where = issue ? `${issue.path.join(".")}: ${issue.message}` : "invalid";
      problems.push(`${path}: ${where}`);
      if (strict) throw new ContentError(`content/${path} → ${where}`);
      return null;
    }
    return parsed.data;
  };
  const each = <T>(path: string, items: unknown[], schema: ZodType<T>): T[] =>
    items.flatMap((item, n) => {
      const parsed = schema.safeParse(item);
      if (parsed.success) return [parsed.data];
      const issue = parsed.error.issues[0];
      const where = `${path}[${n}]${issue ? ` ${issue.path.join(".")}: ${issue.message}` : ""}`;
      problems.push(where);
      if (strict) throw new ContentError(`content/${where}`);
      return [];
    });

  const index = read("index.json", S.index);
  if (!index) throw new ContentError("content/index.json is missing or invalid");
  const copy = read(index.copy, S.copy);
  if (!copy) throw new ContentError(`content/${index.copy} is missing or invalid`);

  const ff = read(index.formulas, S.formulasFile);
  const qf = read(index.questions, S.questionsFile);
  const lessons: Record<string, S.Lesson> = {};
  const lessonAt = (path: string) => {
    const l = read(path, S.lesson);
    if (l) lessons[path] = l;
    return l;
  };
  const start = lessonAt(index.start);
  const practices = index.practices.map((p) => ({
    ...p,
    sets: p.lessons.flatMap((path) => {
      const lesson = lessonAt(path);
      return lesson ? [{ path, lesson }] : [];
    })
  }));
  return {
    start,
    startPath: index.start,
    intro: ff?.intro ?? "",
    formulas: ff ? each(index.formulas, ff.formulas, S.formula) : [],
    catchIdeas: ff?.catchIdeas ?? [],
    questions: qf ? each(index.questions, qf.questions, S.question) : [],
    copy,
    help: read(index.help, S.help),
    credits: read(index.credits, S.credits),
    practices,
    lessons,
    problems
  };
}

// content/**/*.json, keyed by path inside content/
export function bundledFiles(): Files {
  const mods = import.meta.glob<unknown>("../../content/**/*.json", { eager: true, import: "default" });
  return Object.fromEntries(Object.entries(mods).map(([k, v]) => [k.replace(/^.*?content\//, ""), v]));
}

let cached: Content | null = null;
export function content(): Content {
  if (!cached) cached = buildContent(bundledFiles(), import.meta.env.DEV);
  return cached;
}
