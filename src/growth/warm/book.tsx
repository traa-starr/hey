// the warm room in the book: the voice, and the visits kept on purpose. opened only when tapped.
import { shortDate } from "../../lib/time";
import { href } from "../../router";
import { store } from "../../store/store";
import { useData } from "../../store/useStore";
import { copy, nameOf, visitsOf, voiceOf } from "./warm";
import "./warm.css";

export function BookSection() {
  const { grown } = useData();
  const voice = voiceOf(grown);
  const visits = visitsOf(grown).slice(-6).reverse();
  if (!voice && !visits.length) return null;
  return (
    <section className="section" aria-labelledby="warm-book-h">
      <div className="section-head"><h2 id="warm-book-h">{copy.bookTitle}</h2></div>
      <div className="card">
        {voice ? (
          <>
            <span className="label">{copy.bookVoice}</span>
            <p className="warm-name">{nameOf(voice)}</p>
            <p className="small">{voice.qualities.join(", ")}</p>
            <a className="btn quiet" href={href({ name: "grow", feature: "warm", sub: "voice" })}>{copy.bookChange}</a>
          </>
        ) : null}
        {visits.length ? <span className="label">{copy.bookVisits}</span> : null}
        {visits.map((v) => (
          <details key={v.id} className="warm-visit">
            <summary>{shortDate(v.at)}</summary>
            {v.lines.map((l) => <p key={l} className="warm-line">{l}</p>)}
            {v.thing ? <p className="small">{v.thing}</p> : null}
            <button className="btn ghost" type="button" onClick={() => store.ungrow(v.id)}>{copy.bookLetGo}</button>
          </details>
        ))}
      </div>
      <p className="small">{copy.bookNote}</p>
    </section>
  );
}
