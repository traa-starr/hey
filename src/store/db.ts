import Dexie, { type EntityTable } from "dexie";
import type { Entry, Log } from "./types";

export type Backend = {
  load(): Promise<{ entries: Entry[]; logs: Log[]; kv: Record<string, unknown> }>;
  putLog(l: Log): Promise<void>;
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
  constructor(name: string) {
    super(name);
    this.version(1).stores({ entries: "id, kind, at", kv: "key" });
    // v3 adds what gets noticed over time; existing books carry over untouched
    this.version(2).stores({ entries: "id, kind, at", kv: "key", logs: "id, type, at" });
  }
}

export async function dexieBackend(name = "heyyou"): Promise<Backend> {
  const db = new HeyDB(name);
  await db.open();
  return {
    async load() {
      const [entries, logs, rows] = await Promise.all([db.entries.toArray(), db.logs.toArray(), db.kv.toArray()]);
      return { entries, logs, kv: Object.fromEntries(rows.map((r) => [r.key, r.value])) };
    },
    async putEntry(e) { await db.entries.put(e); },
    async putEntries(es) { await db.entries.bulkPut(es); },
    async deleteEntry(id) { await db.entries.delete(id); },
    async putKV(key, value) { await db.kv.put({ key, value }); },
    async putLog(l) { await db.logs.put(l); },
    async clear() {
      await db.transaction("rw", db.entries, db.kv, db.logs, async () => {
        await Promise.all([db.entries.clear(), db.kv.clear(), db.logs.clear()]);
      });
    }
  };
}

export function memoryBackend(): Backend {
  const entries = new Map<string, Entry>();
  const kv = new Map<string, unknown>();
  const logs = new Map<string, Log>();
  return {
    async load() { return { entries: [...entries.values()], logs: [...logs.values()], kv: Object.fromEntries(kv) }; },
    async putLog(l) { logs.set(l.id, l); },
    async putEntry(e) { entries.set(e.id, e); },
    async putEntries(es) { es.forEach((e) => entries.set(e.id, e)); },
    async deleteEntry(id) { entries.delete(id); },
    async putKV(key, value) { kv.set(key, value); },
    async clear() { entries.clear(); kv.clear(); logs.clear(); }
  };
}
