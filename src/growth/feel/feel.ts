// The feel check every practice opens and closes with: heavy↔light, tight↔open (0 to 10), and a
// word if one fits. Naming a feeling softens it (Lieberman et al., 2007). Shifts are saved here,
// and shown in the book; a shift is never scored, and no shift is a fine result too.
import * as z from "zod/mini";
import raw from "../../../content/growth/feel/feel.json";
import { store } from "../../store/store";
import type { GrowthRecord } from "../../store/types";

const file = z.object({
  copy: z.record(z.string(), z.union([z.string(), z.array(z.string())])),
  words: z.array(z.string().check(z.minLength(1)))
});
export const FEEL = file.parse(raw) as typeof raw;

export type Feel = { light: number; open: number; word: string | null };
export const middle = (): Feel => ({ light: 5, open: 5, word: null });

const feel = z.object({ light: z.number(), open: z.number(), word: z.nullable(z.string()) });
const shift = z.object({ practice: z.string(), before: feel, after: feel, ref: z.optional(z.string()) });
export type Shift = z.infer<typeof shift> & { id: string; at: string };

// practice: the feature id ("ladder", "lines", ...); ref: that feature's own record, if any
export function saveShift(practice: string, before: Feel, after: Feel, ref?: string) {
  return store.grow("feel", "shift", { practice, before, after, ...(ref ? { ref } : {}) });
}

// every saved shift, oldest first; anything malformed is skipped
export function shifts(grown: GrowthRecord[]): Shift[] {
  return grown.flatMap((g) => {
    if (g.feature !== "feel" || g.type !== "shift") return [];
    const p = shift.safeParse(g.data);
    return p.success ? [{ ...p.data, id: g.id, at: g.at }] : [];
  });
}

// how far each dial moved: plain numbers, for showing, never for judging
export const moved = (a: Feel, b: Feel) => ({ light: b.light - a.light, open: b.open - a.open });
