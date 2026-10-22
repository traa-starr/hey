export type Kind = "voice" | "about";
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
};

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

export type Progress = { lessonPath: string; i: number; local: Record<string, unknown> } | null;

export type KV = {
  name: string;
  welcomed: boolean;
  tried: Record<string, string>;
  answered: Record<string, string>;
  settings: Settings;
  progress: Progress;
  migratedV1: boolean;
};

export const DEFAULT_SETTINGS: Settings = {
  readAloud: false, autoRead: false, voice: null, rate: 1, sound: false, resurface: true, appearance: "time"
};

export const freshKV = (): KV => ({
  name: "", welcomed: false, tried: {}, answered: {}, settings: { ...DEFAULT_SETTINGS }, progress: null, migratedV1: false
});

export type State = KV & { entries: Entry[]; ready: boolean; persistent: boolean };
