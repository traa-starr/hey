// The climb, drawn bottom to top in the person's own sentences.
import { format } from "../../lib/template";
import { COPY, type Rung } from "./ladder";
import "./ladder.css";

export function Ladder({ start, rungs, compact, showBelieve = true }: { start: string; rungs: Rung[]; compact?: boolean; showBelieve?: boolean }) {
  const top = rungs.length;
  return (
    // the first item is the start, so a screen reader hears the climb from the bottom up
    <ol className={`ladder-steps${compact ? " compact" : ""}`} aria-label={COPY.ladderLabel}>
      <li className="ladder-step start" style={{ ["--i" as string]: 0 }}>
        <span className="ladder-tag">{COPY.startTag}</span>
        <span className="ladder-text start-word">{start}</span>
      </li>
      {rungs.map((r, n) => (
        <li key={n} className={`ladder-step${n + 1 === top ? " peak" : ""}`} style={{ ["--i" as string]: n + 1 }}>
          <span className="ladder-tag">{format(n + 1 === top && top > 1 ? COPY.topTag : COPY.rungTag, { n: n + 1 })}</span>
          <span className="ladder-text">{r.text}</span>
          {showBelieve ? <span className="ladder-meta">{format(COPY.believe, { n: r.believe })}</span> : null}
        </li>
      ))}
    </ol>
  );
}
