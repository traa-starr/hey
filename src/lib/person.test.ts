import { describe, expect, it } from "vitest";
import { toFirstPerson, toSecondPerson } from "./person";

describe("toFirstPerson", () => {
  it.each([
    ["you always mess things up.", "i always mess things up."],
    ["you're too much.", "i'm too much."],
    ["you should be further along by now.", "i should be further along by now."],
    ["why are you like this?", "why am i like this?"],
    ["nobody wants you around.", "nobody wants me around."],
    ["you've ruined it and you know it.", "i've ruined it and i know it."],
    ["they're annoyed with you.", "they're annoyed with me."],
    ["your fault, as usual.", "my fault, as usual."],
    ["i'm not good enough.", "i'm not good enough."]
  ])("%s → %s", (a, b) => expect(toFirstPerson(a)).toBe(b));
});

describe("toSecondPerson", () => {
  it.each([
    ["i'd pick sunrise.", "you'd pick sunrise."],
    ["i think breakfast for dinner wins, because pancakes at night feel like a treat.", "you think breakfast for dinner wins, because pancakes at night feel like a treat."],
    ["for now, i'm a night person.", "for now, you're a night person."],
    ["i'd love a quiet morning to myself.", "you'd love a quiet morning to yourself."],
    ["a little mess is cozy.", "a little mess is cozy."],
    ["i’m curious about my own taste.", "you're curious about your own taste."],
    ["it helps me think.", "it helps you think."]
  ])("%s → %s", (a, b) => expect(toSecondPerson(a)).toBe(b));

  it("leaves words that only contain i alone", () => {
    expect(toSecondPerson("tidy kitchens inspire me")).toBe("tidy kitchens inspire you");
  });
});
