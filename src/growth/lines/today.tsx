// Home's card: one of the person's own lines, a new one each day, hidden until tapped. With no
// lines yet, a gentle invitation and nothing more.
import { useMemo, useState } from "react";
import { buzz } from "../../lib/feedback";
import { format } from "../../lib/template";
import { href } from "../../router";
import { useData } from "../../store/useStore";
import type { TodayCard } from "../types";
import { T, linesFrom, todayLine } from "./lines";
import "./lines.css";

export function useToday(): TodayCard | null {
  const { grown, name, ready } = useData();
  const [shown, setShown] = useState(false);
  const line = useMemo(() => todayLine(linesFrom(grown)), [grown]);
  if (!ready) return null;
  const priority = new Date().getHours() < 12 ? 30 : 10;
  const who = name.trim().toLowerCase();
  if (!line) {
    return {
      priority,
      node: (
        <div className="lines-today" data-testid="lines-invite">
          <p className="label">{T.todayLabel}</p>
          <p>{T.todayEmpty}</p>
          <a className="link" href={href({ name: "grow", feature: "lines", sub: "new" })} onClick={() => buzz(4)}>{T.todayStart}</a>
        </div>
      )
    };
  }
  return {
    priority,
    node: (
      <div className="lines-today" data-testid="lines-today">
        <p className="label">{T.todayLabel}</p>
        {shown ? (
          <>
            <blockquote tabIndex={-1} ref={(el) => el?.focus({ preventScroll: true })}>{line.text}</blockquote>
            <p className="soft">{who ? format(T.todayMade, { name: who }) : T.todayMadeNoName} {T.todayThanks}</p>
            <a className="link" href={href({ name: "grow", feature: "lines", sub: `tune/${line.id}` })}>{T.tune}</a>
          </>
        ) : (
          <button className="link" type="button" aria-expanded={false} onClick={() => { buzz(4); setShown(true); }}>{T.todayShow}</button>
        )}
      </div>
    )
  };
}
