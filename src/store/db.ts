import Dexie, { type EntityTable } from "dexie";
import type { Entry } from "./types";

export type Backend = {
  load(): Promise<{ entries: Entry[]; kv: Record<string, unknown> }>;
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
  constructor(name: string) {
    super(name);
    this.version(1).stores({ entries: "id, kind, at", kv: "key" });
  }
}

export async function dexieBackend(name = "heyyou"): Promise<Backend> {
  const db = new HeyDB(name);
  await db.open();
  return {
    async load() {
      const [entries, rows] = await Promise.all([db.entries.toArray(), db.kv.toArray()]);
      return { entries, kv: Object.fromEntries(rows.map((r) => [r.key, r.value])) };
    },
    async putEntry(e) { await db.entries.put(e); },
    async putEntries(es) { await db.entries.bulkPut(es); },
    async deleteEntry(id) { await db.entries.delete(id); },
    async putKV(key, value) { await db.kv.put({ key, value }); },
    async clear() { await db.transaction("rw", db.entries, db.kv, async () => { await db.entries.clear(); await db.kv.clear(); }); }
  };
}

export function memoryBackend(): Backend {
  const entries = new Map<string, Entry>();
  const kv = new Map<string, unknown>();
  return {
    async load() { return { entries: [...entries.values()], kv: Object.fromEntries(kv) }; },
    async putEntry(e) { entries.set(e.id, e); },
    async putEntries(es) { es.forEach((e) => entries.set(e.id, e)); },
    async deleteEntry(id) { entries.delete(id); },
    async putKV(key, value) { kv.set(key, value); },
    async clear() { entries.clear(); kv.clear(); }
  };
}
