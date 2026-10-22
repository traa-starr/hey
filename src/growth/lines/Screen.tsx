// #/grow/lines (the hub), /new (the workshop), /tune/<id> (is it still true?), /why
import { Hub, Why } from "./Hub";
import { Workshop } from "./Workshop";
import type { GrowthScreenProps } from "../types";

export default function Screen({ sub }: GrowthScreenProps) {
  if (sub === "new") return <Workshop key="new" />;
  if (sub?.startsWith("tune/")) return <Workshop key={sub} tuneId={sub.slice(5)} />;
  if (sub === "why") return <Why />;
  return <Hub />;
}
