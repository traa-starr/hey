export type Kind = "voice" | "about" | "keeper";
export type Sub = "like" | "think";

export type Entry = {
  id: string;
  kind: Kind;
  sub?: Sub;
  text: string;
  from: string;
  at: string;
  before?: number;
  after?: number;
  // what the inner voice said, kept only when the person opted in
  said?: boolean;
  // an answer that still holds the inner voice's words: kept, but never resurfaced on home
  holdsSaid?: boolean;
};

// what gets noticed over time: a habit caught in the moment, a daily check-in, a voice check
export type Moment = { id: string; type: "moment"; at: string; habit: string | null; where: string | null; loud: number };
export type CheckIn = { id: string; type: "checkin"; at: string; loud: number; habits: string[] };
export type VoiceCheck = { id: string; type: "check"; at: string; scores: Record<string, number> };
export type Log = Moment | CheckIn | VoiceCheck;

// what the growth practices keep (src/growth/<feature>/): one shape for all of them, so adding a
// practice never needs a database change. each feature owns the meaning of its own `type` and `data`.
export type GrowthRecord = { id: string; feature: string; type: string; at: string; data: Record<string, unknown> };
type LogInput<T extends Log> = Omit<T, "id" | "at"> & { at?: string };
export type NewLog = LogInput<Moment> | LogInput<CheckIn> | LogInput<VoiceCheck>;

// "time" means: follow the phone's light or dark setting
export type Appearance = "time" | "light" | "dark";

export type Settings = {
  readAloud: boolean;
  autoRead: boolean;
  voice: string | null;
  rate: number;
  sound: boolean;
  resurface: boolean;
  appearance: Appearance;
};

// where each unfinished set stopped, keyed by lesson path
export type Progress = Record<string, { i: number; locals: Record<number, Record<string, unknown>> }>;

export type KV = {
  name: string;
  welcomed: boolean;
  tried: Record<string, string>;
  answered: Record<string, string>;
  settings: Settings;
  progress: Progress;
  migratedV1: boolean;
  // finished lessons, keyed by lesson key
  done: Record<string, string>;
  companion: { name: string; on: boolean };
};

export const DEFAULT_SETTINGS: Settings = {
  readAloud: false, autoRead: false, voice: null, rate: 1, sound: false, resurface: true, appearance: "time"
};

export const freshKV = (): KV => ({
  name: "", welcomed: false, tried: {}, answered: {}, settings: { ...DEFAULT_SETTINGS }, progress: {}, migratedV1: false,
  done: {}, companion: { name: "", on: true }
});

export type State = KV & { entries: Entry[]; logs: Log[]; grown: GrowthRecord[]; ready: boolean; persistent: boolean };
