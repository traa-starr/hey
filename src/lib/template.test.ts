import { describe, expect, it } from "vitest";
import { fill, finish, format, pieces, trimEnd } from "./template";
import { dailyIndex, timeOfDay } from "./time";

describe("templates", () => {
  it("fills slots and finishes the sentence", () => {
    expect(finish(fill("{first}, and {second}", { first: trimEnd("i messed up again."), second: "i'm still learning." })))
      .toBe("i messed up again, and i'm still learning.");
    expect(finish(fill("{thought}, for now.", { thought: "i'll never figure it out" }))).toBe("i'll never figure it out, for now.");
    expect(finish(fill("i'm {dial} {feeling}", { dial: "really", feeling: "tired" }))).toBe("i'm really tired.");
  });
  it("keeps closing quotes and question marks", () => {
    expect(finish('if a friend said "i\'m so annoying"')).toBe('if a friend said "i\'m so annoying"');
    expect(finish("why?")).toBe("why?");
  });
  it("splits into pieces with empty slots marked", () => {
    expect(pieces("hey {name}, you {rest}", { name: "sam" })).toEqual([
      { text: "hey " }, { text: "sam", slot: "name", empty: false }, { text: ", you " }, { text: "", slot: "rest", empty: true }
    ]);
  });
  it("formats copy", () => expect(format("morning, {name}.", { name: "sam" })).toBe("morning, sam."));
});

describe("time", () => {
  it("names the time of day", () => {
    const at = (h: number) => timeOfDay(new Date(2026, 0, 1, h));
    expect([at(3), at(7), at(13), at(19), at(22)]).toEqual(["night", "dawn", "day", "dusk", "night"]);
  });
  it("picks the same item all day and stays in range", () => {
    const a = dailyIndex(7, new Date(2026, 3, 2, 8));
    expect(dailyIndex(7, new Date(2026, 3, 2, 22))).toBe(a);
    expect(a).toBeGreaterThanOrEqual(0);
    expect(a).toBeLessThan(7);
    expect(dailyIndex(0)).toBe(-1);
  });
});
