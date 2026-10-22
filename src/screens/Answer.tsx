// answer it: catch what the inner voice said, notice how loud it is, answer it in your own words.
// The draft (including the inner voice's words) lives only in this tab's session, never in lasting storage.
import { useReducedMotion } from "motion/react";
import * as m from "motion/react-m";
import { useEffect, useRef, useState } from "react";
import { content } from "../content/load";
import type { Formula } from "../content/schema";
import { buzz, keptChime } from "../lib/feedback";
import { toFirstPerson } from "../lib/person";
import { fill, finish, format, pieces, trimEnd } from "../lib/template";
import { shortDate } from "../lib/time";
import { go } from "../router";
import { store } from "../store/store";
import { useData } from "../store/useStore";
import { FlowBar, Ideas, Loudness, Screen, Sentence } from "../ui/kit";

type Step = "catch" | "loud" | "calm" | "way" | "write" | "again" | "kept";
type Draft = {
  updated?: number;
  step: Step; said: string; loud: number; calmed: boolean; way: string | null; preset: boolean;
  vals: Record<string, string>; loud2: number; keepSaid: boolean; keptId: string | null;
};

const KEY = "heyyou.draft";
// an unfinished answer is kept for a short while only, so a shared phone never shows it later
const DRAFT_LIFE = 30 * 60 * 1000;
const blank = (way?: string): Draft => ({
  step: "catch", said: "", loud: 0, calmed: false, way: way ?? null, preset: !!way, vals: {}, loud2: 0, keepSaid: false, keptId: null
});
function loadDraft(way?: string): Draft {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (raw) {
      const d = JSON.parse(raw) as Draft;
      if (Date.now() - (d.updated ?? 0) > DRAFT_LIFE) sessionStorage.removeItem(KEY);
      else if (!way || d.way === way) return d;
    }
  } catch {
    // start fresh
  }
  return blank(way);
}
function saveDraft(d: Draft | null) {
  try {
    if (d) sessionStorage.setItem(KEY, JSON.stringify({ ...d, updated: Date.now() }));
    else sessionStorage.removeItem(KEY);
  } catch {
    // the flow still works without it
  }
}

export function stepsFor(d: Pick<Draft, "loud" | "preset">): Step[] {
  return ["catch", "loud", ...(d.loud >= 4 ? (["calm"] as const) : []), ...(d.preset ? [] : (["way"] as const)), "write", "again", "kept"];
}

