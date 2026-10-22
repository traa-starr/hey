import { Icon } from "../../ui/icons";
import type { GrowthPlugin } from "../types";
import tile from "../../../content/growth/lines/tile.json";

// words of one's own, made from a value and a real moment; today's line waits on home until tapped
export const plugin: GrowthPlugin = { id: "lines", order: 2, enabled: true, tile: { ...tile, color: "plum", icon: Icon.sun } };
