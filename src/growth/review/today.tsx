// Home's look-back card: a finished lesson's main idea, hidden until tapped. Peeking counts as the
// look back, so it's one tap, and the card stays until home is left.
import { useMemo, useState } from "react";
import { content } from "../../content/load";
import { buzz } from "../../lib/feedback";
import { format } from "../../lib/template";
import { href } from "../../router";
import { useData } from "../../store/useStore";
import type { TodayCard } from "../types";
import { COPY, dueLookBack, markSeen, type LookBack } from "./review";
import "./review.css";

const lessons = () => content().paths.flatMap((p) => p.items.map((it) => {
  const t = it.lesson.steps.find((s) => s.type === "takeaway");
  return { key: it.key, title: it.lesson.title, takeaway: t?.type === "takeaway" ? t.text : "" };
}));

export function useToday(): TodayCard | null {
  const { done, grown, ready } = useData();
  const all = useMemo(() => lessons(), []);
  const [shown, setShown] = useState<LookBack | null>(null);
  const due = ready ? dueLookBack(all, done, grown) : null;
  const item = shown ?? due;
  if (!item) return null;
  return {
    priority: 20,
    node: (
      <div className="look-back" data-testid="look-back">
        <p className="label">{COPY.label}</p>
        <p>{format(COPY.ask, { title: item.title })}</p>
        {shown ? (
          <>
            <blockquote tabIndex={-1} ref={(el) => el?.focus({ preventScroll: true })}>{item.takeaway}</blockquote>
            <p className="soft">{COPY.thanks}</p>
            <a className="link" href={href({ name: "lesson", key: item.key })}>{COPY.lesson}</a>
          </>
        ) : (
          <button className="link" type="button" aria-expanded={false} onClick={() => { buzz(4); setShown(item); markSeen(item.key); }}>{COPY.show}</button>
        )}
      </div>
    )
  };
}
