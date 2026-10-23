// the warm room: land, build a kind voice, bring one small hard thing, hear it answered in kindness,
// then see what shifted. everything here can be skipped, and nothing is stored unless it's kept.
import { useEffect, useRef, useState } from "react";
import { keptChime } from "../../lib/feedback";
import { format } from "../../lib/template";
import { go, href } from "../../router";
import { store } from "../../store/store";
import { useData } from "../../store/useStore";
import { Breath } from "../../ui/Breath";
import { FlowTop, Ideas, Screen, SolSays } from "../../ui/kit";
import type { GrowthScreenProps } from "../types";
import { FeelCheck } from "../feel/FeelCheck";
import { middle, saveShift, type Feel } from "../feel/feel";
import { Shift } from "../feel/Shift";
import { compose, copy, nameOf, ownLines, parts, PARTS, voiceOf, weaveLine, WARM, type Voice } from "./warm";
import "./warm.css";

const hub = () => go({ name: "grow", feature: "warm" });
const top = () => window.scrollTo(0, 0);

export default function Warm({ sub }: GrowthScreenProps) {
  if (sub === "visit") return <Visit />;
  if (sub === "voice") return <VoiceScreen />;
  if (sub === "why") return <Why />;
  return <Hub />;
}

function VoiceAvatar() {
  return (
    <span className="warm-av" aria-hidden="true">
      <svg viewBox="0 0 24 24"><path d="M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2 1-3.2 2-4.5.4 1.2 1 1.8 1.8 2.2C10.5 8 11 5.5 12 3z" /></svg>
    </span>
  );
}

// a bubble from the person's own compassionate voice (not dawn)
function VoiceSays({ children, label }: { children: React.ReactNode; label?: string }) {
  return (
    <div className="msg warm-msg">
      <VoiceAvatar />
      <div className="warm-said">
        {label ? <span className="label">{label}</span> : null}
        <p className="bubble warm-bubble" data-say>{children}</p>
      </div>
    </div>
  );
}

function Hub() {
  const { grown } = useData();
  const voice = voiceOf(grown);
  return (
    <>
      <FlowTop onClose={() => go({ name: "practice" })} title={copy.title} />
      <Screen id="warm-hub">
        <SolSays mood="happy">{voice ? format(copy.hubSolVoice!, { voice: nameOf(voice) }) : copy.hubSol}</SolSays>
        <div className="card warm-voice">
          <span className="label">{copy.voiceTitle}</span>
          {voice ? (
            <>
              <p className="warm-name">{nameOf(voice)}</p>
              <p className="small">{voice.qualities.join(", ")}</p>
              <a className="btn quiet" href={href({ name: "grow", feature: "warm", sub: "voice" })}>{copy.voiceChange}</a>
            </>
          ) : (
            <p className="small">{copy.voiceNone}</p>
          )}
        </div>
        <div className="actions">
          <a className="btn" href={href({ name: "grow", feature: "warm", sub: "visit" })}>{voice ? copy.enterAgain : copy.enter}</a>
          <a className="btn ghost" href={href({ name: "grow", feature: "warm", sub: "why" })}>{copy.why}</a>
        </div>
      </Screen>
    </>
  );
}

// pick two or three qualities and, if one fits, a name. saved as warm/voice and changeable any time
function VoiceBuilder({ voice, onDone }: { voice: Voice | null; onDone: () => void }) {
  const [picked, setPicked] = useState<string[]>(voice?.qualities ?? []);
  const [name, setName] = useState(voice?.name ?? "");
  const toggle = (id: string) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id].slice(-3)));
  const save = () => {
    const data = { name: name.trim() || null, qualities: picked };
    if (voice) store.regrow(voice.id, data);
    else store.grow("warm", "voice", data);
    onDone();
  };
  return (
    <>
      <SolSays mood="curious">{copy.voiceSol}</SolSays>
      <div className="warm-qs" role="group" aria-label={copy.voiceQualities}>
        {WARM.qualities.map((q) => (
          <button key={q.id} type="button" className="warm-q" aria-pressed={picked.includes(q.id)} onClick={() => toggle(q.id)}>
            <b>{q.label}</b><small>{q.blurb}</small>
          </button>
        ))}
      </div>
      <p className="small" role="status">{picked.length >= 2 ? format(copy.voiceCount!, { n: picked.length }) : copy.chooseOne}</p>
      <div className="section">
        <label className="label" htmlFor="warm-name">{copy.voiceNameLabel}</label>
        <input id="warm-name" className="field" value={name} maxLength={30} placeholder={copy.voiceNamePlaceholder} onChange={(e) => setName(e.target.value)} />
      </div>
      <Ideas ideas={WARM.nameIdeas} picked={name} onPick={setName} label={copy.voiceNameIdeas} />
      <button className="btn" type="button" disabled={picked.length < 2} onClick={save}>{copy.voiceDone}</button>
    </>
  );
}

