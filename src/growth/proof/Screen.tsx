// proof: pick an experiment in the morning (#/grow/proof/new), look back on it in the evening (#/grow/proof/close/<id>),
// and see everything kept (#/grow/proof). Nothing here is scored; "let it go" is always an option.
import { useState } from "react";
import { content } from "../../content/load";
import { buzz, keptChime } from "../../lib/feedback";
import { format, pieces } from "../../lib/template";
import { shortDate } from "../../lib/time";
import { go, href } from "../../router";
import { store } from "../../store/store";
import { useData } from "../../store/useStore";
import { FlowTop, Ideas, Screen, Sentence, SolSays, useLine } from "../../ui/kit";
import { FeelCheck } from "../feel/FeelCheck";
import { middle, saveShift, type Feel } from "../feel/feel";
import { Shift } from "../feel/Shift";
import type { GrowthScreenProps } from "../types";
import { experiments, isOpen, proofAgainst, proofs, sources, type Experiment, type Source } from "./data";
import { PROOF, T } from "./proof";
import "./proof.css";

const proofHome = () => go({ name: "grow", feature: "proof" });
const newHref = href({ name: "grow", feature: "proof", sub: "new" });
const closeHref = (id: string) => href({ name: "grow", feature: "proof", sub: `close/${id}` });

export default function ProofScreen({ sub }: GrowthScreenProps) {
  if (sub === "new") return <Morning />;
  if (sub?.startsWith("close/")) return <Evening id={sub.slice(6)} />;
  return <Home />;
}

// ---------- shared pieces ----------
function Write({ id, prompt, template, ideas, placeholder, value, onChange, hint }: {
  id: string; prompt: string; template: string; ideas: string[]; placeholder: string; value: string; onChange: (v: string) => void; hint?: string;
}) {
  return (
    <>
      <label className="h2" htmlFor={id} data-say>{prompt}</label>
      <Sentence parts={pieces(template, { x: value })} />
      <textarea id={id} className="field" rows={2} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      {hint ? <p className="small">{hint}</p> : null}
      <Ideas ideas={ideas} picked={value} onPick={onChange} />
    </>
  );
}

// a 0 to 100 reading of how true a thought feels: only there to look back at, never a score
function Believe({ id, value, onChange, ask, note }: { id: string; value: number; onChange: (n: number) => void; ask: string; note: string }) {
  const text = format(T.believeOf, { n: value });
  const ends = T.believeEnds;
  return (
    <>
      <label className="h2" htmlFor={id} data-say>{ask}</label>
      <div className="proof-dial">
        <p className="proof-num" aria-hidden="true">{text}</p>
        <input id={id} type="range" min={0} max={100} step={5} value={value} aria-valuetext={`${T.believeLabel}: ${text}`} onChange={(e) => { buzz(4); onChange(Number(e.target.value)); }} />
        <div className="proof-ends" aria-hidden="true"><span>{ends[0]}</span><span>{ends[1]}</span></div>
      </div>
      <p className="small">{note}</p>
    </>
  );
}

// when the same claim comes back, the proof already gathered against it
function Again({ claim, except }: { claim: string; except?: string }) {
  const { grown } = useData();
  const found = claim.trim() ? proofAgainst(grown, claim, except) : [];
  if (!found.length) return null;
  const shown = found.slice(0, 3);
  return (
    <section className="proof-again" aria-label={T.again}>
      <p className="label">{T.again}</p>
      <ul>{shown.map((p) => <li key={p.id}>{p.text}</li>)}</ul>
      {found.length > shown.length ? <p className="small">{format(T.againMore, { n: found.length - shown.length })}</p> : null}
    </section>
  );
}

