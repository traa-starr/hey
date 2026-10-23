import "fake-indexeddb/auto";
import Dexie from "dexie";
import { describe, expect, it } from "vitest";
import { dexieBackend, memoryBackend } from "./db";
import { fromV1 } from "./migrate";
import { Store } from "./store";

// a real blob in the shape the first version saved
const V1 = JSON.stringify({
  welcomed: true,
  name: "Sam",
  tried: { "want-words": "2026-09-01T10:00:00.000Z" },
  collected: {
    "my-words": [
      { id: "a1", text: "hey sam, you've handled hard weeks before.", from: "talk to you", at: "2026-09-03T08:00:00.000Z", before: 5, after: 3 },
      { id: "a2", text: 'my inner voice said: "i\'m too much."', from: "weigh it", at: "2026-09-03T08:00:00.000Z" },
      { id: "a3", text: "i'd love...", from: "want words", at: "2026-09-01T10:00:00.000Z" }
    ],
    "what-i-like": [{ id: "b1", text: "sunrise", from: "this or that", at: "2026-09-02T09:00:00.000Z" }],
    "what-i-think": [{ id: "c1", text: "i think breakfast for dinner wins because pancakes at night feel like a treat.", from: "i think... because...", at: "2026-09-02T09:05:00.000Z" }]
  }
});

let n = 0;
const fresh = () => () => dexieBackend(`test-${++n}`);

describe("migration from v1", () => {
  it("maps every kind of entry and keeps weights as loudness", () => {
    const out = fromV1(V1)!;
    expect(out.kv).toEqual({ name: "Sam", welcomed: true, tried: { "want-words": "2026-09-01T10:00:00.000Z" } });
    expect(out.entries).toHaveLength(5);
    expect(out.entries.find((e) => e.id === "a1")).toMatchObject({ kind: "voice", before: 5, after: 3, from: "talk to you" });
    expect(out.entries.find((e) => e.id === "a2")).toMatchObject({ kind: "voice", said: true });
    expect(out.entries.find((e) => e.id === "b1")).toMatchObject({ kind: "about", sub: "like", text: "sunrise" });
    expect(out.entries.find((e) => e.id === "c1")).toMatchObject({ kind: "about", sub: "think" });
  });

  it("survives malformed input", () => {
    expect(fromV1(null)).toBeNull();
    expect(fromV1("{not json")).toBeNull();
    expect(fromV1('"text"')).toBeNull();
    const out = fromV1(JSON.stringify({ collected: { "my-words": [null, { text: "" }, { text: "kept", before: 9 }], "other": [{ text: "x" }] } }))!;
    expect(out.entries).toHaveLength(1);
    expect(out.entries[0]).toMatchObject({ text: "kept", kind: "voice" });
    expect(out.entries[0]?.before).toBeUndefined();
  });

  it("moves v1 data into IndexedDB once, and keeps it after reopening", async () => {
    const make = fresh();
    const a = new Store();
    await a.open(make, () => V1);
    expect(a.get().entries).toHaveLength(5);
    expect(a.get().name).toBe("Sam");
    expect(a.get().welcomed).toBe(true);
    expect(a.get().persistent).toBe(true);
    expect(a.get().entries[0]?.id).toBe("a1");

    a.remove("a3");
    await new Promise((r) => setTimeout(r, 20));
    const b = new Store();
    await b.open(() => dexieBackend(`test-${n}`), () => V1);
    expect(b.get().entries).toHaveLength(4);
    expect(b.get().migratedV1).toBe(true);
  });
});

