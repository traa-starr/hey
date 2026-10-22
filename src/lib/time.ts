export type TimeOfDay = "dawn" | "day" | "dusk" | "night";

export const HUES: Record<TimeOfDay, number> = { dawn: 50, day: 215, dusk: 345, night: 275 };

export function timeOfDay(d = new Date()): TimeOfDay {
  const h = d.getHours();
  if (h < 5 || h >= 21) return "night";
  if (h < 11) return "dawn";
  if (h < 17) return "day";
  return "dusk";
}

export const dayKey = (d = new Date()) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

// a stable pick for the day, so today shows the same line until tomorrow
export function dailyIndex(n: number, d = new Date()): number {
  if (n <= 0) return -1;
  let h = 2166136261;
  for (const c of dayKey(d)) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return (h >>> 0) % n;
}

export function shortDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" }).toLowerCase();
  } catch {
    return "";
  }
}
