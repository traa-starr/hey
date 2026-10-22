// today: a greeting, one line you once told yourself, one main action, one small question about you.
import { useState } from "react";
import { content } from "../content/load";
import { buzz } from "../lib/feedback";
import { format } from "../lib/template";
import { dailyIndex, shortDate, timeOfDay } from "../lib/time";
import { href } from "../router";
import { store } from "../store/store";
import { useData } from "../store/useStore";
import { Nav, Screen, TopBar } from "../ui/kit";

export function Today() {
  const c = content();
  const copy = c.copy;
  const data = useData();
  const [noted, setNoted] = useState<{ id: string; pick: string } | null>(null);
  // shared-phone safe: the line stays hidden until the person taps it
  const [revealed, setRevealed] = useState(false);

  const name = data.name.toLowerCase() || copy.greeting.noName;
  const greeting = format(copy.greeting[timeOfDay()], { name });

  const lines = data.entries.filter((e) => e.kind === "voice" && !e.said);
  const line = lines[dailyIndex(lines.length)];

  // unanswered questions first; once every one is answered, they come round again
  const unanswered = c.questions.filter((q) => !data.answered[q.id]);
  const open = unanswered.length ? unanswered : c.questions;
  const question = noted ? c.questions.find((q) => q.id === noted.id) : open[dailyIndex(open.length)];

  const answer = (pick: string) => {
    if (!question || noted) return;
    buzz(10);
    store.add({ kind: "about", sub: question.keep, text: format(question.as, { x: pick }), from: copy.today.questionLabel });
    store.markAnswered(question.id);
    setNoted({ id: question.id, pick });
  };

  return (
    <>
      <TopBar />
      <Screen id="today">
        <h1 className="greet" data-say>{greeting}</h1>
        {data.settings.resurface ? (
          line ? (
            <figure className="card resurface">
              <figcaption className="label">{copy.today.toldYourself}</figcaption>
              {revealed ? (
                <>
                  <blockquote className="mine" data-say tabIndex={-1} ref={(el) => el?.focus({ preventScroll: true })}>{line.text}</blockquote>
                  <span className="when">{shortDate(line.at)}</span>
                </>
              ) : (
                <button className="link" type="button" aria-expanded={false} onClick={() => { buzz(4); setRevealed(true); }}>
                  {copy.today.reveal}
                </button>
              )}
            </figure>
          ) : (
            <p className="empty" style={{ paddingBlock: 0 }}>{copy.today.toldEmpty}</p>
          )
        ) : null}
        <a className="lead" href={href({ name: "answer" })} onClick={() => buzz(6)}>
          <span><b data-say>{copy.today.answerTitle}</b><span>{copy.today.answerSub}</span></span>
          <span className="arrow" aria-hidden="true">→</span>
        </a>
        <section className="question" aria-labelledby="q-label">
          <p className="label" id="q-label">{copy.today.questionLabel}</p>
          {question ? (
            <>
              <p className="q" data-say>{question.prompt}</p>
              <div className="pair" role="group" aria-label={question.prompt}>
                {question.options.map((o) => (
                  <button key={o} type="button" className="chip" aria-pressed={noted?.pick === o} onClick={() => answer(o)} disabled={!!noted && noted.pick !== o}>
                    {o}
                  </button>
                ))}
              </div>
              {noted ? <p className="note" role="status">{copy.today.noted}</p> : <p className="small">{copy.today.questionNote}</p>}
            </>
          ) : null}
          <a className="link" href={href({ name: "explore" })}>{copy.today.explore}</a>
        </section>
      </Screen>
      <Nav current="today" />
    </>
  );
}