// ---------- proof home ----------
function Home() {
  const { grown } = useData();
  const L = useLine();
  const [why, setWhy] = useState(false);
  const open = experiments(grown).filter(isOpen).reverse();
  const kept = proofs(grown).reverse();
  const letGo = (e: Experiment) => { buzz(6); store.regrow(e.id, { closedAt: new Date().toISOString(), result: null, letGo: true }); };
  return (
    <>
      <FlowTop onClose={() => go({ name: "practice" })} title={T.title} />
      <Screen id="proof-home">
        <SolSays>{L(T.solHome)}</SolSays>
        <a className="btn" href={newHref} onClick={() => buzz(6)}>{open.length ? T.startAgain : T.start}</a>

        {open.length ? (
          <section className="section" aria-labelledby="proof-open-h">
            <h2 id="proof-open-h" className="label">{T.openTitle}</h2>
            {open.map((e) => (
              <div key={e.id} className="card proof-open">
                <p>{e.plan ? format(T.planTemplate, { x: e.plan }) : T.eveningLabel}</p>
                <p className="small">{format(T.opened, { when: shortDate(e.at) })}</p>
                <div className="row-btns">
                  <a className="btn quiet" href={closeHref(e.id)} onClick={() => buzz(6)}>{L(T.tell)}</a>
                  <button className="btn ghost" type="button" onClick={() => letGo(e)}>{T.letGo}</button>
                </div>
              </div>
            ))}
            <p className="small">{T.openNote}</p>
          </section>
        ) : null}

        <section className="section" aria-labelledby="proof-kept-h">
          <h2 id="proof-kept-h" className="label">{T.proofTitle}</h2>
          {kept.length ? (
            <ul className="proof-list">
              {kept.map((p) => (
                <li key={p.id}>
                  <q>{p.text}</q>
                  <span className="small">{shortDate(p.at)}</span>
                  {p.claim ? <details><summary>{T.aboutIt}</summary><p className="proof-claim">{p.claim}</p></details> : null}
                </li>
              ))}
            </ul>
          ) : <p className="empty">{T.proofEmpty}</p>}
        </section>

        <button className="link" type="button" aria-expanded={why} onClick={() => setWhy((w) => !w)}>{why ? T.whyHide : T.why}</button>
        {why ? (
          <section className="section" aria-label={T.why}>
            {T.whyBubbles.map((b) => <SolSays key={b}>{b}</SolSays>)}
            <div className="card">
              <p className="label">{T.whySources}</p>
              {T.sourcesList.map((s) => (
                <p key={s.label} className="small"><a className="link" href={s.url} target="_blank" rel="noreferrer">{s.label}</a> · {s.evidence}</p>
              ))}
            </div>
          </section>
        ) : null}
      </Screen>
    </>
  );
}

// ---------- the morning ----------
type Pick = Source | { kind: "voice"; text: "" };

function Morning() {
  const { grown } = useData();
  const app = content().copy.app;
  const L = useLine();
  const offered = sources(grown);
  const [src, setSrc] = useState<Pick | null>(null);
  const [step, setStep] = useState(0);
  const [claim, setClaim] = useState("");
  const [prediction, setPrediction] = useState("");
  const [plan, setPlan] = useState("");
  const [believe, setBelieve] = useState(50);
  const [saved, setSaved] = useState(false);

  const voice = src?.kind === "voice";
  const names = ["source", ...(voice ? ["claim"] : []), "predict", "plan", "believe", "done"];
  const at = names[step] ?? "done";
  const ideas = voice ? "voice" : "kind";
  const next = () => setStep((n) => Math.min(n + 1, names.length - 1));
  const choose = (p: Pick) => { buzz(6); setSrc(p); setClaim(p.text); setStep(1); };

  const save = () => {
    if (saved || !src) return;
    buzz(12);
    keptChime();
    store.grow("proof", "experiment", {
      claim: claim.trim(), prediction: prediction.trim(), result: null, closedAt: null, plan: plan.trim(), source: src.kind, believe
    });
    setSaved(true);
    next();
  };
  const back = step > 0 && at !== "done" ? () => setStep((n) => n - 1) : undefined;

  return (
    <>
      <FlowTop at={step} of={names.length} onClose={proofHome} back={back} />
      <Screen id={`proof-new-${at}`}>
        {at === "source" ? (
          <>
            <h1 className="h2" data-say>{T.sourceAsk}</h1>
            <SolSays>{L(T.sourceTeach)}</SolSays>
            <div className="proof-sources">
              {offered.map((s) => (
                <button key={`${s.kind}-${s.text}`} type="button" className="proof-source" onClick={() => choose(s)}>
                  <span className="label">{s.kind === "ladder" ? T.fromLadder : T.fromLine}</span><q>{s.text}</q>
                </button>
              ))}
              <button type="button" className="proof-source" onClick={() => choose({ kind: "voice", text: "" })}>
                <span className="label">{T.fromVoice}</span>
              </button>
            </div>
            <p className="small">{T.sourceLead}</p>
          </>
        ) : at === "claim" ? (
          <>
            <Write id="proof-claim" prompt={T.claimAsk} template={T.claimTemplate} ideas={PROOF.ideas.claim} placeholder={T.claimPlaceholder} value={claim} onChange={setClaim} hint={T.voiceHint} />
            <Again claim={claim} />
            <SolSays>{L(T.claimSol)}</SolSays>
            <button className="btn" type="button" disabled={!claim.trim()} onClick={() => { buzz(6); next(); }}>{app.next}</button>
          </>
        ) : at === "predict" ? (
          <>
            {!voice ? <p className="reply-line" data-say>{claim}</p> : null}
            <Again claim={claim} />
            <Write id="proof-predict" prompt={L(T.predictAsk)} template={T.predictTemplate} ideas={PROOF.ideas.predict[ideas]} placeholder={T.predictPlaceholder} value={prediction} onChange={setPrediction} />
            <SolSays>{L(T.predictSol)}</SolSays>
            <button className="btn" type="button" disabled={!prediction.trim()} onClick={() => { buzz(6); next(); }}>{app.next}</button>
          </>
        ) : at === "plan" ? (
          <>
            <Write id="proof-plan" prompt={T.planAsk} template={T.planTemplate} ideas={PROOF.ideas.plan[ideas]} placeholder={T.planPlaceholder} value={plan} onChange={setPlan} />
            <button className="btn" type="button" disabled={!plan.trim()} onClick={() => { buzz(6); next(); }}>{app.next}</button>
          </>
        ) : at === "believe" ? (
          <>
            <Believe id="proof-believe" value={believe} onChange={setBelieve} ask={T.believeAsk} note={T.believeNote} />
            <button className="btn" type="button" disabled={saved} onClick={save}>{T.setUp}</button>
          </>
        ) : (
          <>
            <h1 className="h2" data-say>{T.doneTitle}</h1>
            <SolSays mood="happy">{L(T.doneSol)}</SolSays>
            <p className="small">{T.doneNote}</p>
            <a className="btn" href={href({ name: "home" })}>{T.doneHome}</a>
            <a className="btn quiet" href={href({ name: "grow", feature: "proof" })}>{T.doneBack}</a>
          </>
        )}
      </Screen>
    </>
  );
}

