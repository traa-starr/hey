import type { GrowthPlugin } from "../types";

// the shared feel check: no tile of its own, only its section in the book
export const plugin: GrowthPlugin = { id: "feel", order: 0, enabled: true };
