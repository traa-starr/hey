import { createElement } from "react";
import tile from "../../../content/growth/warm/tile.json";
import type { GrowthPlugin } from "../types";

// a small hearth: a small flame, as line art like the other tile icons
const icon = createElement(
  "svg",
  { viewBox: "0 0 24 24", "aria-hidden": true },
  createElement("path", { d: "M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2 1-3.2 2-4.5.4 1.2 1 1.8 1.8 2.2C10.5 8 11 5.5 12 3z" })
);

export const plugin: GrowthPlugin = {
  id: "warm",
  order: 3,
  enabled: true,
  tile: { title: tile.title, sub: tile.sub, color: "mint", icon }
};
