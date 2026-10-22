import { describe, expect, it } from "vitest";
import type { Formula, Habit } from "../content/schema";
import type { Entry, Log } from "../store/types";
import { byMonth, constellation, metHabits, shifts, wayUse } from "./book";

const at = (m: number, d: number) => new Date(2026, m - 1, d, 12).toISOString();
const e = (id: string, over: Partial<Entry> = {}): Entry => ({ id, kind: "voice", text: id, from: "talk to you", at: at(10, 1), ...over });

describe("the cover", () => {
  const entries = Array.from({ length: 30 }, (_, i) => e(`e${i}`, { at: at(10, 1 + (i % 28)), kind: i % 3 ? "voice" : "about" }));
  const stars = constellation(entries, 320, 210);
  it("gives every kept thing a star inside the cover", () => {
    expect(stars).toHaveLength(30);
    for (const s of stars) {
      expect(s.x).toBeGreaterThan(0);
      expect(s.x).toBeLessThan(320);
      expect(s.y).toBeGreaterThan(0);
      expect(s.y).toBeLessThan(210);
    }
  });
  it("puts the oldest star near the middle and only links to older stars", () => {
    const first = stars[0]!;
    expect(Math.hypot(first.x - 160, first.y - 105)).toBeLessThan(40);
    stars.forEach((s, i) => { if (s.link !== null) expect(s.link).toBeLessThan(i); });
    expect(stars.filter((s) => s.link !== null).length).toBeGreaterThan(20);
  });
  it("stays the same from one look to the next", () => {
    expect(constellation([...entries].reverse(), 320, 210)).toEqual(stars);
  });
  it("keeps the newest stars when there are very many", () => {
    expect(constellation(entries, 320, 210, 10).map((s) => s.id)).toEqual(stars.slice(-10).map((s) => s.id));
  });
});

describe("after you answered", () => {
  it("keeps answers with a loudness before and after, oldest first, never the inner voice's own words", () => {
    const list = shifts([
      e("b", { at: at(10, 3), before: 4, after: 2 }),
      e("a", { at: at(10, 2), before: 5, after: 5 }),
      e("said", { at: at(10, 2), before: 5, after: 2, said: true }),
      e("no-after", { before: 3 }),
      e("about", { kind: "about", before: 3, after: 1 })
    ]);
    expect(list).toEqual([
      { id: "a", at: at(10, 2), before: 5, after: 5 },
      { id: "b", at: at(10, 3), before: 4, after: 2 }
    ]);
  });
});

describe("your range", () => {
  it("counts kept answers per way", () => {
    const formulas = [{ id: "talk-to-you", name: "talk to you" }, { id: "and", name: "and" }] as Formula[];
    const use = wayUse(formulas, [e("1"), e("2"), e("3", { from: "and" }), e("4", { from: "a lesson" }), e("5", { said: true }), e("6", { kind: "keeper" })]);
    expect(use).toEqual({ "talk-to-you": 2, and: 1 });
  });
  it("meets a habit through its lesson or by catching it", () => {
    const habits = [{ id: "mind" }, { id: "rules" }, { id: "label" }] as Habit[];
    const logs: Log[] = [{ id: "1", type: "moment", at: at(10, 1), habit: "rules", where: null, loud: 3 }];
    expect([...metHabits(habits, { "habit:mind": at(10, 1) }, logs)]).toEqual(["mind", "rules"]);
  });
});

describe("pages", () => {
  it("groups entries by month, newest first", () => {
    const groups = byMonth([e("sep", { at: at(9, 20) }), e("oct2", { at: at(10, 9) }), e("oct1", { at: at(10, 2) })]);
    expect(groups.map((g) => [g.month, g.items.map((x) => x.id)])).toEqual([["2026-10", ["oct2", "oct1"]], ["2026-09", ["sep"]]]);
  });
});
