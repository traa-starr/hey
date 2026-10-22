import type { GrowthPlugin } from "../types";

// spaced look-backs at finished lessons: no tile, only a quiet card on home now and then
export const plugin: GrowthPlugin = { id: "review", order: 0, enabled: true };