describe("store", () => {
  it("adds, edits, removes and clears", async () => {
    const s = new Store();
    await s.open(fresh(), () => null);
    const e = s.add({ kind: "voice", text: "  you're doing better than you think.  ", from: "talk to you", before: 4, after: 2 })!;
    expect(e.text).toBe("you're doing better than you think.");
    expect(s.add({ kind: "voice", text: "   ", from: "" })).toBeNull();
    s.edit(e.id, "you are doing fine.");
    expect(s.get().entries[0]?.text).toBe("you are doing fine.");
    s.setName("  sam ");
    expect(s.get().name).toBe("sam");
    s.remove(e.id);
    expect(s.get().entries).toHaveLength(0);
    s.add({ kind: "about", sub: "like", text: "i'd pick sunrise.", from: "today" });
    s.clearAll();
    expect(s.get().entries).toHaveLength(0);
    expect(s.get().welcomed).toBe(true);
  });

  it("starts the quick look around once, right after the welcome, and never for earlier readers", async () => {
    const s = new Store();
    await s.open(fresh(), () => null);
    expect(s.get().tour).toBeNull();
    s.setWelcomed();
    expect(s.get().tour).toEqual({ i: 0, end: "" });
    s.setTour({ i: 2, end: "" });
    s.setWelcomed();
    expect(s.get().tour).toEqual({ i: 2, end: "" });
    s.setTour({ i: 2, end: "skipped" });
    s.clearAll();
    expect(s.get().tour).toEqual({ i: 2, end: "skipped" });

    const before = new Store();
    await before.open(fresh(), () => V1);
    expect(before.get().welcomed).toBe(true);
    expect(before.get().tour).toBeNull();
  });

  it("tries the move again next time if saving it failed", async () => {
    const s = new Store();
    const broken = memoryBackend();
    broken.putEntries = () => Promise.reject(new Error("quota"));
    await s.open(async () => broken, () => V1);
    expect(s.get().entries).toHaveLength(5);
    expect(s.get().migratedV1).toBe(false);
    expect(s.get().persistent).toBe(false);
  });

  it("clearing everything also removes the first version's copy", async () => {
    const mem = new Map<string, string>([["heyyou.v1", V1]]);
    const ls = { getItem: (k: string) => mem.get(k) ?? null, removeItem: (k: string) => void mem.delete(k) };
    Object.defineProperty(globalThis, "localStorage", { value: ls, configurable: true });
    const s = new Store();
    await s.open(fresh());
    expect(s.get().entries).toHaveLength(5);
    s.clearAll();
    expect(mem.has("heyyou.v1")).toBe(false);
    Reflect.deleteProperty(globalThis, "localStorage");
  });

  it("keeps each unfinished set's place separately", async () => {
    const s = new Store();
    await s.open(fresh(), () => null);
    s.setProgress("a.json", { i: 2, locals: {} });
    s.setProgress("b.json", { i: 4, locals: {} });
    expect(s.get().progress).toEqual({ "a.json": { i: 2, locals: {} }, "b.json": { i: 4, locals: {} } });
    s.setProgress("a.json", null);
    expect(Object.keys(s.get().progress)).toEqual(["b.json"]);
  });

  it("keeps working in memory when storage can't open", async () => {
    const s = new Store();
    await s.open(() => Promise.reject(new Error("blocked")), () => V1);
    expect(s.get().ready).toBe(true);
    expect(s.get().persistent).toBe(false);
    expect(s.get().entries).toHaveLength(5);
    s.add({ kind: "voice", text: "still works", from: "" });
    expect(s.get().entries[0]?.text).toBe("still works");
  });

  it("notices when saving starts failing", async () => {
    const s = new Store();
    const broken = memoryBackend();
    broken.putEntry = () => Promise.reject(new Error("quota"));
    await s.open(async () => broken, () => null);
    expect(s.get().persistent).toBe(true);
    s.add({ kind: "voice", text: "hello", from: "" });
    await new Promise((r) => setTimeout(r, 0));
    expect(s.get().persistent).toBe(false);
    expect(s.get().entries).toHaveLength(1);
  });

  it("keeps growth practice records, and survives the move from version 2", async () => {
    // a book saved before growth practices existed
    const name = `test-v2-${++n}`;
    const old = new Dexie(name);
    old.version(2).stores({ entries: "id, kind, at", kv: "key", logs: "id, type, at" });
    await old.open();
    await old.table("entries").put({ id: "x1", kind: "voice", text: "still here.", from: "", at: "2026-10-01T10:00:00.000Z" });
    old.close();

    const s = new Store();
    await s.open(() => dexieBackend(name), () => null);
    expect(s.get().entries.map((e) => e.id)).toEqual(["x1"]);
    expect(s.get().grown).toEqual([]);
    const r = s.grow("ladder", "climb", { rungs: ["one"] });
    s.regrow(r.id, { rungs: ["one", "two"], done: true });
    s.grow("feel", "shift", { practice: "ladder" });
    expect(s.get().grown.map((g) => g.feature)).toEqual(["ladder", "feel"]);
    await new Promise((res) => setTimeout(res, 20));

    const again = new Store();
    await again.open(() => dexieBackend(name), () => null);
    expect(again.get().grown.find((g) => g.feature === "ladder")).toMatchObject({ type: "climb", data: { rungs: ["one", "two"], done: true } });
    expect(JSON.parse(again.exportJSON()).grown).toHaveLength(2);
    again.ungrow(r.id);
    expect(again.get().grown).toHaveLength(1);
    again.clearAll();
    expect(again.get().grown).toEqual([]);
  });
});
