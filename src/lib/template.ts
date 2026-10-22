// Filling a frame like "{first}, and {second}" with the person's own words.

export const trimEnd = (s: string | undefined) => String(s ?? "").trim().replace(/[.!?]+$/, "");
export const tidy = (s: string) => s.replace(/([.!?])\.+/g, "$1").replace(/\s+([.,!?])/g, "$1").replace(/\s{2,}/g, " ");

export function finish(s: string): string {
  const t = tidy(s.trim());
  return !t || /[.!?"”]$/.test(t) ? t : `${t}.`;
}

export function fill(template: string, vals: Record<string, string | undefined>): string {
  return tidy(template.replace(/\{(\w+)\}/g, (_, k: string) => (vals[k] ?? "").trim()));
}

export type Piece = { text: string; slot?: string; empty?: boolean };

// the same template as pieces, so the screen can show unfilled slots
export function pieces(template: string, vals: Record<string, string | undefined>): Piece[] {
  const out: Piece[] = [];
  let last = 0;
  for (const m of template.matchAll(/\{(\w+)\}/g)) {
    if (m.index > last) out.push({ text: template.slice(last, m.index) });
    const key = m[1] ?? "";
    const v = (vals[key] ?? "").trim();
    out.push({ text: v, slot: key, empty: !v });
    last = m.index + m[0].length;
  }
  if (last < template.length) out.push({ text: template.slice(last) });
  return out;
}

export const format = (s: string, vals: Record<string, string | number>) =>
  s.replace(/\{(\w+)\}/g, (m, k: string) => (k in vals ? String(vals[k]) : m));
