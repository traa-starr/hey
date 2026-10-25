import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { finish, fill, trimEnd } from "../lib/template";
import { toFirstPerson } from "../lib/person";
import { buildContent, type Files } from "./load";

const root = join(__dirname, "../../content");
const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((f) => (statSync(join(dir, f)).isDirectory() ? walk(join(dir, f)) : [join(dir, f)]));
const files: Files = Object.fromEntries(
  walk(root).filter((f) => f.endsWith(".json")).map((f) => [relative(root, f).replaceAll("\\", "/"), JSON.parse(readFileSync(f, "utf8"))])
);

describe("content", () => {
  const c = buildContent(files, true);

  it("loads every file without problems", () => {
    expect(c.problems).toEqual([]);
    expect(c.start).not.toBeNull();
    expect(c.formulas.length).toBeGreaterThanOrEqual(9);
    expect(c.questions.length).toBeGreaterThan(0);
    expect(c.paths.every((p) => p.items.length === p.lessons.length)).toBe(true);
    expect(c.habits.length).toBe(10);
  });

  it("keeps the welcome short", () => {
    expect(c.start!.steps.length).toBeLessThanOrEqual(8);
  });

  it("keeps the tour short, in order, and visiting every tab", () => {
    const t = c.tour!;
    expect(t.steps.length).toBeLessThanOrEqual(20);
    for (const s of t.steps) expect(s.say.split(/\s+/).length, s.say).toBeLessThanOrEqual(30);
    // each tab is lit once, then its page is shown
    for (const tab of ["home", "learn", "practice", "book", "you"]) {
      const mine = t.steps.filter((s) => s.tab === tab);
      expect(mine.length, tab).toBeGreaterThanOrEqual(2);
    }
    expect(t.steps.filter((s) => s.show === "tab").map((s) => s.tab)).toEqual(["learn", "practice", "book", "you"]);
  });

  it("gives every voice habit a full lesson where spotting it has the right answer", () => {
    const habitPath = c.paths.find((p) => p.id === "habits")!;
    expect(habitPath.items.map((i) => i.habit?.id)).toEqual(c.habits.map((h) => h.id));
    for (const it of habitPath.items) {
      const spot = it.lesson.steps.find((s) => s.type === "spot");
      expect(spot && spot.type === "spot" && spot.options[spot.answer], it.key).toBe(it.habit!.name);
      expect(it.lesson.steps.some((s) => s.type === "takeaway"), it.key).toBe(true);
    }
  });

  it("gives every lesson something to keep and something to try", () => {
    for (const p of c.paths) for (const it of p.items) {
      expect(it.lesson.steps.some((s) => s.type === "takeaway"), it.key).toBe(true);
      expect(it.lesson.steps.some((s) => s.type === "experiment"), it.key).toBe(true);
      const ask = it.lesson.steps.filter((s) => s.type !== "say" && s.type !== "scene" && s.type !== "mine").length;
      expect(ask, `${it.key} needs real interaction`).toBeGreaterThanOrEqual(3);
    }
  });

  it("keeps dawn's bubbles short enough to read at a glance", () => {
    for (const l of Object.values(c.lessons)) for (const s of l.steps) {
      if (s.type === "say") expect(s.text.split(/\s+/).length, `${l.id}: ${s.text}`).toBeLessThanOrEqual(32);
    }
  });

  it("gives every lesson a short background break with a source", () => {
    for (const l of Object.values(c.lessons)) {
      if (l === c.start) continue;
      const know = l.steps.filter((s) => s.type === "know");
      expect(know.length, `${l.id} needs a background card`).toBeGreaterThanOrEqual(1);
      for (const k of know) {
        expect(k.text.split(/\s+/).length, `${l.id}: ${k.text}`).toBeLessThanOrEqual(36);
        expect(k.source.label, l.id).not.toBe("");
      }
    }
  });

  it("opens each later lesson in a path with a look back at the one before", () => {
    for (const p of c.paths) p.items.forEach((it, i) => {
      if (i === 0 || it.habit) return;
      const first = it.lesson.steps[0];
      expect(first?.type === "recall" && first.from, it.key).toBe(p.items[i - 1]!.key);
    });
  });

  it("keeps the book for kind things: no hard feelings or harsh thoughts as keepable ideas", () => {
    const heavy = /\b(sad|stupid|idiot|failed?|hate|worthless|annoyed|embarrassed|disappointed|tired|anxious|worried|stressed|behind)\b/i;
    for (const l of Object.values(c.lessons)) for (const s of l.steps) {
      if (s.type === "write" && s.keep) for (const idea of s.ideas) expect(heavy.test(idea), `${l.id}: ${idea}`).toBe(false);
      if (s.type === "pick" && s.keep) for (const o of s.options) expect(heavy.test(o), `${l.id}: ${o}`).toBe(false);
    }
  });

  it("gives every way to answer a source and an evidence label", () => {
    for (const f of c.formulas) {
      expect(f.source.label, f.id).toBeTruthy();
      expect(f.evidence, f.id).toBeTruthy();
    }
  });

  it("fills every way to answer into a finished sentence", () => {
    const said = "you always mess things up.";
    for (const f of c.formulas) {
      const vals: Record<string, string> = {};
      for (const s of f.slots) {
        vals[s.key] = s.fill === "name" ? "sam" : s.fill === "original" ? trimEnd(said) : s.fill === "original-i" ? trimEnd(toFirstPerson(said)) : (s.chips ?? s.ideas ?? ["x"])[0]!;
      }
      const out = finish(fill(f.template, vals));
      expect(out, f.id).not.toMatch(/\{|\}|\.\.|\s\./);
      expect(out, f.id).toMatch(/[.!?"]$/);
    }
  });

  it("names a real thing to keep for every question", () => {
    for (const q of c.questions) expect(q.as).toContain("{x}");
  });

  it("fails loudly on a broken file in strict mode and skips it otherwise", () => {
    const broken = { ...files, "formulas.json": { intro: "x", catchIdeas: ["a"], formulas: [{ id: "bad" }] } };
    expect(() => buildContent(broken, true)).toThrow(/formulas.json/);
    const soft = buildContent(broken, false);
    expect(soft.formulas).toEqual([]);
    expect(soft.problems.length).toBeGreaterThan(0);
  });
});

describe("words", () => {
  // CLAUDE.md: never toxic, broken, fix, should (as an instruction), wrong, disorder, healing journey
  const avoided = /\b(toxic|broken|fix|fixing|wrong|disorder|healing journey)\b/i;
  const shipped = (path: string) => !path.startsWith("language/");

  it("keeps avoided words out of shipped content", () => {
    const c = buildContent(files, true);
    // "should" only appears as something the inner voice says, or as a quoted word being talked about
    const voiceLines = new Set([...c.catchIdeas, ...c.habits.flatMap((h) => [...h.says, ...h.quiz, h.spot.quote])]);
    const strings = (v: unknown): string[] =>
      typeof v === "string" ? [v] : Array.isArray(v) ? v.flatMap(strings) : v && typeof v === "object" ? Object.values(v).flatMap(strings) : [];
    for (const [path, json] of Object.entries(files).filter(([p]) => shipped(p))) {
      for (const str of strings(json)) {
        expect(str.match(avoided)?.[0] ?? null, `${path}: ${str}`).toBeNull();
        if (/\bshould\b/i.test(str)) {
          const mentioned = str.replace(/"(i )?should[^"]*"/gi, "");
          expect(voiceLines.has(str) || !/\bshould\b/i.test(mentioned), `${path}: ${str}`).toBe(true);
        }
      }
    }
  });

  it("keeps avoided words out of interface code", () => {
    const src = join(__dirname, "..");
    for (const f of walk(src).filter((p) => /\.tsx$/.test(p))) {
      const strings = readFileSync(f, "utf8").match(/"[^"\n]*"|`[^`\n]*`/g) ?? [];
      for (const s of strings) expect(s.match(avoided)?.[0] ?? null, f).toBeNull();
    }
  });
});