export function Answer({ way }: { way?: string }) {
  const c = content();
  const copy = c.copy;
  const { name } = useData();
  const [d, setD] = useState<Draft>(() => loadDraft(way && c.formulas.some((f) => f.id === way) ? way : undefined));
  useEffect(() => saveDraft(d.keptId ? null : d), [d]);

  const f = c.formulas.find((x) => x.id === d.way);
  const steps = stepsFor(d);
  const at = Math.max(0, steps.indexOf(d.step));
  const update = (patch: Partial<Draft>) => setD((x) => ({ ...x, ...patch }));
  const toStep = (step: Step) => {
    window.scrollTo(0, 0);
    update({ step });
  };
  const next = () => {
    const s = stepsFor(d);
    const n = s[s.indexOf(d.step) + 1];
    if (n === "write" && f) update({ vals: prefill(f, d.said, name, d.vals) });
    if (n) toStep(n);
  };
  const leave = () => go({ name: "today" });
  const back = at > 0 && d.step !== "kept" ? () => toStep(steps[at - 1]!) : undefined;

  const result = f ? finish(fill(f.template, d.vals)) : "";

  let body: React.ReactNode = null;
  switch (d.step) {
    case "catch":
      body = (
        <>
          <h1 className="ask" data-say>{copy.answer.catchAsk}</h1>
          <label className="sr" htmlFor="said">{copy.answer.catchLabel}</label>
          <textarea
            id="said" className="field" rows={2} autoComplete="off" placeholder={copy.answer.catchPlaceholder}
            value={d.said} onChange={(e) => update({ said: e.target.value })}
          />
          <p className="small">{copy.answer.catchNote}</p>
          <Ideas ideas={c.catchIdeas} picked={d.said} onPick={(said) => update({ said })} label={copy.answer.catchIdeas} />
          <div className="actions"><button className="btn" type="button" disabled={!d.said.trim()} onClick={next}>{copy.app.next}</button></div>
        </>
      );
      break;
    case "loud":
      body = (
        <>
          <h1 className="ask" data-say>{copy.answer.loudAsk}</h1>
          <Loudness said={d.said} value={d.loud} onChange={(loud) => update({ loud })} />
          <div className="actions">
            <button className="btn" type="button" disabled={!d.loud} onClick={next}>{copy.app.next}</button>
            <button className="btn quiet" type="button" onClick={() => {
              window.scrollTo(0, 0);
              setD((s) => ({ ...s, loud: 0, step: s.preset ? "write" : "way", vals: s.preset && f ? prefill(f, s.said, name, s.vals) : s.vals }));
            }}>
              {copy.loudness.hardToSay}
            </button>
          </div>
        </>
      );
      break;
    case "calm":
      body = <Calm calmed={d.calmed} onBreathe={() => update({ calmed: true })} onNext={next} />;
      break;
    case "way":
      body = (
        <>
          <p className="said small-said">{d.said}</p>
          <h1 className="ask" data-say>{copy.answer.wayAsk}</h1>
          <div className="ways">
            {c.formulas.map((x) => (
              <button key={x.id} type="button" className="way" onClick={() => {
                buzz(4);
                setD((s) => ({ ...s, way: x.id, vals: prefill(x, s.said, name, {}), step: "write" }));
                window.scrollTo(0, 0);
              }}>
                <span className="way-name"><b>{x.name}</b><small>{x.evidence}</small></span>
                <span className="eg"><span className="inner">{x.example.before}</span><span className="mine">{x.example.after}</span></span>
              </button>
            ))}
          </div>
        </>
      );
      break;
    case "write":
      body = f ? <Write f={f} said={d.said} vals={d.vals} onVals={(vals) => update({ vals })} onDone={next} /> : null;
      break;
    case "again":
      body = (
        <>
          <h1 className="ask" data-say>{copy.answer.againAsk}</h1>
          <Loudness said={d.said} value={d.loud2} onChange={(loud2) => update({ loud2 })} reply={result} />
          <div className="actions">
            <button className="btn" type="button" disabled={!d.loud2} onClick={next}>{copy.app.next}</button>
            <button className="btn quiet" type="button" onClick={() => { update({ loud2: 0 }); toStep("kept"); }}>{copy.loudness.hardToSay}</button>
          </div>
        </>
      );
      break;
    case "kept": {
      const names = copy.loudness.names;
      const both = d.loud && d.loud2;
      const msg = !both ? copy.answer.plain : d.loud2 < d.loud ? copy.answer.quieter : d.loud2 === d.loud ? copy.answer.same : copy.answer.louder;
      body = (
        <>
          <p className="label" style={{ marginTop: "var(--s4)" }}>{copy.answer.forBook}</p>
          <m.article
            className="page"
            initial={{ opacity: 0, y: 18, rotate: -1.2 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ duration: 0.8, ease: [0.2, 0.7, 0.2, 1] }}
          >
            <p className="mine" data-say>{result}</p>
            {both ? <p className="shift">{names[d.loud - 1]} <span aria-hidden="true">→</span><span className="sr">to</span> {names[d.loud2 - 1]}</p> : null}
            <div className="meta"><span>{f?.name}</span><span>{shortDate(new Date().toISOString())}</span></div>
          </m.article>
          {d.keptId ? (
            <>
              <p className="note" role="status">{copy.answer.kept}</p>
              <div className="actions">
                <button className="btn" type="button" onClick={() => go({ name: "book" })}>{copy.answer.seeBook}</button>
                <button className="btn quiet" type="button" onClick={leave}>{copy.answer.backToday}</button>
              </div>
            </>
          ) : (
            <>
              <p className="note" data-say>{msg}</p>
              {f && includesSaid(f, d.vals, d.said) ? (
                <p className="small">
                  {copy.answer.includesSaid}{" "}
                  <button className="link" type="button" style={{ minHeight: 0, padding: 0 }} onClick={() => toStep("write")}>{copy.answer.change}</button>
                </p>
              ) : null}
              <label className="check">
                <input type="checkbox" checked={d.keepSaid} onChange={(e) => update({ keepSaid: e.target.checked })} />
                {copy.answer.keepSaid}
              </label>
              <div className="actions">
                <button className="btn" type="button" onClick={() => {
                  if (d.keepSaid && d.said.trim()) store.add({ kind: "voice", text: format(copy.answer.saidAs, { said: d.said.trim() }), from: f?.name ?? "", said: true });
                  const e = store.add({ kind: "voice", text: result, from: f?.name ?? "", ...(d.loud ? { before: d.loud } : {}), ...(d.loud2 ? { after: d.loud2 } : {}) });
                  buzz(20);
                  keptChime();
                  saveDraft(null);
                  update({ keptId: e?.id ?? "kept", said: "" });
                }}>{copy.answer.keep}</button>
                <button className="btn quiet" type="button" onClick={() => { update({ way: null, preset: false, vals: {}, loud2: 0 }); toStep("way"); }}>{copy.answer.another}</button>
                <button className="btn quiet" type="button" onClick={() => { saveDraft(null); setD(blank()); leave(); }}>{copy.answer.letGo}</button>
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
      <FlowBar at={at} of={steps.length} onClose={leave} back={back} />
      <Screen id={`answer-${d.step}`}>{body}</Screen>
    </>
  );
}

// whether the answer still carries the inner voice's own words
function includesSaid(f: Formula, vals: Record<string, string>, said: string) {
  const own = [trimEnd(said), trimEnd(toFirstPerson(said))].map((x) => x.toLowerCase()).filter(Boolean);
  return f.slots.some((s) => s.fill && own.includes((vals[s.key] ?? "").trim().toLowerCase()));
}

function prefill(f: Formula, said: string, name: string, vals: Record<string, string>) {
  const out: Record<string, string> = {};
  for (const s of f.slots) {
    if (vals[s.key]) out[s.key] = vals[s.key]!;
    else if (s.fill === "original") out[s.key] = trimEnd(said);
    else if (s.fill === "original-i") out[s.key] = trimEnd(toFirstPerson(said));
    else if (s.fill === "name") out[s.key] = name;
  }
  return out;
}

function Write({ f, said, vals, onVals, onDone }: { f: Formula; said: string; vals: Record<string, string>; onVals: (v: Record<string, string>) => void; onDone: () => void }) {
  const copy = content().copy;
  const [about, setAbout] = useState(false);
  const ready = f.slots.every((s) => (vals[s.key] ?? "").trim());
  const set = (k: string, v: string) => onVals({ ...vals, [k]: v });
  return (
    <>
      <div className="exchange">
        <p className="inner">{said}</p>
        <Sentence parts={pieces(f.template, vals)} />
      </div>
      {f.slots.map((s) => (
        <div className="fieldset" key={s.key}>
          {s.chips ? <p className="label" id={`lbl-${s.key}`}>{s.label}</p> : <label className="label" htmlFor={`slot-${s.key}`} id={`lbl-${s.key}`}>{s.label}</label>}
          {s.chips ? (
            <div className="chips" role="group" aria-labelledby={`lbl-${s.key}`}>
              {s.chips.map((x) => (
                <button key={x} type="button" className="chip" aria-pressed={vals[s.key] === x} onClick={() => { buzz(4); set(s.key, x); }}>{x}</button>
              ))}
            </div>
          ) : (
            <>
              <input
                id={`slot-${s.key}`} className="field voice" autoComplete="off" value={vals[s.key] ?? ""}
                placeholder={s.placeholder ?? copy.answer.slotPlaceholder} onChange={(e) => set(s.key, e.target.value)}
              />
              {s.ideas ? <Ideas ideas={s.ideas} picked={vals[s.key]} onPick={(v) => set(s.key, v)} /> : null}
            </>
          )}
        </div>
      ))}
      {about ? <p className="small" data-say>{f.why}</p> : (
        <button className="link" type="button" aria-expanded={false} onClick={() => setAbout(true)}>{copy.answer.aboutWay}</button>
      )}
      <p className="source">
        {f.name} · {f.source.url ? <a href={f.source.url} target="_blank" rel="noopener noreferrer">{f.source.label}</a> : f.source.label} · {copy.answer.evidence}: {f.evidence}
      </p>
      <div className="actions"><button className="btn" type="button" disabled={!ready} onClick={onDone}>{copy.answer.thisIsMine}</button></div>
    </>
  );
}

// an optional breath before answering something loud
function Calm({ calmed, onBreathe, onNext }: { calmed: boolean; onBreathe: () => void; onNext: () => void }) {
  const copy = content().copy;
  const reduce = useReducedMotion();
  const [breathing, setBreathing] = useState(false);
  const [word, setWord] = useState(copy.answer.calmIn);
  const done = useRef(onBreathe);
  useEffect(() => {
    done.current = onBreathe;
  });
  useEffect(() => {
    if (!breathing || reduce) return;
    // three breaths: 4s in, 6s out
    const timers: number[] = [];
    for (let i = 0; i < 3; i++) {
      timers.push(window.setTimeout(() => setWord(copy.answer.calmIn), i * 10000));
      timers.push(window.setTimeout(() => setWord(copy.answer.calmOut), i * 10000 + 4000));
    }
    timers.push(window.setTimeout(() => { setWord(copy.answer.calmDone); done.current(); }, 30000));
    return () => timers.forEach(clearTimeout);
  }, [breathing, reduce, copy]);

  if (!breathing) {
    return (
      <>
        <h1 className="ask" data-say>{copy.answer.calmAsk}</h1>
        <div className="actions">
          <button className="btn" type="button" onClick={() => { setBreathing(true); if (reduce) onBreathe(); }}>{copy.answer.calmYes}</button>
          <button className="btn quiet" type="button" onClick={onNext}>{copy.answer.calmNo}</button>
        </div>
      </>
    );
  }
  return (
    <>
      {reduce ? (
        <p className="lede" data-say style={{ marginTop: "var(--s8)" }}>{copy.answer.calmStatic}</p>
      ) : (
        <div className="calm" aria-live="polite">
          <m.div
            className="breath"
            animate={{ scale: [0.7, 1.25, 1.25, 0.7] }}
            transition={{ duration: 10, times: [0, 0.4, 0.42, 1], repeat: 2, ease: "easeInOut" }}
          />
          <span className="calm-word">{word}</span>
        </div>
      )}
      <div className="actions">
        <button className="btn" type="button" onClick={onNext}>{calmed || reduce ? copy.app.next : copy.answer.calmNo}</button>
      </div>
    </>
  );
}
