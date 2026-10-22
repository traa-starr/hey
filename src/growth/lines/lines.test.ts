import { describe, expect, it } from "vitest";
import type { Entry, GrowthRecord } from "../../store/types";
import { LINES, addLead, addTail, candidates, canLead, firstOfDay, insertWord, linesFrom, markAsked, ownWords, todayLine, type Line } from "./lines";

const value = LINES.values.find((v) => v.id === "showing-up")!;
const rec = (data: Record<string, unknown>, at = "2026-10-22T09:00:00.000Z", feature = "lines", type = "line"): GrowthRecord => ({ id: Math.random().toString(36).slice(2), feature, type, at, data });
const line = (text: string, truth = 70): Line => ({ id: text, at: "2026-10-01T00:00:00.000Z", text, value: "x", moment: null, truth });
const entry = (text: string, extra: Partial<Entry> = {}): Entry => ({ id: text, kind: "about", text, from: "x", at: "2026-10-01T00:00:00.000Z", ...extra });

describe("your lines: content", () => {
  it("offers at least 16 values, each with moments to recall", () => {
    expect(LINES.values.length).toBeGreaterThanOrEqual(16);
    for (const v of LINES.values) expect(v.moments.length, v.id).toBeGreaterThanOrEqual(3);
    expect(new Set(LINES.values.map((v) => v.id)).size).toBe(LINES.values.length);
  });
  it("gives every teaching bubble a source, an honest label, and a short length", () => {
    expect(LINES.why.map((w) => w.id).sort()).toEqual(["backfire", "name", "values"]);
    for (const w of LINES.why) {
      expect(w.source.label).toBeTruthy();
      expect(w.source.evidence).toBeTruthy();
      expect(w.text.split(/\s+/).length).toBeLessThanOrEqual(32);
    }
  });
  it("keeps sol's lines short", () => {
    for (const k of ["hubSol", "hubSolReturn", "valueSol", "valueTeach", "momentSol", "momentTeach", "shapeSol", "tuneSol", "trySol", "truthLow", "truthMid", "truthHigh", "keptSol"]) {
      expect(String((LINES.copy as Record<string, unknown>)[k]).split(/\s+/).length, k).toBeLessThanOrEqual(32);
    }
  });
  it("builds clean first-person and named lines for every value, with and without a moment", () => {
    for (const v of LINES.values) for (const name of ["", "Sam"]) for (const moment of [null, v.moments[0]!]) {
      for (const out of candidates({ name, value: v, own: "", moment })) {
        expect(out, v.id).not.toMatch(/\{|\}|\.\.|\s\.|\s{2}|,,/);
        expect(out).toMatch(/[.!?]$/);
        expect(out).not.toMatch(/\byou(r|rs|rself)?\b/);
      }
    }
  });
});

describe("your lines: shaping", () => {
  it("uses the name when there is one, and first person when there is not", () => {
    expect(candidates({ name: "sam", value, own: "", moment: "yesterday with mia" })[0]).toBe("sam shows up, like yesterday with mia.");
    expect(candidates({ name: "", value, own: "", moment: "yesterday with mia" })[0]).toBe("i show up, like yesterday with mia.");
  });
  it("builds a line around a word of the person's own", () => {
    const out = candidates({ name: "sam", value: null, own: "Loyalty", moment: "last week, a call" });
    expect(out[0]).toBe("loyalty is real in sam, like last week, a call.");
    expect(candidates({ name: "", value: null, own: "loyalty", moment: null })[0]).toBe("loyalty is real in me.");
  });
  it("makes lines smaller with lead and tail words", () => {
    expect(addLead("sam shows up.", "sam", "sometimes")).toBe("sam sometimes shows up.");
    expect(addLead("sam sometimes shows up.", "sam", "sometimes")).toBe("sam sometimes shows up.");
    expect(canLead("yesterday, sam shows up.", "sam")).toBe(false);
    expect(addLead("yesterday, sam shows up.", "sam", "often")).toBe("yesterday, sam shows up.");
    expect(addTail("sam shows up.", "in small ways")).toBe("sam shows up, in small ways.");
    expect(addTail("sam shows up, in small ways.", "in small ways")).toBe("sam shows up, in small ways.");
  });
  it("puts a word at the caret, or in place of the selection, with tidy spaces", () => {
    expect(insertWord("sam shows up.", "gently", 12, 12)).toEqual({ text: "sam shows up gently.", caret: 19 });
    expect(insertWord("sam shows up.", "again", 4, 9)).toEqual({ text: "sam again up.", caret: 9 });
    expect(insertWord("", "today", 0, 0)).toEqual({ text: "today", caret: 5 });
  });
});

describe("your lines: the word bank", () => {
  it("draws on the person's own words and past lines, kindest and most-used first", () => {
    const words = ownWords(
      [entry("I love sunrise walks"), entry("sunrise coffee with mia"), entry("you always fail", { kind: "voice", said: true }), entry("hopeless days", { holdsSaid: true })],
      [line("sam keeps promises, like lunch with mia.")]
    );
    expect(words[0]).toBe("sunrise");
    expect(words).not.toContain("fail");
    expect(words).not.toContain("hopeless");
    expect(words).not.toContain("with");
  });
  it("leaves out words already in the line", () => {
    expect(ownWords([entry("sunrise walks")], [], ["sunrise"])).toEqual(["walks"]);
  });
});

describe("your lines: records and today's line", () => {
  it("reads kept lines and skips anything that isn't one", () => {
    const list = linesFrom([
      rec({ text: "sam shows up.", value: "showing up", moment: null, truth: 80 }),
      rec({ text: "x" }),
      rec({ text: "y", value: "z", moment: null, truth: 1 }, "2026-10-22T09:00:00.000Z", "ladder", "climb")
    ]);
    expect(list).toHaveLength(1);
    expect(list[0]!.truth).toBe(80);
  });
  it("shows the same line all day, and prefers lines that felt true", () => {
    const lines = [line("a", 10), line("b", 80), line("c", 90)];
    const d = new Date(2026, 9, 22, 8);
    expect(todayLine(lines, d)).toEqual(todayLine(lines, new Date(2026, 9, 22, 20)));
    for (let day = 1; day < 30; day++) expect(["b", "c"]).toContain(todayLine(lines, new Date(2026, 9, day))!.text);
    expect(todayLine([line("only", 5)], d)!.text).toBe("only");
    expect(todayLine([], d)).toBeNull();
  });
  it("asks for the feel check once on a day", () => {
    const d = new Date(2026, 9, 22, 9);
    const earlier = rec({ text: "x", value: "y", moment: null, truth: 50 }, new Date(2026, 9, 22, 7).toISOString());
    expect(firstOfDay([], d)).toBe(true);
    expect(firstOfDay([earlier], d)).toBe(false);
    expect(firstOfDay([rec({ practice: "lines" }, new Date(2026, 9, 21).toISOString(), "feel", "shift")], d)).toBe(true);
    markAsked(d);
    expect(firstOfDay([], d)).toBe(false);
    expect(firstOfDay([], new Date(2026, 9, 23))).toBe(true);
  });
});
