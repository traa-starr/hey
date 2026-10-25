// one rung up: from a heavy moment, one believable rung at a time, then the climb beside how it felt.
// The flow lives in this tab only. The inner voice's sentence is never stored unless the person ticks "keep".
import { useState } from "react";
import { buzz, keptChime } from "../../lib/feedback";
import { go, href } from "../../router";
import { store } from "../../store/store";
import { useData } from "../../store/useStore";
import { FlowTop, Ideas, Screen as Page, SolSays } from "../../ui/kit";
import { type Feel, middle, saveShift } from "../feel/feel";
import { FeelCheck } from "../feel/FeelCheck";
import { Shift } from "../feel/Shift";
import { Ladder } from "./Ladder";
import {
  COPY, MAX_RUNGS, POINTS, SOURCES, climbs, holds, pointById, pointForSentence, sentenceIdeas, tierFor, topOf, trueWords,
  type Rung
} from "./ladder-logic";
import "./ladder.css";

type Step = "open" | "start" | "near" | "why" | "rung" | "true" | "held" | "short" | "after" | "climb";
type S = {
  step: Step; mode: "word" | "sentence"; sentence: string; point: string | null;
  rungs: Rung[]; text: string; smaller: boolean; believe: number | null;
  before: Feel; after: Feel; didBefore: boolean; didAfter: boolean;
  keepSentence: boolean; savedId: string | null; carry: boolean; removed: boolean;
};
const blank = (): S => ({
  step: "open", mode: "word", sentence: "", point: null,
  rungs: [], text: "", smaller: false, believe: null,
  before: middle(), after: middle(), didBefore: false, didAfter: false,
  keepSentence: false, savedId: null, carry: false, removed: false
});

