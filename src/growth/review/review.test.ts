import { describe, expect, it } from "vitest";
import type { GrowthRecord } from "../../store/types";
import { dueLookBack } from "./review";

const lessons = [
  { key: "a", title: "a", takeaway: "idea a" },
  { key: "b", title: "b", takeaway: "idea b" },
  { key: "c", title: "c", takeaway: "" }
];
const at = (day: number, hour = 9) => new Date(2026, 9, day, hour).toISOString();
const seen = (key: string, day: number): GrowthRecord => ({ id: `${key}${day}`, feature: "review", type: "seen", at: at(day), data: { key } });

describe("look backs", () => {
  it("waits a day after a lesson is finished", () => {
    expect(dueLookBack(lessons, { a: at(1) }, [], new Date(at(1, 20)))).toBeNull();
    expect(dueLookBack(lessons, { a: at(1) }, [], new Date(at(2, 10)))?.key).toBe("a");
  });
  it("spaces each next look back further out: 1, 3, 7, then 21 days", () => {
    const done = { a: at(1) };
    expect(dueLookBack(lessons, done, [seen("a", 2)], new Date(at(4, 10)))).toBeNull();
    expect(dueLookBack(lessons, done, [seen("a", 2)], new Date(at(5, 10)))?.key).toBe("a");
    expect(dueLookBack(lessons, done, [seen("a", 2), seen("a", 5)], new Date(at(12, 10)))?.key).toBe("a");
    const four = [seen("a", 2), seen("a", 5), seen("a", 12), seen("a", 1)].map((s, i) => ({ ...s, at: at([2, 5, 12, 20][i]!) }));
    expect(dueLookBack(lessons, done, four, new Date(at(28, 10)))).toBeNull();
  });
  it("shows at most one a day, and picks the most overdue", () => {
    const done = { a: at(1), b: at(3) };
    expect(dueLookBack(lessons, done, [], new Date(at(10, 10)))?.key).toBe("a");
    expect(dueLookBack(lessons, done, [seen("b", 10)], new Date(at(10, 20)))).toBeNull();
  });
  it("skips lessons without a main idea and records that aren't look backs", () => {
    const odd: GrowthRecord = { id: "x", feature: "review", type: "seen", at: at(2), data: {} };
    expect(dueLookBack(lessons, { c: at(1) }, [odd], new Date(at(9)))).toBeNull();
  });
});
