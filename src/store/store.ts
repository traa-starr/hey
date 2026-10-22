// One place that holds the person's data. The screen updates right away; saving happens
// behind it, and if saving fails the app keeps working from memory.
import { dexieBackend, memoryBackend, type Backend } from "./db";
import { fromV1, V1_KEY } from "./migrate";
import { DEFAULT_SETTINGS, freshKV, type Entry, type KV, type Log, type NewLog, type Settings, type State } from "./types";

type Listener = () => void;

const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const byNewest = (a: Entry, b: Entry) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0);

function readLocal(key: string): string | null {
  try {
    return globalThis.localStorage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

export class Store {
  private state: State = { ...freshKV(), entries: [], logs: [], ready: false, persistent: false };
  private listeners = new Set<Listener>();
  private backend: Backend = memoryBackend();

  subscribe = (l: Listener) => {
    this.listeners.add(l);
    return () => this.listeners.delete(l);
  };
  get = () => this.state;

  private set(patch: Partial<State>) {
    this.state = { ...this.state, ...patch };
    this.listeners.forEach((l) => l());
  }
  private save(work: (b: Backend) => Promise<void>) {
    work(this.backend).catch(() => {
      // keep going in memory; the person can still use everything this session
      if (this.state.persistent) this.set({ persistent: false });
    });
  }

  async open(make: () => Promise<Backend> = () => dexieBackend(), v1 = () => readLocal(V1_KEY)) {
    let persistent = true;
    try {
      this.backend = await make();
    } catch {
      this.backend = memoryBackend();
      persistent = false;
    }
    let loaded: Awaited<ReturnType<Backend["load"]>> = { entries: [], logs: [], kv: {} };
    try {
      loaded = await this.backend.load();
    } catch {
      persistent = false;
    }
    const kv = { ...freshKV(), ...(loaded.kv as Partial<KV>) };
    kv.settings = { ...DEFAULT_SETTINGS, ...(kv.settings ?? {}) };
    kv.companion = { ...freshKV().companion, ...(kv.companion ?? {}) };
    kv.done = kv.done ?? {};
    if (!kv.progress || typeof kv.progress !== "object" || "lessonPath" in kv.progress) kv.progress = {};
    let entries = loaded.entries;
    if (!kv.migratedV1) {
      const old = fromV1(v1());
      let ok = true;
      if (old) {
        const have = new Set(entries.map((e) => e.id));
        const add = old.entries.filter((e) => !have.has(e.id));
        entries = entries.concat(add);
        Object.assign(kv, {
          name: kv.name || old.kv.name || "",
          welcomed: kv.welcomed || !!old.kv.welcomed,
          tried: { ...(old.kv.tried ?? {}), ...kv.tried }
        });
        try {
          await this.backend.putEntries(add);
          await Promise.all((["name", "welcomed", "tried"] as const).map((k) => this.backend.putKV(k, kv[k])));
        } catch {
          ok = false;
        }
      }
      // only mark it done once it has really been saved, so a failed move is tried again next time
      if (ok && persistent) {
        try {
          await this.backend.putKV("migratedV1", true);
          kv.migratedV1 = true;
        } catch {
          persistent = false;
        }
      } else {
        persistent = false;
      }
    }
    const logs = (loaded.logs ?? []).slice().sort((a, b) => (a.at < b.at ? -1 : 1));
    this.set({ ...kv, entries: entries.sort(byNewest), logs, ready: true, persistent });
  }

  private setKV<K extends keyof KV>(key: K, value: KV[K]) {
    this.set({ [key]: value } as Partial<State>);
    this.save((b) => b.putKV(key, value));
  }

  setName = (name: string) => this.setKV("name", name.trim());
  setWelcomed = () => this.setKV("welcomed", true);
  markDone = (key: string) => this.setKV("done", { ...this.state.done, [key]: new Date().toISOString() });
  setCompanion = (patch: Partial<KV["companion"]>) => this.setKV("companion", { ...this.state.companion, ...patch });
  // logs are kept oldest first, so trends read left to right
  log = (l: NewLog): Log => {
    const entry = { ...l, id: newId(), at: l.at ?? new Date().toISOString() } as Log;
    this.set({ logs: [...this.state.logs, entry] });
    this.save((b) => b.putLog(entry));
    return entry;
  };
  markTried = (lessonId: string) => this.setKV("tried", { ...this.state.tried, [lessonId]: new Date().toISOString() });
  markAnswered = (questionId: string) => this.setKV("answered", { ...this.state.answered, [questionId]: new Date().toISOString() });
  setProgress = (path: string, p: KV["progress"][string] | null) => {
    const next = { ...this.state.progress };
    if (p) next[path] = p;
    else delete next[path];
    this.setKV("progress", next);
  };
  setSettings = (patch: Partial<Settings>) => this.setKV("settings", { ...this.state.settings, ...patch });

  add = (e: Omit<Entry, "id" | "at"> & { at?: string }): Entry | null => {
    const text = e.text.trim();
    if (!text) return null;
    const entry: Entry = { ...e, text, id: newId(), at: e.at ?? new Date().toISOString() };
    this.set({ entries: [entry, ...this.state.entries] });
    this.save((b) => b.putEntry(entry));
    return entry;
  };
  edit = (id: string, text: string) => {
    const t = text.trim();
    const found = this.state.entries.find((e) => e.id === id);
    if (!found || !t) return;
    const entry = { ...found, text: t };
    this.set({ entries: this.state.entries.map((e) => (e.id === id ? entry : e)) });
    this.save((b) => b.putEntry(entry));
  };
  remove = (id: string) => {
    this.set({ entries: this.state.entries.filter((e) => e.id !== id) });
    this.save((b) => b.deleteEntry(id));
  };
  clearAll = () => {
    const keep = { welcomed: true, migratedV1: true, settings: this.state.settings, companion: this.state.companion };
    // the first version's copy goes too, so nothing old is left on the phone
    try {
      globalThis.localStorage?.removeItem(V1_KEY);
    } catch {
      // nothing more to clear
    }
    this.set({ ...freshKV(), ...keep, entries: [], logs: [] });
    this.save(async (b) => {
      await b.clear();
      await Promise.all(Object.entries(keep).map(([k, v]) => b.putKV(k, v)));
    });
  };
  exportJSON = () =>
    JSON.stringify({ app: "hey you", exported: new Date().toISOString(), name: this.state.name, entries: this.state.entries, logs: this.state.logs }, null, 2);
}

export const store = new Store();
