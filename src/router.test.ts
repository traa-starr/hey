import { describe, expect, it } from "vitest";
import { direction, href, parse } from "./router";

describe("moving between screens", () => {
  const d = (a: string, b: string) => direction(parse(a), parse(b));
  it("slides deeper screens in and back out", () => {
    expect(d("#/learn", "#/path/habits")).toBe("forward");
    expect(d("#/path/habits", "#/lesson/habit:mind")).toBe("forward");
    expect(d("#/lesson/habit:mind", "#/path/habits")).toBe("back");
    expect(d("#/book", "#/book/voice")).toBe("forward");
  });
  it("cross-fades between tabs and keeps still within one screen", () => {
    expect(d("#/", "#/you")).toBe("tab");
    expect(d("#/book", "#/you")).toBe("tab");
    expect(d("#/book/voice", "#/book")).toBe("back");
    expect(d("#/practice", "#/grow/ladder")).toBe("forward");
    expect(d("#/grow/ladder", "#/grow/ladder/climb")).toBe("forward");
    expect(d("#/book/voice", "#/book/about")).toBeNull();
    expect(d("#/you", "#/you")).toBeNull();
  });
  it("reads and writes the same routes", () => {
    for (const h of ["#/", "#/book/keeper", "#/lesson/inner-voice/everyone-has-one", "#/answer/habit/mind", "#/grow/ladder", "#/grow/lines/abc/edit"]) expect(href(parse(h))).toBe(h);
    expect(parse("#/grow")).toEqual({ name: "practice" });
  });
});
