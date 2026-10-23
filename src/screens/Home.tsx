// home: a sky that follows the hour, dawn, a greeting, and one next step. nothing else competes.
import { useState } from "react";
import { content, nextLesson } from "../content/load";
import { buzz } from "../lib/feedback";
import { format } from "../lib/template";
import { dailyIndex, timeOfDay } from "../lib/time";
import { href } from "../router";
import { useData } from "../store/useStore";
import { Icon } from "../ui/icons";
import { Screen, Tabs, colorVar, useCompanion } from "../ui/kit";
import { Today } from "../growth/Today";
import { pathArt } from "../ui/art";
import { Sol } from "../ui/Sol";

function Stars() {
  return (
    <svg className="stars" viewBox="0 0 390 300" preserveAspectRatio="none" aria-hidden="true">
      {Array.from({ length: 26 }, (_, i) => (
        <circle key={i} cx={(i * 73) % 390} cy={(i * 37) % 180} r={i % 3 ? 1 : 1.6} fill="#fff" opacity={0.3 + (i % 4) * 0.15} />
      ))}
    </svg>
  );
}

const KIND = "on-your-side/a-kind-minute";
const SAVOR = "on-your-side/savor-it";

export function Home() {
  const c = content();
  const copy = c.copy;
  const data = useData();
  const comp = useCompanion();
  const [revealed, setRevealed] = useState(false);
  const tod = timeOfDay();
  const name = data.name.toLowerCase() || copy.greeting.noName;
  const lines = copy.sol[tod];
  const solLine = lines[dailyIndex(lines.length)] ?? lines[0];
  const next = nextLesson(c, data.done);
  const told = data.entries.filter((e) => e.kind === "voice" && !e.said && !e.holdsSaid);
  const line = told[dailyIndex(told.length)];

  return (
    <>
      <Screen id="home">
        <section className={`sky ${tod}`} style={{ background: `var(--sky-${tod})` }}>
          {tod === "night" ? <Stars /> : null}
          <div className="sky-top">
            <span>{copy.app.name}</span>
            <a className="sky-chip" href={href({ name: "checkin" })} onClick={() => buzz(4)} style={{ textDecoration: "none" }}>{copy.home.checkIn}</a>
          </div>
          <div className="hello" style={comp.on ? undefined : { gridTemplateColumns: "1fr" }}>
            <div>
              <h1 data-say>{format(copy.greeting[tod], { name })}</h1>
              <p data-say>{solLine}</p>
            </div>
            {comp.on ? <div className="solbox"><Sol mood={tod === "night" ? "sleepy" : "happy"} /></div> : null}
          </div>
        </section>

        <Today />

        <p className="label">{copy.home.next}</p>
        {next ? (
          <a className="next" href={href({ name: "lesson", key: next.item.key })} onClick={() => buzz(6)}>
            <span className="art ring" style={{ ["--p" as string]: Math.round(((next.n - 1) / next.total) * 100) }}>
              <span style={{ background: colorVar(next.path.color), color: "var(--on-primary)", ["--art-bg" as string]: colorVar(next.path.color) }}>{pathArt(next.path.id)}</span>
            </span>
            <span style={{ minWidth: 0 }}>
              <b data-say>{next.item.lesson.title}</b>
              <small>{format(copy.home.lessonOf, { path: next.path.name, n: next.n, total: next.total, min: next.item.lesson.minutes })}</small>
            </span>
            <span className="go" aria-hidden="true">{Icon.arrow}</span>
          </a>
        ) : (
          <p className="empty">{copy.home.nextDone}</p>
        )}

        <div className="grid2">
          {/* something kind, always; when the kind minute is already the next step, a good moment instead */}
          {next?.item.key === KIND ? (
            <a className="tile" style={{ background: "var(--pink-soft)" }} href={href({ name: "lesson", key: SAVOR })}>
              <span className="ico" style={{ background: "var(--pink)" }}>{Icon.sun}</span>
              <b>{copy.home.savor}</b><small>{copy.home.savorSub}</small>
            </a>
          ) : (
            <a className="tile" style={{ background: "var(--coral-soft)" }} href={href({ name: "lesson", key: KIND })}>
              <span className="ico" style={{ background: "var(--coral)" }}>{Icon.heart}</span>
              <b>{copy.home.kind}</b><small>{copy.home.kindSub}</small>
            </a>
          )}
          <a className="tile" style={{ background: "var(--teal-soft)" }} href={href({ name: "answer" })}>
            <span className="ico" style={{ background: "var(--teal)" }}>{Icon.answer}</span>
            <b>{copy.home.loud}</b><small>{copy.home.loudSub}</small>
          </a>
        </div>

        {data.settings.resurface && line ? (
          <div className="told">
            <p className="label">{copy.home.told}</p>
            {revealed ? (
              <blockquote tabIndex={-1} ref={(el) => el?.focus({ preventScroll: true })}>{line.text}</blockquote>
            ) : (
              <button className="link" type="button" aria-expanded={false} onClick={() => { buzz(4); setRevealed(true); }}>{copy.home.reveal}</button>
            )}
          </div>
        ) : null}
      </Screen>
      <Tabs current="home" />
    </>
  );
}
