import { describe, expect, it } from "vitest";
import type { Habit } from "../content/schema";
import type { Log } from "../store/types";
import { deck, loudness, places, scoreCheck, weights } from "./voice";

const h = (id: string, quiz: string[]): Habit => ({
  id, name: `the ${id}`, short: id, color: "violet", glyph: "eye", says: quiz, quiz, job: "j", misses: "m",
  spot: { scene: "s", quote: "q" }, answers: [{ way: "and", line: "l" }], keep: "k", try: "t"
});
const habits = [h("a", ["a1", "a2"]), h("b", ["b1", "b2"]), h("c", ["c1"])];
const at = (d: number) => new Date(2026, 9, d, 12).toISOString();

describe("voice check", () => {
  it("interleaves habits so the same one never comes twice in a row", () => {
    expect(deck(habits).map((x) => x.line)).toEqual(["a1", "b1", "c1", "a2", "b2"]);
  });
  it("scores each habit from 0 to 1", () => {
    const cards = deck(habits);
    expect(scoreCheck(cards, [2, 0, 1, 2, 1])).toEqual({ a: 1, b: 0.25, c: 0.5 });
  });
});

describe("voice map", () => {
  const logs: Log[] = [
    { id: "1", type: "check", at: at(1), scores: { a: 0.5, b: 1, c: 0 } },
    { id: "2", type: "moment", at: at(2), habit: "a", where: "work", loud: 4 },
    { id: "3", type: "moment", at: at(2), habit: "a", where: "work", loud: 2 },
    { id: "4", type: "moment", at: at(3), habit: "c", where: "home", loud: 5 },
    { id: "5", type: "checkin", at: at(4), loud: 1, habits: [] }
  ];
  it("ranks habits by the latest check, nudged by what was caught", () => {
    const w = weights(habits, logs);
    expect(w.map((x) => x.habit.id)).toEqual(["b", "a", "c"]);
    expect(w.find((x) => x.habit.id === "a")?.caught).toBe(2);
  });
  it("leaves habits out until there's something to show", () => {
    expect(weights(habits, [])).toEqual([]);
  });
  it("counts where habits show up", () => {
    expect(places(logs)).toEqual([{ place: "work", n: 2 }, { place: "home", n: 1 }]);
  });
  it("averages loudness by day, oldest first", () => {
    expect(loudness(logs).map((p) => p.loud)).toEqual([3, 5, 1]);
  });
});
