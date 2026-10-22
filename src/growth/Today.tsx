// Home's growth card: each practice may offer one (today.tsx → useToday), and home shows only the
// one with the highest priority, so home stays calm.
import type { ReactNode } from "react";
import { isOn, plugin } from "./registry";
import type { TodayCard } from "./types";

const hooks = Object.entries(import.meta.glob<() => TodayCard | null>("./*/today.tsx", { eager: true, import: "useToday" }))
  .filter(([path]) => isOn(plugin(path.split("/")[1] ?? "")))
  .map(([, use]) => use);

export function Today(): ReactNode {
  // the list of hooks never changes while the app runs, so calling them in order is safe
  const cards = hooks.map((use) => use()).filter((c): c is TodayCard => !!c);
  if (!cards.length) return null;
  return cards.reduce((a, b) => (b.priority > a.priority ? b : a)).node;
}
