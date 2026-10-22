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
  walk(root).filter((f) => f.endsWith(".json")).map((f) => [relative(root, f), JSON.parse(readFileSync(f, "utf8"))])
);

describe("content", () => {
  const c = buildContent(files, true);

  it("loads every file without problems", () => {
    expect(c.problems).toEqual([]);
    expect(c.start).not.toBeNull();
    expect(c.formulas.length).toBeGreaterThanOrEqual(9);
    expect(c.questions.length).toBeGreaterThan(0);
    expect(c.practices.every((p) => p.sets.length === p.lessons.length)).toBe(true);
  });

  it("keeps the welcome to eight screens or fewer", () => {
    expect(c.start!.steps.length).toBeLessThanOrEqual(8);
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
    for (const [path, json] of Object.entries(files).filter(([p]) => shipped(p))) {
      const text = JSON.stringify(json);
      expect(text.match(avoided)?.[0] ?? null, path).toBeNull();
      // "should" only ever appears as something the inner voice says
      const shoulds = text.match(/[^"]*\bshould\b[^"]*/gi) ?? [];
      const catchIdeas = path === "formulas.json" ? (json as { catchIdeas: string[] }).catchIdeas : [];
      for (const s of shoulds) expect(catchIdeas, `${path}: ${s}`).toContain(s);
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