export default function LadderScreen() {
  const { grown } = useData();
  const [s, setS] = useState(blank);
  const update = (patch: Partial<S>) => setS((x) => ({ ...x, ...patch }));
  const toStep = (step: Step, patch: Partial<S> = {}) => {
    window.scrollTo(0, 0);
    setS((x) => ({ ...x, ...patch, step }));
  };
  const leave = () => go({ name: "practice" });
  const point = pointById(s.point);
  const hasClimbed = climbs(grown).length > 0;
  const current = topOf(s.rungs) ?? point?.word ?? "";
  // the thought they're working on now comes from the tier for this rung
  const tier = point ? tierFor(point, s.rungs.length) : null;
  const stopNow = () => (s.rungs.length ? toStep("after") : leave());

  let body: React.ReactNode = null;
  switch (s.step) {
    case "open":
      body = (
        <>
          {COPY.welcome.map((w) => <SolSays key={w} mood="happy">{w}</SolSays>)}
          <FeelCheck id="ladder-before" phase="before" value={s.before} onChange={(before) => update({ before })} />
          <div className="actions">
            <button className="btn" type="button" onClick={() => toStep("start", { didBefore: true })}>{COPY.next}</button>
            <button className="btn quiet" type="button" onClick={() => toStep("start", { didBefore: false })}>{COPY.skip}</button>
          </div>
          <p className="small">{COPY.helpNote} <a href={href({ name: "settings" })}>{COPY.helpLink}</a>.</p>
        </>
      );
      break;
    case "start": {
      const sentenceOk = s.sentence.trim().length > 0;
      body = (
        <>
          <h2 className="h2" data-say>{COPY.startAsk}</h2>
          <div className="chips" role="group" aria-label={COPY.startKind}>
            <button type="button" className="chip" aria-pressed={s.mode === "word"} onClick={() => update({ mode: "word" })}>{COPY.startWord}</button>
            <button type="button" className="chip" aria-pressed={s.mode === "sentence"} onClick={() => update({ mode: "sentence" })}>{COPY.startSentence}</button>
          </div>
          {s.mode === "word" ? (
            <div className="chips" role="group" aria-label={COPY.wordIdeas}>
              {POINTS.map((p) => (
                <button key={p.id} type="button" className="chip" aria-pressed={s.point === p.id} onClick={() => { buzz(4); update({ point: p.id }); }}>{p.word}</button>
              ))}
            </div>
          ) : (
            <>
              <label className="label" htmlFor="ladder-sentence">{COPY.sentenceLabel}</label>
              <textarea
                id="ladder-sentence" className="field voice" rows={2} autoComplete="off" placeholder={COPY.sentencePlaceholder}
                value={s.sentence} onChange={(e) => update({ sentence: e.target.value, point: pointForSentence(e.target.value)?.id ?? null })}
              />
              <p className="small">{COPY.sentenceNote}</p>
              <Ideas ideas={sentenceIdeas()} picked={s.sentence} onPick={(sentence) => update({ sentence, point: pointForSentence(sentence)?.id ?? null })} label={COPY.sentenceIdeas} />
            </>
          )}
          <div className="actions">
            <button
              className="btn" type="button" disabled={s.mode === "word" ? !point : !sentenceOk}
              onClick={() => toStep(s.mode === "sentence" && !point ? "near" : hasClimbed ? "rung" : "why")}
            >{COPY.next}</button>
          </div>
        </>
      );
      break;
    }
    case "near":
      body = (
        <>
          <SolSays mood="calm">{COPY.nearSol}</SolSays>
          <h2 className="h2" data-say>{COPY.nearAsk}</h2>
          <div className="chips" role="group" aria-label={COPY.nearAsk}>
            {POINTS.map((p) => (
              <button key={p.id} type="button" className="chip" aria-pressed={s.point === p.id} onClick={() => { buzz(4); update({ point: p.id }); }}>{p.word}</button>
            ))}
          </div>
          <div className="actions"><button className="btn" type="button" disabled={!point} onClick={() => toStep(hasClimbed ? "rung" : "why")}>{COPY.next}</button></div>
        </>
      );
      break;
    case "why":
      body = (
        <>
          <h2 className="h2" data-say>{COPY.whyTitle}</h2>
          {COPY.why.map((w) => <SolSays key={w} mood="curious">{w}</SolSays>)}
          <Sources />
          <div className="actions"><button className="btn" type="button" onClick={() => toStep("rung")}>{COPY.whyGot}</button></div>
        </>
      );
      break;
    case "rung": {
      if (!point || !tier) {
        body = null;
        break;
      }
      const ideas = s.smaller ? tier.softer : tier.pick;
      const begins = s.smaller ? COPY.beginsSmaller : COPY.begins;
      const suggested = (t: string) => !t.trim() || [...tier.pick, ...tier.softer, ...COPY.begins, ...COPY.beginsSmaller].some((x) => x === t.trim() || `${x} ` === t);
      body = (
        <>
          <p className="ladder-here"><span className="label">{COPY.from}</span><span className="ladder-here-text">{current}</span></p>
          {s.smaller ? <SolSays mood="curious">{COPY.smallerSol}</SolSays> : null}
          <h2 className="h2" data-say>{s.smaller ? COPY.smallerAsk : COPY.rungAsk}</h2>
          <Ideas ideas={ideas} picked={s.text} onPick={(text) => update({ text })} label={s.smaller ? COPY.smallerAsk : COPY.pickIdeas} />
          <div className="fieldset">
            <label className="label" htmlFor="ladder-own">{COPY.ownLabel}</label>
            <textarea
              id="ladder-own" className="field voice" rows={3} autoComplete="off" placeholder={COPY.ownPlaceholder}
              value={s.text} onChange={(e) => update({ text: e.target.value })}
            />
          </div>
          <Ideas ideas={begins} onPick={(b) => update({ text: suggested(s.text) ? `${b} ` : `${b} ${s.text}` })} label={COPY.begin} />
          <WhyMore />
          <div className="actions">
            <button className="btn" type="button" disabled={!s.text.trim()} onClick={() => toStep("true", { believe: null })}>{COPY.next}</button>
            <button className="btn quiet" type="button" onClick={stopNow}>{COPY.stop}</button>
          </div>
        </>
      );
      break;
    }
    case "true":
      body = (
        <>
          <h2 className="h2" data-say>{COPY.trueAsk}</h2>
          <p className="reply-line" data-say>{s.text.trim()}</p>
          <Believe value={s.believe} onChange={(believe) => update({ believe })} />
          <p className="small">{COPY.trueNote}</p>
          <div className="actions">
            <button className="btn" type="button" disabled={s.believe === null} onClick={() => {
              const n = s.believe ?? 0;
              if (holds(n)) {
                buzz(14);
                keptChime();
                toStep("held", { rungs: [...s.rungs, { text: s.text.trim(), believe: n }], text: "", smaller: false });
              } else {
                toStep("short");
              }
            }}>{COPY.next}</button>
          </div>
        </>
      );
      break;
    case "held": {
      const full = s.rungs.length >= MAX_RUNGS;
      body = (
        <>
          <h2 className="sr">{COPY.heldSol[1]}</h2>
          <SolSays mood="happy">{full ? COPY.heldTop : COPY.heldSol[0]}</SolSays>
          <Ladder start={point?.word ?? ""} rungs={s.rungs} />
          <div className="actions">
            {full ? (
              <button className="btn" type="button" onClick={() => toStep("after")}>{COPY.seeClimb}</button>
            ) : (
              <>
                <button className="btn" type="button" onClick={() => toStep("rung")}>{COPY.more}</button>
                <button className="btn quiet" type="button" onClick={() => toStep("after")}>{COPY.enough}</button>
              </>
            )}
          </div>
        </>
      );
      break;
    }
    case "short":
      body = (
        <>
          <h2 className="sr">{COPY.smaller}</h2>
          <SolSays mood="curious">{COPY.shortSol[0]}</SolSays>
          <SolSays mood="calm">{s.smaller ? COPY.shortAgain : COPY.shortSol[1]}</SolSays>
          <div className="actions">
            <button className="btn" type="button" onClick={() => toStep("rung", { smaller: true, text: "" })}>{COPY.smaller}</button>
            <button className="btn quiet" type="button" onClick={stopNow}>{COPY.stay}</button>
          </div>
        </>
      );
      break;
    case "after":
      body = (
        <>
          <SolSays mood="happy">{COPY.afterSol}</SolSays>
          <FeelCheck id="ladder-after" phase="after" value={s.after} onChange={(after) => update({ after })} />
          <div className="actions">
            <button className="btn" type="button" onClick={() => toStep("climb", { didAfter: true })}>{COPY.next}</button>
            <button className="btn quiet" type="button" onClick={() => toStep("climb", { didAfter: false })}>{COPY.afterSkip}</button>
          </div>
        </>
      );
      break;
    case "climb": {
      const start = s.keepSentence && s.sentence.trim() ? s.sentence.trim() : point?.word ?? "";
      const fromSentence = s.mode === "sentence" && !!s.sentence.trim();
      const bothFeel = s.didBefore && s.didAfter;
      const keep = () => {
        const rec = store.grow("ladder", "climb", {
          start, rungs: s.rungs, top: topOf(s.rungs), from: fromSentence && s.keepSentence ? "sentence" : "word"
        });
        if (bothFeel) saveShift("ladder", s.before, s.after, rec.id);
        buzz(20);
        keptChime();
        update({ savedId: rec.id });
      };
      const carry = (on: boolean) => {
        if (s.savedId) store.regrow(s.savedId, { carry: on });
        update({ carry: on });
      };
      body = (
        <>
          <h2 className="h2" data-say>{COPY.climbTitle}</h2>
          <p className="small">{COPY.climbNote}</p>
          <Ladder start={point?.word ?? ""} rungs={s.rungs} />
          {bothFeel ? (
            <section className="section" aria-label={COPY.before}>
              <span className="label">{COPY.before}</span>
              <Shift before={s.before} after={s.after} />
            </section>
          ) : null}
          {s.savedId ? (
            <>
              <p className="note" role="status">{s.carry ? COPY.carried : COPY.kept}</p>
              <div className="actions">
                <button className="btn" type="button" aria-pressed={s.carry} onClick={() => carry(!s.carry)}>{s.carry ? COPY.uncarry : COPY.carry}</button>
                <button className="btn quiet" type="button" onClick={() => go({ name: "book" })}>{COPY.seeBook}</button>
                <button className="btn quiet" type="button" onClick={leave}>{COPY.done}</button>
              </div>
            </>
          ) : (
            <>
              {fromSentence ? (
                <>
                  <label className="check">
                    <input type="checkbox" checked={s.keepSentence} onChange={(e) => update({ keepSentence: e.target.checked })} />
                    {COPY.keepSentence}
                  </label>
                  <p className="small">{COPY.keepSentenceNote}</p>
                </>
              ) : null}
              <div className="actions">
                <button className="btn" type="button" onClick={keep}>{COPY.keep}</button>
                <button className="btn quiet" type="button" onClick={leave}>{COPY.letGo}</button>
              </div>
            </>
          )}
        </>
      );
      break;
    }
  }

  return (
    <>
      <FlowTop onClose={leave} title={COPY.title} />
      <Page id={`ladder-${s.step}`}>{body}</Page>
    </>
  );
}

