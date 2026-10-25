// voice check: swipe or tap through things inner voices say. no typing. ends on your voice map.
import { AnimatePresence, useReducedMotion } from "motion/react";
import * as m from "motion/react-m";
import { useRef, useState } from "react";
import { content } from "../content/load";
import { buzz, keptChime } from "../lib/feedback";
import { format } from "../lib/template";
import { deck, scoreCheck } from "../lib/voice";
import { go, href } from "../router";
import { store } from "../store/store";
import { FlowTop, Screen, DawnSays } from "../ui/kit";
import { VoiceMap } from "./You";

export function Check() {
  const c = content();
  const t = c.copy.check;
  const [cards] = useState(() => deck(c.habits));
  const reduce = useReducedMotion();
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState<number[]>([]);
  const [dir, setDir] = useState(0);
  // one answer per card, even with a quick double tap
  const busy = useRef(false);
  const n = answers.length;
  const card = cards[n];
  const leave = () => go({ name: "home" });

  const answer = (v: number) => {
    if (busy.current) return;
    busy.current = true;
    window.setTimeout(() => { busy.current = false; }, 250);
    buzz(v === 2 ? 12 : 6);
    setDir(v === 2 ? 1 : v === 0 ? -1 : 0);
    const next = [...answers, v];
    setAnswers(next);
    if (next.length === cards.length) {
      store.log({ type: "check", scores: scoreCheck(cards, next) });
      keptChime();
    }
  };

  if (!started) {
    return (
      <>
        <FlowTop onClose={leave} title={t.mapTitle} />
        <Screen id="check-intro">
          <h2 className="sr">{c.copy.practice.check}</h2>
          <DawnSays mood="curious">{t.intro}</DawnSays>
          <p className="small">{c.habitsNote}</p>
          <button className="btn" type="button" onClick={() => setStarted(true)}>{t.start}</button>
        </Screen>
      </>
    );
  }

  if (!card) {
    return (
      <>
        <FlowTop onClose={leave} title={t.mapTitle} />
        <Screen id="check-done">
          <h2 className="sr">{c.copy.you.map}</h2>
          <DawnSays mood="happy">{t.mapDawn}</DawnSays>
          <VoiceMap />
          <DawnSays mood="happy">{t.kindAfter}</DawnSays>
          <a className="btn" href={href({ name: "lesson", key: "on-your-side/a-kind-minute" })}>{t.kindGo}</a>
        </Screen>
      </>
    );
  }

  return (
    <>
      <FlowTop at={n} of={cards.length} onClose={leave} back={n > 0 ? () => { setDir(0); setAnswers(answers.slice(0, -1)); } : undefined} />
      <Screen id="check">
        <h1 className="h2">{t.ask}</h1>
        <div className="deck">
          {cards[n + 1] ? <div className="qcard under" aria-hidden="true" /> : null}
          <AnimatePresence initial={false} custom={dir}>
            <m.div
              key={n}
              className="qcard"
              custom={dir}
              initial={reduce ? false : { opacity: 0, scale: 0.96, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0, x: 0, rotate: 0 }}
              exit={reduce ? { opacity: 0 } : { x: dir * 420, y: dir === 0 ? -200 : 0, rotate: dir * 12, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
              drag={reduce ? false : "x"}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.6}
              onDragEnd={(_, info) => {
                if (info.offset.x > 110) answer(2);
                else if (info.offset.x < -110) answer(0);
              }}
            >
              <span className="tag">{format(t.of, { n: n + 1, total: cards.length })}</span>
              <p className="quote" data-say aria-live="polite">“{card.line}”</p>
              <span className="small">{t.note}</span>
            </m.div>
          </AnimatePresence>
        </div>
        <div className="answers" role="group" aria-label={t.ask}>
          <button className="ans" type="button" onClick={() => answer(2)}><i style={{ background: "var(--primary)" }} />{t.me}</button>
          <button className="ans" type="button" onClick={() => answer(1)}><i style={{ background: "linear-gradient(90deg, var(--primary) 50%, var(--raise) 50%)" }} />{t.sometimes}</button>
          <button className="ans" type="button" onClick={() => answer(0)}><i style={{ background: "var(--raise)", boxShadow: "inset 0 0 0 2px var(--hair)" }} />{t.not}</button>
        </div>
      </Screen>
    </>
  );
}
