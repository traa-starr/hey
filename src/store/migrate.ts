// Bringing everything from the first version (localStorage "heyyou.v1") into the new store.
import type { Entry, KV, Sub } from "./types";

export const V1_KEY = "heyyou.v1";

const KINDS: Record<string, { kind: Entry["kind"]; sub?: Sub }> = {
  "my-words": { kind: "voice" },
  "what-i-like": { kind: "about", sub: "like" },
  "what-i-think": { kind: "about", sub: "think" }
};

const level = (n: unknown) => (typeof n === "number" && n >= 1 && n <= 5 ? Math.round(n) : undefined);
const str = (s: unknown) => (typeof s === "string" ? s : "");

// pure: v1 JSON in, entries and settings out. malformed pieces are skipped, never fatal.
export function fromV1(raw: string | null): { entries: Entry[]; kv: Partial<KV> } | null {
  if (!raw) return null;
  let d: unknown;
  try {
    d = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!d || typeof d !== "object") return null;
  const v1 = d as Record<string, unknown>;
  const kv: Partial<KV> = {};
  if (typeof v1.name === "string") kv.name = v1.name;
  if (typeof v1.welcomed === "boolean") kv.welcomed = v1.welcomed;
  if (v1.tried && typeof v1.tried === "object") {
    kv.tried = Object.fromEntries(Object.entries(v1.tried as Record<string, unknown>).filter(([, v]) => typeof v === "string")) as Record<string, string>;
  }
  const entries: Entry[] = [];
  const collected = (v1.collected && typeof v1.collected === "object" ? v1.collected : {}) as Record<string, unknown>;
  for (const [key, list] of Object.entries(collected)) {
    const target = KINDS[key];
    if (!target || !Array.isArray(list)) continue;
    list.forEach((item, n) => {
      if (!item || typeof item !== "object") return;
      const e = item as Record<string, unknown>;
      const text = str(e.text).trim();
      if (!text) return;
      const entry: Entry = {
        id: str(e.id) || `v1-${key}-${n}`,
        kind: target.kind,
        text,
        from: str(e.from),
        at: str(e.at) || new Date(0).toISOString()
      };
      if (target.sub) entry.sub = target.sub;
      const before = level(e.before), after = level(e.after);
      if (before) entry.before = before;
      if (after) entry.after = after;
      if (/^my inner voice said:/i.test(text)) entry.said = true;
      entries.push(entry);
    });
  }
  return { entries, kv };
}