function Sources() {
  return (
    <section className="ladder-sources" aria-label={COPY.sources}>
      <span className="label">{COPY.sources}</span>
      <ul>
        {SOURCES.map((x) => (
          <li key={x.id} className="source">
            {x.url ? <a href={x.url} target="_blank" rel="noopener noreferrer">{x.label}</a> : x.label} · {COPY.evidence}: {x.evidence}
          </li>
        ))}
      </ul>
    </section>
  );
}

// the same teaching, one tap away on any rung
function WhyMore() {
  const [open, setOpen] = useState(false);
  if (!open) return <button className="link" type="button" aria-expanded={false} onClick={() => setOpen(true)}>{COPY.whyMore}</button>;
  return (
    <div className="ladder-why">
      {COPY.why.map((w) => <SolSays key={w} mood="curious" say={false}>{w}</SolSays>)}
      <Sources />
      <button className="link" type="button" aria-expanded onClick={() => setOpen(false)}>{COPY.whyHide}</button>
    </div>
  );
}

// 0 to 100, set by the person (it starts unset, so a number is always an answer)
function Believe({ value, onChange }: { value: number | null; onChange: (n: number) => void }) {
  const shown = value ?? 50;
  const say = (v: string) => onChange(Number(v));
  return (
    <div className="ladder-believe">
      <p className="ladder-number" aria-hidden="true">{value === null ? "–" : value}</p>
      <label className="sr" htmlFor="ladder-true">{COPY.trueLabel}</label>
      <input
        id="ladder-true" type="range" min={0} max={100} step={5} value={shown}
        aria-valuetext={value === null ? COPY.trueLabel : trueWords(value)}
        onChange={(e) => say(e.target.value)}
        onPointerUp={(e) => say((e.target as HTMLInputElement).value)}
        onKeyUp={(e) => { if (value === null && (e.key === "Enter" || e.key === " ")) onChange(50); }}
      />
      <div className="ends" aria-hidden="true"><span>{COPY.trueEnds[0]}</span><span>{COPY.trueEnds[1]}</span></div>
    </div>
  );
}
