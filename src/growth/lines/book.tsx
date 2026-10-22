// The book's small gallery of lines: the latest few, each one tap from "still true?".
import { href } from "../../router";
import { useData } from "../../store/useStore";
import { T, linesFrom } from "./lines";
import "./lines.css";

export function BookSection() {
  const { grown } = useData();
  const lines = linesFrom(grown).slice(-4).reverse();
  if (!lines.length) return null;
  return (
    <section className="section" aria-labelledby="lines-book-h">
      <div className="section-head"><h2 id="lines-book-h">{T.bookTitle}</h2></div>
      <div className="lines-gallery">
        {lines.map((l) => (
          <a key={l.id} className="lines-card" href={href({ name: "grow", feature: "lines", sub: `tune/${l.id}` })} style={{ textDecoration: "none", color: "inherit" }}>
            <span className="lines-quote">{l.text}</span>
            <span className="lines-tag">{l.value}</span>
          </a>
        ))}
      </div>
      <a className="link" href={href({ name: "grow", feature: "lines" })}>{T.bookAll}</a>
      <p className="small">{T.bookNote}</p>
    </section>
  );
}
