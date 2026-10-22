import { describe, expect, it } from "vitest";
import type { GrowthRecord } from "../../store/types";
import { BELIEVED, COPY, MAX_RUNGS, POINTS, SOURCES, climbs, holds, pointForSentence, sentenceIdeas, tierFor, topOf } from "./ladder";

const rec = (data: Record<string, unknown>, id = "r1", at = "2026-10-01T10:00:00.000Z", type = "climb", feature = "ladder"): GrowthRecord => ({ id, feature, type, at, data });

describe("one rung up: content", () => {
  it("has at least 12 starting points with 4 or more steps each, 3 to 4 choices per step", () => {
    expect(POINTS.length).toBeGreaterThanOrEqual(12);
    for (const p of POINTS) {
      expect(p.tiers.length, p.id).toBeGreaterThanOrEqual(4);
      for (const t of p.tiers) {
        expect(t.pick.length, p.id).toBeGreaterThanOrEqual(3);
        expect(t.softer.length, p.id).toBeGreaterThanOrEqual(1);
      }
    }
    expect(new Set(POINTS.map((p) => p.id)).size).toBe(POINTS.length);
    expect(new Set(POINTS.map((p) => p.word)).size).toBe(POINTS.length);
  });

  it("has a step for every rung a climb can have", () => {
    for (const p of POINTS) expect(p.tiers.length, p.id).toBeGreaterThanOrEqual(MAX_RUNGS);
  });

  it("keeps the thoughts in first person, lowercase and short", () => {
    for (const p of POINTS) for (const t of p.tiers) for (const x of [...t.pick, ...t.softer]) {
      expect(x, x).toBe(x.toLowerCase());
      expect(/\byou(r|rs|rself)?\b/i.test(x), x).toBe(false);
      expect(x.split(/\s+/).length, x).toBeLessThanOrEqual(22);
    }
  });

  it("keeps sol's bubbles short", () => {
    for (const w of [...COPY.welcome, ...COPY.why, ...COPY.heldSol, ...COPY.shortSol, COPY.shortAgain, COPY.smallerSol, COPY.nearSol, COPY.afterSol, COPY.heldTop]) {
      expect(w.split(/\s+/).length, w).toBeLessThanOrEqual(30);
    }
  });

  it("names a source and an honest evidence label for every claim it teaches", () => {
    expect(SOURCES.map((s) => s.id)).toEqual(expect.arrayContaining(["wood", "gross"]));
    for (const s of SOURCES) {
      expect(s.label).not.toBe("");
      expect(s.evidence).not.toBe("");
    }
  });

  it("never cites the popular emotional ladder", () => {
    expect(JSON.stringify([COPY, SOURCES]).toLowerCase()).not.toContain("emotional ladder");
  });
});

describe("one rung up: the climb", () => {
  it("counts 60 or more as a rung", () => {
    expect(BELIEVED).toBe(60);
    expect(holds(60)).toBe(true);
    expect(holds(59)).toBe(false);
    expect(holds(100)).toBe(true);
    expect(holds(0)).toBe(false);
  });

  it("gives each rung its own step, and the last step again after that", () => {
    const p = POINTS[0]!;
    expect(tierFor(p, 0)).toBe(p.tiers[0]);
    expect(tierFor(p, 2)).toBe(p.tiers[2]);
    expect(tierFor(p, 99)).toBe(p.tiers.at(-1));
  });

  it("finds the starting point of a sentence that was offered, and asks about the rest", () => {
    for (const p of POINTS) for (const x of p.says) expect(pointForSentence(x)?.id).toBe(p.id);
    expect(pointForSentence(`  ${POINTS[0]!.says[0]!.toUpperCase()}  `)?.id).toBe(POINTS[0]!.id);
    expect(pointForSentence("something nobody offered")).toBeNull();
    expect(sentenceIdeas().length).toBe(POINTS.length);
  });

  it("names the top rung", () => {
    expect(topOf([])).toBeNull();
    expect(topOf([{ text: "a", believe: 70 }, { text: "b", believe: 80 }])).toBe("b");
  });
});

describe("one rung up: saved climbs", () => {
  it("reads climbs newest first and skips anything malformed", () => {
    const good = { start: "heavy", rungs: [{ text: "it's heavy right now, and that makes sense.", believe: 80 }], top: "it's heavy right now, and that makes sense." };
    const list = climbs([
      rec(good, "a", "2026-10-01T10:00:00.000Z"),
      rec({ start: 3 }, "bad"),
      rec({ ...good, rungs: [] }, "empty"),
      rec(good, "other", "2026-10-02T10:00:00.000Z", "line", "lines"),
      rec({ ...good, carry: true, extra: "from a future version" }, "b", "2026-10-03T10:00:00.000Z")
    ]);
    expect(list.map((c) => c.id)).toEqual(["b", "a"]);
    expect(list[0]!.carry).toBe(true);
  });
});
