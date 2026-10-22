// The workshop: pick a value, recall one small moment, let sol shape a line, tune it with words from
// the person's own book, try it on, say how true it feels, keep it. The feel check opens and closes
// the first session of the day, and both halves can be skipped.
import { useMemo, useRef, useState } from "react";
import { buzz, keptChime } from "../../lib/feedback";
import { canSpeak, speak, stopSpeaking } from "../../lib/speech";
import { format } from "../../lib/template";
import { go } from "../../router";
import { store } from "../../store/store";
import { useData } from "../../store/useStore";
import { Chips, FlowTop, Ideas, Screen, SolSays } from "../../ui/kit";
import { FeelCheck } from "../feel/FeelCheck";
import { middle, saveShift, type Feel } from "../feel/feel";
import { Shift } from "../feel/Shift";
import { LINES, T, addLead, addTail, candidates, canLead, firstOfDay, insertWord, linesFrom, markAsked, ownWords } from "./lines";
import "./lines.css";

type Step = "before" | "value" | "moment" | "shape" | "tune" | "try" | "after" | "done";
const FLOW: Step[] = ["value", "moment", "shape", "tune", "try"];
const OWN = "own";

const hub = () => go({ name: "grow", feature: "lines" });
const sourceOf = (id: string) => LINES.why.find((w) => w.id === id)?.source;

function Source({ id }: { id: string }) {
  const s = sourceOf(id);
  return s ? <p className="source">{T.sources}: {s.label} · {T.evidence}: {s.evidence}</p> : null;
}

