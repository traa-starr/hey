// Before and after, side by side: where each dial was (hollow) and where it is now (filled).
import { format } from "../../lib/template";
import { FEEL, type Feel } from "./feel";
import "./feel.css";

const describe = (f: Feel) => format(FEEL.copy.feelText, { light: f.light, open: f.open }) + (f.word ? `, ${f.word}` : "");

export function Shift({ before, after, compact }: { before: Feel; after: Feel; compact?: boolean }) {
  const t = FEEL.copy;
  const row = (key: "light" | "open", ends: string[]) => {
    const a = before[key] * 10, b = after[key] * 10;
    return (
      <div className="fs-row">
        <span className="end">{ends[0]}</span>
        <span className="track">
          <span className="span" style={{ left: `${Math.min(a, b)}%`, width: `${Math.abs(b - a)}%` }} />
          <span className="was" style={{ left: `${a}%` }} />
          <span className="now" style={{ left: `${b}%` }} />
        </span>
        <span className="end">{ends[1]}</span>
      </div>
    );
  };
  return (
    <div className={`feel-shift${compact ? " compact" : ""}`} role="img" aria-label={format(t.shiftLabel, { before: describe(before), after: describe(after) })}>
      {row("light", t.lightEnds)}
      {row("open", t.openEnds)}
      {before.word || after.word ? (
        <p className="words"><span>{before.word ?? "·"}</span><span aria-hidden="true">→</span><b>{after.word ?? "·"}</b></p>
      ) : null}
    </div>
  );
}
