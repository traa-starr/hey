// Proof's words, loaded and checked, plus what saving looks like.
import * as z from "zod/mini";
import raw from "../../../content/growth/proof/proof.json";

const text = z.string().check(z.minLength(1));
const file = z.object({
  copy: z.record(z.string(), z.union([z.string(), z.array(z.string()), z.array(z.record(z.string(), z.string()))])),
  ideas: z.object({
    claim: z.array(text),
    predict: z.object({ voice: z.array(text), kind: z.array(text) }),
    plan: z.object({ voice: z.array(text), kind: z.array(text) }),
    kept: z.object({ asVoice: z.array(text), different: z.array(text), between: z.array(text) })
  })
});
const parsed = file.parse(raw);
export const PROOF = { copy: raw.copy, ideas: parsed.ideas };
export const T = raw.copy;

export type Happened = (typeof raw.copy.happened)[number]["id"];