function VoiceScreen() {
  const { grown } = useData();
  const [voice] = useState(() => voiceOf(grown));
  return (
    <>
      <FlowTop onClose={hub} title={copy.voiceTitle} />
      <Screen id="warm-voice">
        <VoiceBuilder voice={voice} onDone={hub} />
      </Screen>
    </>
  );
}

type Step = "before" | "settle" | "voice" | "thing" | "answer" | "after" | "end";

function Visit() {
  const { grown, name } = useData();
  const voice = voiceOf(grown);
  const [needVoice] = useState(() => !voiceOf(grown));
  const steps: Step[] = ["before", "settle", ...(needVoice ? (["voice"] as const) : []), "thing", "answer", "after", "end"];
  const [step, setStep] = useState<Step>("before");
  const [before, setBefore] = useState<Feel>(middle);
  const [after, setAfter] = useState<Feel>(middle);
  const [checked, setChecked] = useState({ before: false, after: false });
  const [thing, setThing] = useState("");
  const [round, setRound] = useState(0);
  const [seed] = useState(() => Math.floor(Math.random() * 12));
  const [shown, setShown] = useState(1);
  const [keepThing, setKeepThing] = useState(false);
  const [outcome, setOutcome] = useState<"kept" | "gone" | null>(null);
  const [breath, setBreath] = useState<"idle" | "going" | "done">("idle");
  const shiftSaved = useRef(false);

  const go1 = (to: Step) => { top(); setStep(to); };
  const next = () => go1(steps[steps.indexOf(step) + 1] ?? "end");
  const vname = nameOf(voice);
  const own = ownLines(grown);
  const said = compose(voice?.qualities ?? ["warm"], name, round, seed);
  const weave = weaveLine(own, round);
  const total = 3 + (weave ? 1 : 0);
  const trimmed = thing.trim();

  // a shift is saved only when both checks happened
  useEffect(() => {
    if (step === "end" && checked.before && checked.after && !shiftSaved.current) {
      shiftSaved.current = true;
      saveShift("warm", before, after);
    }
  }, [step, checked, before, after]);

  const keep = () => {
    store.grow("warm", "visit", { lines: said.map((s) => s.text), thing: keepThing && trimmed ? trimmed : null });
    keptChime();
    setOutcome("kept");
  };

  const feelStep = (phase: "before" | "after") => (
    <>
      <SolSays mood="happy">{phase === "before" ? copy.beforeSol : copy.afterSol}</SolSays>
      <FeelCheck id={`warm-${phase}`} phase={phase} value={phase === "before" ? before : after} onChange={phase === "before" ? setBefore : setAfter} />
      <div className="actions">
        <button className="btn" type="button" onClick={() => { setChecked((c) => ({ ...c, [phase]: true })); next(); }}>{copy.continue}</button>
        <button className="btn ghost" type="button" onClick={next}>{copy.skip}</button>
      </div>
    </>
  );

  return (
    <>
      <FlowTop at={steps.indexOf(step)} of={steps.length} onClose={hub} />
      <Screen id={`warm-${step}`}>
        <h1 className="warm-sr">{copy.title}</h1>
        {step === "before" ? feelStep("before") : null}

        {step === "settle" ? (
          <>
            <SolSays mood="calm">{copy.settleSol}</SolSays>
            {breath === "idle" ? <button className="btn quiet" type="button" onClick={() => setBreath("going")}>{copy.breathe}</button> : <Breath breaths={2} onDone={() => setBreath("done")} />}
            <div className="know">
              <span className="label">{copy.touchTitle}</span>
              <p>{copy.touchText}</p>
              <span className="src">{copy.touchEvidence}</span>
            </div>
            <button className="btn" type="button" onClick={next}>{breath === "done" ? copy.continue : copy.skip}</button>
          </>
        ) : null}

        {step === "voice" ? <VoiceBuilder voice={null} onDone={next} /> : null}

        {step === "thing" ? (
          <>
            <SolSays mood="curious">{copy.thingSol}</SolSays>
            <div className="section">
              <label className="label" htmlFor="warm-thing">{copy.thingLabel}</label>
              <textarea id="warm-thing" className="field" rows={2} maxLength={140} placeholder={copy.thingPlaceholder} value={thing} onChange={(e) => setThing(e.target.value)} />
            </div>
            <Ideas ideas={WARM.thingIdeas} picked={thing} onPick={setThing} label={copy.thingIdeas} />
            <div className="actions">
              <button className="btn" type="button" disabled={!trimmed} onClick={next}>{format(copy.thingNext!, { voice: vname })}</button>
              <button className="btn ghost" type="button" onClick={() => { setThing(""); next(); }}>{copy.thingSkip}</button>
            </div>
          </>
        ) : null}

        {step === "answer" ? (
          <>
            <SolSays mood="calm">{format(trimmed ? copy.answerSol! : copy.answerSolNoThing!, { voice: vname })}</SolSays>
            {trimmed ? (
              <div className="card warm-brought"><span className="label">{copy.brought}</span><p className="quote">{trimmed}</p></div>
            ) : null}
            <div className="warm-stack" aria-live="polite">
              {said.slice(0, Math.min(shown, 3)).map((s, i) => (
                <VoiceSays key={`${round}-${PARTS[i]}`} label={parts[s.part]}>{s.text}</VoiceSays>
              ))}
              {weave && shown > 3 ? (
                <VoiceSays label={copy.weave}>{weave}</VoiceSays>
              ) : null}
            </div>
            {shown < total ? (
              <button className="btn" type="button" onClick={() => setShown(shown + 1)}>{copy.goOn}</button>
            ) : (
              <div className="actions">
                <button className="btn" type="button" onClick={next}>{copy.enough}</button>
                <button className="btn quiet" type="button" onClick={() => { setRound(round + 1); setShown(1); }}>{copy.another}</button>
              </div>
            )}
          </>
        ) : null}

        {step === "after" ? feelStep("after") : null}

        {step === "end" ? (
          <>
            <SolSays mood="happy">{checked.before && checked.after ? copy.endSol : copy.endSolNoShift}</SolSays>
            {checked.before && checked.after ? <Shift before={before} after={after} /> : null}
            {outcome ? (
              <>
                <p className="empty" role="status">{outcome === "kept" ? copy.kept : copy.letGone}</p>
                <button className="btn" type="button" onClick={() => go({ name: "practice" })}>{copy.done}</button>
              </>
            ) : (
              <>
                {trimmed ? (
                  <label className="check">
                    <input type="checkbox" checked={keepThing} onChange={(e) => setKeepThing(e.target.checked)} />
                    <span className="warm-keep">{copy.keepThing}<small className="small">{copy.keepThingNote}</small></span>
                  </label>
                ) : null}
                <div className="actions">
                  <button className="btn" type="button" onClick={keep}>{format(copy.keep!, { voice: vname })}</button>
                  <button className="btn quiet" type="button" onClick={() => setOutcome("gone")}>{copy.letGo}</button>
                </div>
              </>
            )}
          </>
        ) : null}
      </Screen>
    </>
  );
}

