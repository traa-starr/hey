import { describe, expect, it } from "vitest";
import type { GrowthRecord } from "../../store/types";
import { compose, ownLines, PARTS, visitsOf, voiceOf, WARM } from "./warm";

const rec = (feature: string, type: string, data: Record<string, unknown>, id = Math.random().toString(36)): GrowthRecord => ({ id, feature, type, at: "2026-10-22T10:00:00.000Z", data });

describe("the warm room's content", () => {
  it("gives every quality at least 3 responses across kindness, common humanity and mindfulness", () => {
    expect(WARM.qualities.length).toBeGreaterThanOrEqual(6);
    for (const q of WARM.qualities) {
      expect(PARTS.reduce((n, p) => n + q[p].length, 0), q.id).toBeGreaterThanOrEqual(3);
      for (const p of PARTS) expect(q[p].length, `${q.id} ${p}`).toBeGreaterThanOrEqual(1);
    }
  });
  it("keeps every line short and its source known", () => {
    const words = (s: string) => s.split(/\s+/).length;
    for (const q of WARM.qualities) for (const p of PARTS) for (const t of q[p]) expect(words(t), t).toBeLessThanOrEqual(30);
    for (const w of WARM.why) {
      expect(words(w.say), w.say).toBeLessThanOrEqual(30);
      if (w.know) expect(WARM.sources[w.know.source]?.evidence, w.say).toBeTruthy();
    }
  });
});

describe("what the voice says", () => {
  it("says one thing for each part, in the chosen qualities only", () => {
    const said = compose(["gentle", "wise"], "sam", 0, 0);
    expect(said.map((s) => s.part)).toEqual(PARTS);
    for (const s of said) expect(["gentle", "wise"]).toContain(s.quality);
  });
  it("uses the name when there is one and leaves it out otherwise", () => {
    expect(compose(["warm"], "Sam", 0, 0).some((s) => s.text.startsWith("sam, "))).toBe(true);
    for (const s of compose(["warm"], "", 0, 0)) expect(s.text).not.toMatch(/\{|^,/);
  });
  it("says something new on another try", () => {
    const a = compose(["steady", "funny"], "", 0, 3).map((s) => s.text);
    const b = compose(["steady", "funny"], "", 1, 3).map((s) => s.text);
    a.forEach((t, i) => expect(b[i]).not.toBe(t));
  });
});

describe("reading records", () => {
  it("finds the newest usable voice and drops qualities it doesn't know", () => {
    const v = voiceOf([
      rec("warm", "voice", { name: "old friend", qualities: ["warm"] }, "a"),
      rec("warm", "voice", { name: null, qualities: ["steady", "nope"] }, "b"),
      rec("warm", "voice", { qualities: "x" }, "c")
    ]);
    expect(v).toEqual({ id: "b", name: null, qualities: ["steady"] });
    expect(voiceOf([])).toBeNull();
  });
  it("skips visits that don't parse", () => {
    expect(visitsOf([rec("warm", "visit", { lines: ["kind"], thing: null }), rec("warm", "visit", { lines: 3 })])).toHaveLength(1);
  });
  it("reads lines from the lines practice carefully, preferring believable ones", () => {
    const own = ownLines([
      rec("lines", "line", { text: "sam shows up.", truth: 80 }),
      rec("lines", "line", { text: "far from true", truth: 20 }),
      rec("lines", "line", { nonsense: true }),
      rec("proof", "proof", { text: "x" })
    ]);
    expect(own).toEqual(["sam shows up."]);
  });
});
