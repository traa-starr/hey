import { describe, expect, it } from "vitest";
import type { GrowthRecord } from "../../store/types";
import { eveningExperiment, experiments, isEvening, proofAgainst, proofs, sameClaim, sources } from "./data";
import { PROOF, T } from "./proof";

const rec = (id: string, feature: string, type: string, data: Record<string, unknown>, at = "2026-10-20T09:00:00.000Z"): GrowthRecord => ({ id, feature, type, at, data });
const exp = (id: string, claim: string, at: string, extra: Record<string, unknown> = {}) =>
  rec(id, "proof", "experiment", { claim, prediction: "p", result: null, closedAt: null, ...extra }, at);

describe("proof records", () => {
  it("skips anything that doesn't parse", () => {
    const grown = [rec("a", "proof", "experiment", { claim: 3 }), rec("b", "proof", "proof", { text: "" }), exp("c", "x", "2026-10-20T09:00:00.000Z"), rec("d", "proof", "proof", { text: "it went fine", from: null })];
    expect(experiments(grown).map((e) => e.id)).toEqual(["c"]);
    expect(proofs(grown).map((p) => p.id)).toEqual(["d"]);
  });

  it("matches the same claim in different words and punctuation, and not a different one", () => {
    expect(sameClaim("if i speak up, they'll think i'm annoying.", "If I speak up they'll think I'm annoying")).toBe(true);
    expect(sameClaim("if i speak up, they will think i am annoying", "if i speak up, they'll think i'm annoying")).toBe(true);
    expect(sameClaim("if i speak up, they'll think i'm annoying.", "if i ask for help, they'll think less of me.")).toBe(false);
    expect(sameClaim("", "")).toBe(false);
  });

  it("finds proof gathered against a claim that comes back, newest first, leaving out the current experiment", () => {
    const grown = [
      exp("e1", "if i speak up, they'll think i'm annoying.", "2026-10-18T09:00:00.000Z"),
      rec("p1", "proof", "proof", { text: "nobody minded", from: "an experiment", experiment: "e1", claim: "if i speak up, they'll think i'm annoying." }, "2026-10-18T20:00:00.000Z"),
      rec("p2", "proof", "proof", { text: "someone thanked me", from: "an experiment", experiment: "e1" }, "2026-10-19T20:00:00.000Z"),
      rec("p3", "proof", "proof", { text: "unrelated", from: null, claim: "if i try it, i'll make a mess of it." })
    ];
    expect(proofAgainst(grown, "If I speak up, they'll think I'm annoying").map((p) => p.id)).toEqual(["p2", "p1"]);
    expect(proofAgainst(grown, "if i speak up, they'll think i'm annoying.", "e1")).toEqual([]);
  });
});

describe("the evening card", () => {
  const now = new Date(2026, 9, 22, 18);
  it("asks about the latest recent open experiment, and never about closed or old ones", () => {
    const list = experiments([
      exp("old", "a", new Date(2026, 9, 15, 9).toISOString()),
      exp("closed", "b", new Date(2026, 9, 22, 9).toISOString(), { closedAt: "2026-10-22T10:00:00.000Z" }),
      exp("today", "c", new Date(2026, 9, 22, 8).toISOString())
    ]);
    expect(eveningExperiment(list, now)?.id).toBe("today");
    expect(eveningExperiment(list.filter((e) => e.id !== "today"), now)).toBeNull();
  });
  it("is only for the evening", () => {
    expect(isEvening(new Date(2026, 9, 22, 16, 59))).toBe(false);
    expect(isEvening(new Date(2026, 9, 22, 17))).toBe(true);
  });
});

describe("other practices' records", () => {
  it("offers ladder tops and lines when they exist, and nothing when they don't", () => {
    expect(sources([])).toEqual([]);
    const grown = [
      rec("c1", "ladder", "climb", { start: "tired", rungs: [], top: "i can take one step." }),
      rec("c2", "ladder", "climb", { start: "tired", rungs: [], top: null }),
      rec("c3", "ladder", "climb", { nonsense: true }),
      rec("l1", "lines", "line", { text: "sam shows up.", value: "showing up", moment: null, truth: 70 }),
      rec("l2", "lines", "line", { text: 4 })
    ];
    expect(sources(grown)).toEqual([{ kind: "ladder", text: "i can take one step." }, { kind: "line", text: "sam shows up." }]);
  });
});

describe("proof's words", () => {
  it("keeps sol's bubbles short and gives every idea list something to tap", () => {
    for (const b of T.whyBubbles) expect(b.split(/\s+/).length, b).toBeLessThanOrEqual(30);
    for (const l of [PROOF.ideas.claim, ...Object.values(PROOF.ideas.predict), ...Object.values(PROOF.ideas.plan), ...Object.values(PROOF.ideas.kept)]) expect(l.length).toBeGreaterThan(0);
    for (const s of T.sourcesList) { expect(s.evidence).toBeTruthy(); expect(s.url).toMatch(/^https:/); }
  });
});
