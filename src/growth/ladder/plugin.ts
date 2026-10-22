import { createElement as h } from "react";
import type { GrowthPlugin } from "../types";

// one rung up: think your way up from a heavy moment, a believable step at a time. a tile in practice and
// a section in the book, no card on home.
export const plugin: GrowthPlugin = {
  id: "ladder",
  order: 1,
  enabled: true,
  tile: {
    title: "one rung up",
    sub: "for heavy moments",
    color: "orange",
    icon: h("svg", { viewBox: "0 0 24 24", "aria-hidden": true }, h("path", { d: "M7 3v18M17 3v18M7 8h10M7 13h10M7 18h10" }))
  }
};
