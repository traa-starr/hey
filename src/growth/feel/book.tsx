// "how it shifted": every practice's before and after, newest first.
import { shortDate } from "../../lib/time";
import { useData } from "../../store/useStore";
import { plugin } from "../registry";
import { FEEL, shifts } from "./feel";
import { Shift } from "./Shift";

export function BookSection() {
  const { grown } = useData();
  const list = shifts(grown).slice(-8).reverse();
  if (!list.length) return null;
  return (
    <section className="section" aria-labelledby="shifted-h">
      <div className="section-head"><h2 id="shifted-h">{FEEL.copy.bookTitle}</h2></div>
      <div className="card">
        {list.map((s) => (
          <div key={s.id} className="fs-item">
            <p className="small">{plugin(s.practice)?.tile?.title ?? s.practice} · {shortDate(s.at)}</p>
            <Shift before={s.before} after={s.after} compact />
          </div>
        ))}
      </div>
      <p className="small">{FEEL.copy.bookNote}</p>
    </section>
  );
}