// why this works: short bubbles, each claim with a source and an honest evidence label
function Why() {
  const [i, setI] = useState(0);
  const page = WARM.why[i];
  const last = i === WARM.why.length - 1;
  const src = page?.know ? WARM.sources[page.know.source] : undefined;
  return (
    <>
      <FlowTop at={i} of={WARM.why.length} onClose={hub} back={i > 0 ? () => { top(); setI(i - 1); } : undefined} />
      <Screen id={`warm-why-${i}`}>
        <h1 className="warm-sr">{copy.whyTitle}</h1>
        {page ? <SolSays mood="calm">{page.say}</SolSays> : null}
        {page?.know && src ? (
          <div className="know">
            <span className="label">{copy.knowLabel}</span>
            <p data-say>{page.know.text}</p>
            <span className="src">{src.label} · {copy.evidence}: {src.evidence}</span>
          </div>
        ) : null}
        {last ? (
          <>
            <SolSays mood="happy">{copy.whyDone}</SolSays>
            <p className="small">{copy.whyHelp}</p>
            <a className="btn" href={href({ name: "grow", feature: "warm", sub: "visit" })}>{copy.enter}</a>
          </>
        ) : (
          <button className="btn" type="button" onClick={() => { top(); setI(i + 1); }}>{copy.next}</button>
        )}
      </Screen>
    </>
  );
}