// ---------- the evening ----------
function Evening({ id }: { id: string }) {
  const { grown } = useData();
  const L = useLine();
  const exp = experiments(grown).find((e) => e.id === id);
  const [step, setStep] = useState(0);
  const [fb, setFb] = useState<Feel | null>(null);
  const [fa, setFa] = useState<Feel | null>(null);
  const [draft, setDraft] = useState<Feel>(middle);
  const [happened, setHappened] = useState<(typeof T.happened)[number] | null>(null);
  const [text, setText] = useState("");
  const [keptText, setKeptText] = useState<string | null>(null);
  const [after, setAfter] = useState(50);
  const [outcome, setOutcome] = useState<"closed" | "open" | "letGo" | null>(null);
  const app = content().copy.app;

  if (!exp) {
    return (
      <>
        <FlowTop onClose={proofHome} />
        <Screen id="proof-missing"><p className="empty">{T.missing}</p></Screen>
      </>
    );
  }
  const notYet = happened?.id === "notyet";
  const names = ["feel1", "happened", ...(notYet ? [] : ["keep"]), ...(!notYet && exp.believe !== undefined ? ["believe"] : []), "close", "feel2", "done"];
  const at = names[step] ?? "done";
  const next = () => { buzz(6); setStep((n) => Math.min(n + 1, names.length - 1)); };
  const keepIdeas = happened && happened.id !== "notyet" ? PROOF.ideas.kept[happened.id as "asVoice" | "different" | "between"] : [];

  const keep = () => {
    const t = text.trim();
    if (!t || keptText) return;
    buzz(12);
    keptChime();
    store.grow("proof", "proof", { text: t, from: T.fromExperiment, experiment: exp.id, claim: exp.claim });
    setKeptText(t);
  };
  const finish = (how: "closed" | "open" | "letGo") => {
    buzz(8);
    const now = new Date().toISOString();
    const reading = !notYet && exp.believe !== undefined ? { believeAfter: after } : {};
    if (how === "closed") store.regrow(exp.id, { result: keptText ?? happened?.label ?? "", closedAt: now, ...reading });
    else if (how === "letGo") store.regrow(exp.id, { result: null, closedAt: now, letGo: true });
    setOutcome(how);
    next();
  };
  const endFeel = (f: Feel | null) => {
    setFa(f);
    if (fb && f) saveShift("proof", fb, f, exp.id);
    next();
  };

  return (
    <>
      <FlowTop at={step} of={names.length} onClose={proofHome} back={step > 0 && at !== "done" && at !== "feel2" ? () => setStep((n) => n - 1) : undefined} />
      <Screen id={`proof-close-${at}`}>
        {at === "feel1" ? (
          <>
            <SolSays mood="happy">{L(T.eveningAsk)}</SolSays>
            <FeelCheck id="proof-before" phase="before" value={draft} onChange={setDraft} />
            <button className="btn" type="button" onClick={() => { setFb(draft); setDraft(middle()); next(); }}>{app.continue}</button>
            <button className="btn ghost" type="button" onClick={() => { setFb(null); setDraft(middle()); next(); }}>{app.skip}</button>
          </>
        ) : at === "happened" ? (
          <>
            <h1 className="h2" data-say>{T.happenedAsk}</h1>
            <div className="proof-rec">
              <p className="label">{T.testing}</p>
              <p className="reply-line" data-say>{exp.claim}</p>
            </div>
            <div className="option-stack" role="group" aria-label={T.happenedAsk}>
              {T.happened.map((o) => (
                <button key={o.id} type="button" className="option" aria-pressed={happened?.id === o.id} onClick={() => { buzz(6); setHappened(o); }}>{o.label}</button>
              ))}
            </div>
            {happened ? (
              <>
                <SolSays>{L(happened.reply)}</SolSays>
                <button className="btn" type="button" onClick={next}>{app.continue}</button>
              </>
            ) : null}
          </>
        ) : at === "keep" ? (
          <>
            {keptText ? (
              <>
                <h1 className="h2" data-say>{T.keepAsk}</h1>
                <p className="reply-line" data-say>{keptText}</p>
                <SolSays mood="happy">{L(T.keptSol)}</SolSays>
                <button className="btn" type="button" onClick={next}>{app.continue}</button>
              </>
            ) : (
              <>
                <Write id="proof-keep" prompt={T.keepAsk} template={T.keepTemplate} ideas={keepIdeas} placeholder={T.keepPlaceholder} value={text} onChange={setText} />
                <SolSays>{T.keepTeach}</SolSays>
                <button className="btn" type="button" disabled={!text.trim()} onClick={keep}>{T.keepIt}</button>
                <button className="btn ghost" type="button" onClick={next}>{T.nothingToKeep}</button>
              </>
            )}
          </>
        ) : at === "believe" ? (
          <>
            <Believe id="proof-after" value={after} onChange={setAfter} ask={T.believeAgain} note={format(T.believeWas, { n: exp.believe ?? 0 })} />
            <button className="btn" type="button" onClick={next}>{app.continue}</button>
          </>
        ) : at === "close" ? (
          <>
            <h1 className="h2" data-say>{T.closeAsk}</h1>
            {!notYet ? <button className="btn" type="button" onClick={() => finish("closed")}>{T.closeIt}</button> : null}
            <button className={notYet ? "btn" : "btn quiet"} type="button" onClick={() => finish("open")}>{T.keepOpen}</button>
            <button className="btn ghost" type="button" onClick={() => finish("letGo")}>{T.letGo}</button>
          </>
        ) : at === "feel2" ? (
          <>
            <SolSays>{L(outcome === "closed" ? T.closedSol : outcome === "letGo" ? T.letGoSol : T.openSol)}</SolSays>
            <FeelCheck id="proof-after-feel" phase="after" value={draft} onChange={setDraft} />
            <button className="btn" type="button" onClick={() => endFeel(draft)}>{app.continue}</button>
            <button className="btn ghost" type="button" onClick={() => endFeel(null)}>{app.skip}</button>
          </>
        ) : (
          <>
            <h1 className="h2" data-say>{T.thanks}</h1>
            <SolSays mood="happy">{L(T.reflectDone)}</SolSays>
            {fb && fa ? (
              <>
                <p className="small">{T.shiftSol}</p>
                <Shift before={fb} after={fa} />
              </>
            ) : null}
            <a className="btn" href={href({ name: "home" })}>{T.doneHome}</a>
            <a className="btn quiet" href={href({ name: "grow", feature: "proof" })}>{T.doneBack}</a>
          </>
        )}
      </Screen>
    </>
  );
}
