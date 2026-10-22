import { describe, expect, it } from "vitest";
import type { GrowthRecord } from "../store/types";
import { moved, shifts } from "./feel/feel";
import { manifestFolders, PLUGINS, screenLoaders } from "./registry";

describe("growth practices", () => {
  it("each lives in a folder named after its id, and ids are unique", () => {
    for (const { folder, id } of manifestFolders()) expect(id, `src/growth/${folder}/plugin.ts`).toBe(folder);
    const ids = PLUGINS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it("a practice with a tile has a screen to open", () => {
    const withScreen = new Set(screenLoaders().map(([id]) => id));
    for (const p of PLUGINS.filter((x) => x.tile)) expect(withScreen.has(p.id), `src/growth/${p.id}/Screen.tsx`).toBe(true);
  });
  it("every screen belongs to a practice", () => {
    const ids = new Set(PLUGINS.map((p) => p.id));
    for (const [id] of screenLoaders()) expect(ids.has(id), `src/growth/${id}/plugin.ts`).toBe(true);
  });
});

describe("the feel check", () => {
  const f = (light: number, open: number, word: string | null = null) => ({ light, open, word });
  const rec = (data: Record<string, unknown>, feature = "feel", type = "shift"): GrowthRecord => ({ id: Math.random().toString(36), feature, type, at: "2026-10-22T10:00:00.000Z", data });
  it("reads saved shifts and skips anything that isn't one", () => {
    const list = shifts([
      rec({ practice: "ladder", before: f(3, 4, "tense"), after: f(6, 6, "steadier") }),
      rec({ practice: "ladder" }),
      rec({ practice: "x", before: f(1, 1), after: f(1, 1) }, "ladder", "climb")
    ]);
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({ practice: "ladder", before: { word: "tense" }, after: { light: 6 } });
  });
  it("says how far each dial moved, in either direction", () => {
    expect(moved(f(3, 7), f(6, 5))).toEqual({ light: 3, open: -2 });
  });
});
