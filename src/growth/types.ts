// The contract every growth practice (src/growth/<feature>/) plugs into. Owned by the foundation:
// features use it, they don't change it. See docs/growth/PLAN.md.
import type { ComponentType, ReactNode } from "react";
import type { Color } from "../content/schema";

export type GrowthPlugin = {
  // the folder name; the practice lives at #/grow/<id>, and #/grow/<id>/<sub> for deeper screens
  id: string;
  // place among the growth tiles in practice
  order: number;
  // off until the practice is ready for people; while off, nothing of it shows outside development
  enabled: boolean;
  // a tile in practice (leave out for none)
  tile?: { title: string; sub: string; color: Color; icon: ReactNode };
};

// a screen gets what follows #/grow/<id>/ (if anything)
export type GrowthScreenProps = { sub?: string };
export type GrowthScreenModule = { default: ComponentType<GrowthScreenProps> };

// home shows at most one growth card at a time: the one with the highest priority right now.
// a feature's today.tsx exports `useToday(): TodayCard | null` (a hook, so it can read the store).
export type TodayCard = { priority: number; node: ReactNode };