export function Workshop({ tuneId }: { tuneId?: string }) {
  const { grown, entries, name } = useData();
  const lines = useMemo(() => linesFrom(grown), [grown]);
  const existing = tuneId ? lines.find((l) => l.id === tuneId) : undefined;
  const [asked] = useState(() => !tuneId && firstOfDay(grown));
  const [step, setStep] = useState<Step>(tuneId ? "try" : asked ? "before" : "value");
  const [before, setBefore] = useState<Feel>(middle);
  const [haveBefore, setHaveBefore] = useState(false);
  const [after, setAfter] = useState<Feel>(middle);
  const [shifted, setShifted] = useState(false);
  const [valueId, setValueId] = useState<string>("");
  const [own, setOwn] = useState("");
  const [moment, setMoment] = useState("");
  const [skippedMoment, setSkippedMoment] = useState(false);
  const [text, setText] = useState(existing?.text ?? "");
  const [truth, setTruth] = useState<number | null>(existing?.truth ?? null);
  const [recId, setRecId] = useState<string | null>(tuneId ?? null);
  const [reading, setReading] = useState(false);
  const field = useRef<HTMLTextAreaElement>(null);
  const caret = useRef({ from: 0, to: 0 });

  const value = LINES.values.find((v) => v.id === valueId) ?? null;
  const label = existing?.value ?? (value ? value.word : own.trim().toLowerCase());
  const momentText = existing ? existing.moment : skippedMoment ? null : moment.trim() || null;
  const shapes = useMemo(() => (step === "shape" ? candidates({ name, value, own, moment: momentText }) : []), [step, name, value, own, momentText]);
  const bank = useMemo(() => ownWords(entries, lines, text.toLowerCase().split(/\W+/)), [entries, lines, text]);

  const go2 = (s: Step) => { stopSpeaking(); setReading(false); setStep(s); };
  const leave = () => { stopSpeaking(); hub(); };
  const prev: Partial<Record<Step, Step>> = existing
    ? { tune: "try" }
    : { value: asked ? "before" : undefined, moment: "value", shape: "moment", tune: "shape", try: "tune" };
  const back = prev[step];
  const progress = FLOW.indexOf(step);
  const top = (
    <FlowTop
      onClose={leave}
      back={back ? () => go2(back) : undefined}
      at={progress >= 0 && !existing ? progress : undefined}
      of={progress >= 0 && !existing ? FLOW.length : undefined}
    />
  );

  if (tuneId && !existing && !recId) {
    return (
      <>
        <FlowTop onClose={hub} />
        <Screen id="lines-missing"><p className="empty">{T.missing}</p></Screen>
      </>
    );
  }

  const edit = (next: string) => setText(next);
  const addWord = (w: string) => {
    const { from, to } = caret.current;
    const r = insertWord(text, w, from, to);
    setText(r.text);
    caret.current = { from: r.caret, to: r.caret };
    requestAnimationFrame(() => { field.current?.focus({ preventScroll: true }); field.current?.setSelectionRange(r.caret, r.caret); });
  };
  const note = () => { const el = field.current; if (el) caret.current = { from: el.selectionStart, to: el.selectionEnd }; };

  const keep = () => {
    if (truth === null || !text.trim()) return;
    buzz(10);
    keptChime();
    if (existing || recId) {
      store.regrow(recId!, { text: text.trim(), truth });
      go2("done");
      return;
    }
    const rec = store.grow("lines", "line", { text: text.trim(), value: label, moment: momentText, truth, ...(value ? {} : { own: true }) });
    setRecId(rec.id);
    go2(haveBefore ? "after" : "done");
  };

  const another = () => {
    setValueId(""); setOwn(""); setMoment(""); setSkippedMoment(false); setText(""); setTruth(null); setRecId(null);
    setHaveBefore(false); setShifted(false);
    go2("value");
  };

  if (step === "before") {
    return (
      <>
        {top}
        <Screen id="lines-before">
          <SolSays mood="happy">{T.beforeIntro}</SolSays>
          <FeelCheck id="lines-before" phase="before" value={before} onChange={setBefore} />
          <div className="actions">
            <button className="btn" type="button" onClick={() => { markAsked(); setHaveBefore(true); go2("value"); }}>{T.continue}</button>
            <button className="btn quiet" type="button" onClick={() => { markAsked(); setHaveBefore(false); go2("value"); }}>{T.skip}</button>
          </div>
        </Screen>
      </>
    );
  }

  if (step === "value") {
    const ready = valueId === OWN ? own.trim().length > 0 : !!value;
    return (
      <>
        {top}
        <Screen id="lines-value">
          <h1 className="h2" data-say>{T.valueAsk}</h1>
          <SolSays mood="calm">{T.valueSol}</SolSays>
          <SolSays mood="curious">{T.valueTeach}</SolSays>
          <Source id="values" />
          <Chips
            label={T.valueAsk}
            options={[...LINES.values.map((v) => v.word), T.ownWord]}
            picked={valueId === OWN ? T.ownWord : value?.word}
            onPick={(w) => setValueId(w === T.ownWord ? OWN : (LINES.values.find((v) => v.word === w)?.id ?? ""))}
          />
          {valueId === OWN ? (
            <div className="section">
              <label className="label" htmlFor="lines-own">{T.ownLabel}</label>
              <input id="lines-own" className="field" type="text" maxLength={28} value={own} onChange={(e) => setOwn(e.target.value)} autoComplete="off" />
              <Ideas ideas={LINES.ownIdeas} picked={own} onPick={setOwn} label={T.ownIdeas} />
            </div>
          ) : null}
          <div className="actions"><button className="btn" type="button" disabled={!ready} onClick={() => go2("moment")}>{T.next}</button></div>
        </Screen>
      </>
    );
  }

  if (step === "moment") {
    const ideas = value ? value.moments : LINES.ownMoments;
    const asking = value ? format(T.momentAsk, { value: value.word }) : format(T.momentAskOwn, { word: own.trim().toLowerCase() });
    const who = name.trim().toLowerCase() || "i";
    return (
      <>
        {top}
        <Screen id="lines-moment">
          <h1 className="h2" data-say>{asking}</h1>
          <SolSays mood="curious">{T.momentSol}</SolSays>
          <SolSays mood="calm">{name.trim() ? T.momentTeach : T.momentTeachFirst}</SolSays>
          <Source id="name" />
          <div className="lines-frame">
            <label className="label" htmlFor="lines-moment-text">{`${T.momentLabel}: ${who} ${value ? (name.trim() ? value.third : value.first) : own.trim().toLowerCase()}, ${T.momentFrame}`}</label>
            <textarea
              id="lines-moment-text" className="field" rows={2} maxLength={120} value={moment}
              onChange={(e) => { setMoment(e.target.value); setSkippedMoment(false); }}
            />
          </div>
          <Ideas ideas={ideas} picked={moment} onPick={(m) => { setMoment(m); setSkippedMoment(false); }} label={T.momentIdeas} />
          <div className="actions">
            <button className="btn" type="button" disabled={!moment.trim()} onClick={() => { setSkippedMoment(false); go2("shape"); }}>{T.next}</button>
            <button className="btn quiet" type="button" onClick={() => { setSkippedMoment(true); go2("shape"); }}>{T.momentSkip}</button>
          </div>
        </Screen>
      </>
    );
  }

  if (step === "shape") {
    return (
      <>
        {top}
        <Screen id="lines-shape">
          <h1 className="h2" data-say>{T.shapeAsk}</h1>
          <SolSays mood="happy">{T.shapeSol}</SolSays>
          <div className="lines-gallery" role="group" aria-label={T.shapeAsk}>
            {shapes.map((s) => (
              <button key={s} type="button" className="lines-pick" aria-pressed={text === s} onClick={() => { buzz(4); setText(s); }}>
                <span className="lines-quote" data-say>{s}</span>
              </button>
            ))}
          </div>
          <div className="actions"><button className="btn" type="button" disabled={!text.trim()} onClick={() => go2("tune")}>{T.next}</button></div>
        </Screen>
      </>
    );
  }

  if (step === "tune") {
    const leads = canLead(text, name);
    return (
      <>
        {top}
        <Screen id="lines-tune">
          <h1 className="h2" data-say>{T.tuneAsk}</h1>
          <SolSays mood="happy">{T.tuneSol}</SolSays>
          <SolSays mood="calm">{LINES.why.find((w) => w.id === "backfire")?.text}</SolSays>
          <Source id="backfire" />
          <div className="lines-frame">
            <label className="label" htmlFor="lines-text">{T.tuneLabel}</label>
            <textarea
              id="lines-text" ref={field} className="field lines-field" rows={4} maxLength={240} value={text}
              onChange={(e) => { edit(e.target.value); note(); }} onSelect={note} onBlur={note}
            />
          </div>
          <div className="section">
            <span className="label">{T.tuneSoft}</span>
            <div className="chips" role="group" aria-label={T.tuneSoft}>
              {leads ? LINES.lead.map((w) => (
                <button key={w} type="button" className="chip idea" onClick={() => { buzz(4); setText(addLead(text, name, w)); }}>{w}</button>
              )) : null}
              {LINES.tail.map((w) => (
                <button key={w} type="button" className="chip idea" onClick={() => { buzz(4); setText(addTail(text, w)); }}>{w}</button>
              ))}
            </div>
          </div>
          {bank.length ? (
            <div className="section">
              <span className="label">{T.tuneBank}</span>
              <div className="chips" role="group" aria-label={T.tuneBank}>
                {bank.map((w) => <button key={w} type="button" className="chip idea" onClick={() => { buzz(4); addWord(w); }}>{w}</button>)}
              </div>
            </div>
          ) : null}
          <div className="section">
            <span className="label">{T.tuneSuggest}</span>
            <div className="chips" role="group" aria-label={T.tuneSuggest}>
              {LINES.suggest.map((w) => <button key={w} type="button" className="chip idea" onClick={() => { buzz(4); addWord(w); }}>{w}</button>)}
            </div>
          </div>
          <div className="actions"><button className="btn" type="button" disabled={!text.trim()} onClick={() => go2("try")}>{T.next}</button></div>
        </Screen>
      </>
    );
  }

  if (step === "try") {
    const reply = truth === null ? null : truth < 40 ? T.truthLow : truth < 70 ? T.truthMid : T.truthHigh;
    return (
      <>
        {top}
        <Screen id="lines-try">
          <h1 className="h2" data-say>{T.tryAsk}</h1>
          <SolSays mood="calm">{T.trySol}</SolSays>
          <div className="lines-stage"><p className="lines-quote" data-say>{text}</p></div>
          {canSpeak() ? (
            <button className="btn quiet" type="button" onClick={() => { if (reading) { stopSpeaking(); setReading(false); } else { speak(text); setReading(true); } }}>
              {reading ? T.tryStop : T.tryRead}
            </button>
          ) : null}
          <div className="range">
            <label className="label" htmlFor="lines-truth">{T.truthLabel}</label>
            <input
              id="lines-truth" type="range" min={0} max={100} step={5} value={truth ?? 50}
              aria-valuetext={truth === null ? undefined : format(T.truthValue, { n: truth })}
              onChange={(e) => { setTruth(Number(e.target.value)); }}
              onPointerUp={(e) => setTruth(Number((e.target as HTMLInputElement).value))}
              onKeyUp={(e) => { if (truth === null && (e.key === "Enter" || e.key === " ")) setTruth(50); }}
            />
            <div className="ends" aria-hidden="true"><span>{T.truthEnds[0]}</span><span>{T.truthEnds[1]}</span></div>
          </div>
          {reply ? <SolSays mood={truth! < 40 ? "curious" : "happy"}>{reply}</SolSays> : null}
          <div className="actions">
            <button className="btn" type="button" disabled={truth === null} onClick={keep}>{T.keep}</button>
            <button className="btn quiet" type="button" onClick={() => go2("tune")}>{T.tuneMore}</button>
          </div>
        </Screen>
      </>
    );
  }

  if (step === "after") {
    return (
      <>
        <FlowTop onClose={leave} />
        <Screen id="lines-after">
          <SolSays mood="happy">{T.afterIntro}</SolSays>
          <FeelCheck id="lines-after" phase="after" value={after} onChange={setAfter} />
          <div className="actions">
            <button className="btn" type="button" onClick={() => { saveShift("lines", before, after, recId ?? undefined); setShifted(true); go2("done"); }}>{T.continue}</button>
            <button className="btn quiet" type="button" onClick={() => go2("done")}>{T.skip}</button>
          </div>
        </Screen>
      </>
    );
  }

  // done
  const line = text.trim();
  return (
    <>
      <FlowTop onClose={leave} />
      <Screen id="lines-done">
        <h1 className="h2" data-say>{existing || tuneId ? T.tuned : T.keptAsk}</h1>
        <div className="lines-stage"><p className="lines-quote" data-say>{line}</p></div>
        <SolSays mood="happy">{name.trim() ? format(T.keptSol, { name: name.trim().toLowerCase() }) : T.keptSolNoName}</SolSays>
        {shifted ? <Shift before={before} after={after} /> : null}
        <p className="small">{T.doneThanks}</p>
        <div className="actions">
          {existing || tuneId ? null : <button className="btn" type="button" onClick={another}>{T.another}</button>}
          <button className="btn quiet" type="button" onClick={() => go({ name: "home" })}>{T.done}</button>
        </div>
      </Screen>
    </>
  );
}
