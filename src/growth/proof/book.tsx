// The proof collection, at the end of the book: what turned up in real life, in the person's own words.
// The thought behind each one stays hidden until tapped.
import { format } from "../../lib/template";
import { shortDate } from "../../lib/time";
import { href } from "../../router";
import { useData } from "../../store/useStore";
import { experiments, proofs } from "./data";
import { T } from "./proof";
import "./proof.css";

export function BookSection() {
  const { grown } = useData();
  const kept = proofs(grown);
  if (!kept.length) return null;
  const made = new Set(kept.map((p) => p.experiment).filter(Boolean)).size || experiments(grown).length;
  const shown = kept.slice(-6).reverse();
  return (
    <section className="section" aria-labelledby="proof-book-h">
      <div className="section-head"><h2 id="proof-book-h">{T.bookTitle}</h2></div>
      <div className="card">
        <p className="small">{kept.length === 1 ? T.proofOne : format(T.proofCount, { n: kept.length, m: Math.max(made, 1) })}</p>
        <ul className="proof-list">
          {shown.map((p) => (
            <li key={p.id}>
              <q>{p.text}</q>
              <span className="small">{shortDate(p.at)}</span>
              {p.claim ? <details><summary>{T.aboutIt}</summary><p className="proof-claim">{p.claim}</p></details> : null}
            </li>
          ))}
        </ul>
        <a className="link" href={href({ name: "grow", feature: "proof" })}>{T.bookOpen}</a>
      </div>
      <p className="small">{T.bookNote}</p>
    </section>
  );
}
