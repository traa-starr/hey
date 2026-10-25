// The front door of your lines: a small gallery of what's been made, a way to make one, and why it works.
import { useState } from "react";
import { buzz } from "../../lib/feedback";
import { shortDate } from "../../lib/time";
import { go, href } from "../../router";
import { store } from "../../store/store";
import { useData } from "../../store/useStore";
import { FlowTop, PageTitle, Screen, DawnSays } from "../../ui/kit";
import { LINES, T, linesFrom, type Line } from "./lines";
import "./lines.css";

const close = () => go({ name: "practice" });
const hub = () => go({ name: "grow", feature: "lines" });

export function Hub() {
  const { grown } = useData();
  const lines = linesFrom(grown).slice().reverse();
  const [asking, setAsking] = useState<string | null>(null);
  return (
    <>
      <FlowTop onClose={close} />
      <Screen id="lines-hub">
        <PageTitle>{T.hubTitle}</PageTitle>
        <DawnSays mood="happy">{lines.length ? T.hubDawnReturn : T.hubDawn}</DawnSays>
        <div className="actions">
          <a className="btn" href={href({ name: "grow", feature: "lines", sub: "new" })} onClick={() => buzz(6)}>{T.make}</a>
          <a className="btn quiet" href={href({ name: "grow", feature: "lines", sub: "why" })}>{T.why}</a>
        </div>
        {lines.length ? (
          <section className="section" aria-labelledby="lines-gallery-h">
            <h2 id="lines-gallery-h" className="label">{T.galleryLabel}</h2>
            <div className="lines-gallery">
              {lines.map((l) => (
                <LineCard key={l.id} line={l} asking={asking === l.id} onAsk={(on) => setAsking(on ? l.id : null)} />
              ))}
            </div>
          </section>
        ) : (
          <p className="empty">{T.none}</p>
        )}
      </Screen>
    </>
  );
}

function LineCard({ line, asking, onAsk }: { line: Line; asking: boolean; onAsk: (on: boolean) => void }) {
  return (
    <div className="lines-card" data-testid="line-card">
      <p className="lines-quote">{line.text}</p>
      <span className="lines-tag">{line.value}</span>
      <p className="small">{shortDate(line.at)}</p>
      {asking ? (
        <div className="lines-row" role="group" aria-label={T.letGoSure}>
          <span className="small">{T.letGoSure}</span>
          <button className="link" type="button" onClick={() => { store.ungrow(line.id); onAsk(false); }}>{T.yes}</button>
          <button className="link" type="button" onClick={() => onAsk(false)}>{T.no}</button>
        </div>
      ) : (
        <div className="lines-row">
          <a className="link" href={href({ name: "grow", feature: "lines", sub: `tune/${line.id}` })}>{T.tune}</a>
          <button className="link" type="button" onClick={() => onAsk(true)}>{T.letGo}</button>
        </div>
      )}
    </div>
  );
}

// the three ideas under the practice, each with its source and an honest label
export function Why() {
  return (
    <>
      <FlowTop onClose={hub} />
      <Screen id="lines-why">
        <h1 className="title" style={{ fontSize: "2rem" }} data-say>{T.whyTitle}</h1>
        <p className="small">{T.whyIntro}</p>
        <div className="lines-sources">
          {LINES.why.map((w) => (
            <div key={w.id} className="lines-sources">
              <DawnSays mood="calm">{w.text}</DawnSays>
              <p className="source">{T.sources}: {w.source.label} · {T.evidence}: {w.source.evidence}</p>
            </div>
          ))}
        </div>
        <div className="actions"><a className="btn" href={href({ name: "grow", feature: "lines", sub: "new" })}>{T.make}</a></div>
      </Screen>
    </>
  );
}
