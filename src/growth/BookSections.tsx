// Growth sections at the end of your book: each practice may add one (book.tsx → BookSection).
import type { ComponentType } from "react";
import { isOn, plugin, PLUGINS } from "./registry";

const sections = Object.entries(import.meta.glob<ComponentType>("./*/book.tsx", { eager: true, import: "BookSection" }))
  .map(([path, Section]) => ({ id: path.split("/")[1] ?? "", Section }))
  .filter((s) => isOn(plugin(s.id)))
  .sort((a, b) => PLUGINS.findIndex((p) => p.id === a.id) - PLUGINS.findIndex((p) => p.id === b.id));

export function BookSections() {
  return <>{sections.map(({ id, Section }) => <Section key={id} />)}</>;
}
