// past ladders: each climb in the book, in the words that were true enough to stand on
import { useState } from "react";
import { format } from "../../lib/template";
import { shortDate } from "../../lib/time";
import { store } from "../../store/store";
import { useData } from "../../store/useStore";
import { Ladder } from "./Ladder";
import { climbs, COPY } from "./ladder-logic";
import "./ladder.css";

export function BookSection() {
  const { grown } = useData();
  const [note, setNote] = useState(false);
  const list = climbs(grown).slice(0, 5);
  if (!list.length) return null;
  return (
    <section className="section" aria-labelledby="ladder-book-h">
      <div className="section-head"><h2 id="ladder-book-h">{COPY.bookTitle}</h2></div>
      {list.map((c) => (
        <article key={c.id} className="card ladder-past">
          <div className="ladder-past-head">
            <p className="small">
              {shortDate(c.at)} · {format(COPY.bookStart, { start: c.start })} · {c.rungs.length === 1 ? COPY.bookRung : format(COPY.bookRungs, { n: c.rungs.length })}
            </p>
          </div>
          <Ladder start={c.start} rungs={c.rungs} compact showBelieve={false} />
          <button
            className="link" type="button" aria-label={format(COPY.removeLabel, { date: shortDate(c.at) })}
            onClick={() => { store.ungrow(c.id); setNote(true); }}
          >{COPY.remove}</button>
        </article>
      ))}
      <p className="small">{COPY.bookNote}</p>
      {note ? <p className="small" role="status">{COPY.removed}</p> : null}
    </section>
  );
}
