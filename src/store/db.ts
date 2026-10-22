import Dexie, { type EntityTable } from "dexie";
import type { Entry, GrowthRecord, Log } from "./types";

export type Backend = {
  load(): Promise<{ entries: Entry[]; logs: Log[]; grown: GrowthRecord[]; kv: Record<string, unknown> }>;
  putLog(l: Log): Promise<void>;
  putGrown(g: GrowthRecord): Promise<void>;
  deleteGrown(id: string): Promise<void>;
  putEntry(e: Entry): Promise<void>;
  putEntries(es: Entry[]): Promise<void>;
  deleteEntry(id: string): Promise<void>;
  putKV(key: string, value: unknown): Promise<void>;
  clear(): Promise<void>;
};

type Row = { key: string; value: unknown };

class HeyDB extends Dexie {
  entries!: EntityTable<Entry, "id">;
  kv!: EntityTable<Row, "key">;
  logs!: EntityTable<Log, "id">;
  grown!: EntityTable<GrowthRecord, "id">;
  constructor(name: string) {
    super(name);
    this.version(1).stores({ entries: "id, kind, at", kv: "key" });
    // v3 adds what gets noticed over time; existing books carry over untouched
    this.version(2).stores({ entries: "id, kind, at", kv: "key", logs: "id, type, at" });
    // v3 adds what the growth practices keep (ladder, lines, warm room, proof, feel checks)
    this.version(3).stores({ entries: "id, kind, at", kv: "key", logs: "id, type, at", grown: "id, feature, type, at" });
  }
}

export async function dexieBackend(name = "heyyou"): Promise<Backend> {
  const db = new HeyDB(name);
  await db.open();
  return {
    async load() {
      const [entries, logs, grown, rows] = await Promise.all([db.entries.toArray(), db.logs.toArray(), db.grown.toArray(), db.kv.toArray()]);
      return { entries, logs, grown, kv: Object.fromEntries(rows.map((r) => [r.key, r.value])) };
    },
    async putEntry(e) { await db.entries.put(e); },
    async putEntries(es) { await db.entries.bulkPut(es); },
    async deleteEntry(id) { await db.entries.delete(id); },
    async putKV(key, value) { await db.kv.put({ key, value }); },
    async putLog(l) { await db.logs.put(l); },
    async putGrown(g) { await db.grown.put(g); },
    async deleteGrown(id) { await db.grown.delete(id); },
    async clear() {
      await db.transaction("rw", [db.entries, db.kv, db.logs, db.grown], async () => {
        await Promise.all([db.entries.clear(), db.kv.clear(), db.logs.clear(), db.grown.clear()]);
      });
    }
  };
}

export function memoryBackend(): Backend {
  const entries = new Map<string, Entry>();
  const kv = new Map<string, unknown>();
  const logs = new Map<string, Log>();
  const grown = new Map<string, GrowthRecord>();
  return {
    async load() { return { entries: [...entries.values()], logs: [...logs.values()], grown: [...grown.values()], kv: Object.fromEntries(kv) }; },
    async putLog(l) { logs.set(l.id, l); },
    async putGrown(g) { grown.set(g.id, g); },
    async deleteGrown(id) { grown.delete(id); },
    async putEntry(e) { entries.set(e.id, e); },
    async putEntries(es) { es.forEach((e) => entries.set(e.id, e)); },
    async deleteEntry(id) { entries.delete(id); },
    async putKV(key, value) { kv.set(key, value); },
    async clear() { entries.clear(); kv.clear(); logs.clear(); grown.clear(); }
  };
}
