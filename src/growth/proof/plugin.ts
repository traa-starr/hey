import { createElement as h } from "react";
import type { GrowthPlugin } from "../types";

// proof: try a thought in real life, and keep what turns up
const icon = h("svg", { viewBox: "0 0 24 24", "aria-hidden": true }, h("circle", { cx: 10.5, cy: 10.5, r: 6 }), h("path", { d: "M15 15l5 5M8 10.5l2 2 3.5-3.5" }));

export const plugin: GrowthPlugin = {
  id: "proof",
  order: 4,
  enabled: true,
  tile: { title: "proof", sub: "try a thought in real life", color: "blue", icon }
};
