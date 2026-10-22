import "fake-indexeddb/auto";
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
});
