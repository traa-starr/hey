// Lessons as a conversation with sol: one bubble at a time, tap to reply. Progress is saved after every step.
import { useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { content } from "../content/load";
import type { Keep, Lesson, Step } from "../content/schema";
import { buzz, keptChime } from "../lib/feedback";
import { fill, finish, format, pieces } from "../lib/template";
import { go } from "../router";
import { store } from "../store/store";
import { useData } from "../store/useStore";
import { Breath } from "../ui/Breath";
import { timeOfDay } from "../lib/time";
import { Chips, FlowTop, Ideas, Screen, Sentence, SolSays, useCompanion, useLine } from "../ui/kit";
import { Sol } from "../ui/Sol";

// what the person did at each step
type Local = { pick?: number; picks?: string[]; text?: string; kept?: boolean; done?: boolean; at?: number; tot?: string[]; saved?: boolean; started?: boolean };

// keep something in the book; doing a lesson again never keeps the same line twice
export function keepEntry(keep: Keep, text: string, from: string, holdsSaid = false) {
  const kind = keep === "my-words" ? "voice" : "about";
  const sub = keep === "what-i-like" ? "like" : keep === "what-i-think" ? "think" : undefined;
  const t = text.trim();
  if (store.get().entries.some((e) => e.kind === kind && e.sub === sub && e.text === t)) return null;
  return store.add({ kind, ...(sub ? { sub } : {}), text: t, from, ...(holdsSaid ? { holdsSaid } : {}) });
}

// steps that need nothing from the person: a tap on continue moves on
const passive = (s: Step) => s.type === "say" || s.type === "scene" || s.type === "mine" || s.type === "list" || s.type === "takeaway";

export function Chat({ lessonKey, isWelcome }: { lessonKey: string; isWelcome?: boolean }) {
  const c = content();
  const copy = c.copy;
  const lesson: Lesson | undefined = isWelcome ? c.start ?? undefined : c.lessons[lessonKey];
  const { progress } = useData();
  const resume = progress[lessonKey];
  const [i, setI] = useState(() => Math.min(resume?.i ?? 0, (lesson?.steps.length ?? 1) - 1));
  const [locals, setLocals] = useState<Record<number, Local>>(() => (resume?.locals as Record<number, Local>) ?? {});
  const [finished, setFinished] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  const chat = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const first = useRef(true);

  useEffect(() => {
    if (lesson && !finished && (i > 0 || Object.keys(locals).length)) store.setProgress(lessonKey, { i, locals });
  }, [lessonKey, i, locals, lesson, finished]);
  useEffect(() => {
    end.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "end" });
  }, [i, locals, reduce]);
  // each new step takes focus, so screen readers hear it and keyboards start there
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const el = chat.current?.querySelector<HTMLElement>(`[data-step="${finished ? "end" : i}"]`);
    el?.focus({ preventScroll: true });
  }, [i, finished]);

  const pathOf = c.paths.find((p) => p.items.some((it) => it.key === lessonKey));
  const leave = () => {
    if (isWelcome) {
      // closing the welcome is skipping it; it can be replayed from settings
      store.setWelcomed();
      store.setProgress(lessonKey, null);
      go({ name: "home" }, true);
    } else go(pathOf ? { name: "path", id: pathOf.id } : { name: "learn" });
  };
  if (!lesson) {
    return (
      <>
        <FlowTop onClose={leave} />
        <Screen id="missing"><p className="empty">{copy.errors.missing}</p></Screen>
      </>
    );
  }

  const set = (n: number, patch: Partial<Local>) => setLocals((x) => ({ ...x, [n]: { ...(x[n] ?? {}), ...patch } }));
  const complete = () => {
    store.markDone(isWelcome ? "start/welcome" : lessonKey);
    store.setProgress(lessonKey, null);
    if (isWelcome) store.setWelcomed();
  };
  const next = () => {
    buzz(4);
    if (i < lesson.steps.length - 1) setI(i + 1);
    else {
      complete();
      keptChime();
      setFinished(true);
    }
  };

  const visible = lesson.steps.slice(0, i + 1);
  const step = lesson.steps[i]!;
  const L = locals[i] ?? {};
  const ready = passive(step) || !!L.done;
  const last = step.type === "end";

  return (
    <>
      <FlowTop at={i} of={lesson.steps.length} onClose={leave} />
      <Screen id={`lesson-${lessonKey}`}>
        <h1 className="sr">{lesson.title}</h1>
        {isWelcome ? <WelcomeSky /> : null}
        <div className="chat" ref={chat}>
          {visible.map((s, n) => (
            <div key={n} className="chat-step" data-step={n} tabIndex={-1} style={{ outline: "none" }}>
              <StepView step={s} L={locals[n] ?? {}} active={n === i && !finished} set={(p) => set(n, p)} from={lesson.title} />
            </div>
          ))}
          {finished ? (
            <>
              <div data-step="end" tabIndex={-1} style={{ outline: "none" }}><SolSays mood="happy">{copy.lesson.finished}</SolSays></div>
              <button className="btn continue" type="button" onClick={() => go(pathOf ? { name: "path", id: pathOf.id } : { name: "home" }, true)}>{copy.lesson.finish}</button>
            </>
          ) : last && step.type === "end" ? (
            <div className="actions continue">
              <button className="btn" type="button" onClick={() => { complete(); go(step.then === "check" ? { name: "check" } : { name: "home" }, true); }}>{step.button}</button>
              {step.later ? <button className="btn quiet" type="button" onClick={() => { complete(); go({ name: "home" }, true); }}>{step.later}</button> : null}
            </div>
          ) : ready ? (
            <button className="btn continue" type="button" onClick={next}>{copy.app.continue}</button>
          ) : null}
          <div ref={end} />
        </div>
      </Screen>
    </>
  );
}

function StepView({ step, L, active, set, from }: { step: Step; L: Local; active: boolean; set: (p: Partial<Local>) => void; from: string }) {
  const c = content();
  const t = c.copy.lesson;
  const line = useLine();
  const { name } = useData();
  switch (step.type) {
    case "say":
      return <SolSays mood={step.mood ?? "calm"}>{line(step.text)}</SolSays>;
    case "scene":
      return (
        <div className="card">
          {step.label ? <span className="label">{step.label}</span> : null}
          <p className="quote inner-quote" data-say>“{step.quote}”</p>
        </div>
      );
    case "mine":
      return <div className="card mine-card"><p className="quote" data-say>“{line(step.text)}”</p></div>;
    case "list":
      return (
        <>
          <SolSays>{step.text}</SolSays>
          <ul className="card list">{step.items.map((x) => <li key={x} data-say>{x}</li>)}</ul>
        </>
      );
    case "ask": {
      const picked = L.pick !== undefined ? step.options[L.pick] : undefined;
      return (
        <>
          <SolSays mood="curious">{step.text}</SolSays>
          {picked ? (
            <>
              <p className="me">{picked.label}</p>
              {picked.reply ? <SolSays>{picked.reply}</SolSays> : null}
            </>
          ) : active ? (
            <div className="replies" role="group" aria-label={step.text}>
              {step.options.map((o, n) => <button key={o.label} type="button" className="reply" onClick={() => { buzz(6); set({ pick: n, done: true }); }}>{o.label}</button>)}
            </div>
          ) : null}
        </>
      );
    }
    case "tryon":
      return (
        <>
          <SolSays>{line(step.prompt)}</SolSays>
          <div className="option-stack" role="group" aria-label={line(step.prompt)}>
            {step.lines.map((x, n) => (
              <button key={x} type="button" className="option" aria-pressed={L.pick === n} disabled={!active && L.pick !== n} onClick={() => { if (!active) return; buzz(6); set({ pick: n, done: true }); }}>{line(x)}</button>
            ))}
          </div>
          {L.done ? <SolSays mood="happy">{step.reply}</SolSays> : null}
        </>
      );
    case "pick": {
      const picks = L.picks ?? [];
      const max = step.max ?? step.options.length;
      return (
        <>
          <SolSays>{step.prompt}</SolSays>
          {L.done ? (
            <>
              <p className="me">{picks.length ? picks.join(", ") : t.pickedNone}</p>
              <SolSays mood="happy">{step.reply}</SolSays>
            </>
          ) : active ? (
            <>
              <Chips options={step.options} picked={picks} label={step.prompt} onPick={(x) => {
                set({ picks: picks.includes(x) ? picks.filter((p) => p !== x) : picks.length < max ? [...picks, x] : picks });
              }} />
              <button className="btn quiet" type="button" onClick={() => {
                if (step.keep && picks.length) {
                  picks.forEach((p) => keepEntry(step.keep!, step.as ? line(format(step.as, { x: p })) : p, from));
                  keptChime();
                }
                set({ done: true });
              }}>{picks.length ? (step.keep ? t.keepThese : c.copy.app.next) : c.copy.app.skip}</button>
            </>
          ) : null}
        </>
      );
    }
    case "write": {
      const text = L.text ?? "";
      const result = finish(fill(step.template.replace("{name}", name.toLowerCase() || c.copy.greeting.noName), { x: text }));
      return (
        <>
          <SolSays>{line(step.prompt)}</SolSays>
          {L.done ? (
            L.kept ? <><p className="me">{result}</p><SolSays mood="happy">{t.kept}</SolSays></> : null
          ) : active ? (
            <div className="card">
              <Sentence parts={pieces(line(step.template), { x: text })} />
              <label className="sr" htmlFor="write-in">{t.writeOwn}</label>
              <input id="write-in" className="field" autoComplete="off" placeholder={step.placeholder ?? t.writeOwn} value={text} onChange={(e) => set({ text: e.target.value })} />
              <Ideas ideas={step.ideas} picked={text} onPick={(v) => set({ text: v })} />
              <div className="actions">
                <button className="btn" type="button" disabled={!text.trim()} onClick={() => {
                  if (step.keep) keepEntry(step.keep, line(result), from, !!step.said);
                  buzz(20);
                  keptChime();
                  set({ kept: true, done: true });
                }}>{t.keep}</button>
                <button className="btn ghost" type="button" onClick={() => set({ done: true })}>{c.copy.app.skip}</button>
              </div>
            </div>
          ) : null}
        </>
      );
    }
    case "spot": {
      // every reading is welcome: sol offers one, it never grades the pick
      return (
        <>
          <div className="card">
            <p>{step.scene}</p>
            <p className="quote inner-quote" data-say>“{step.quote}”</p>
          </div>
          <SolSays mood="curious">{t.whichHabit}</SolSays>
          <div className="option-stack" role="group" aria-label={t.whichHabit}>
            {step.options.map((o, n) => (
              <button key={o} type="button" className="option" aria-pressed={L.pick === n}
                disabled={!active && L.pick !== n} style={{ fontFamily: "var(--display)", fontStyle: "normal" }}
                onClick={() => { if (!active || L.done) return; buzz(8); set({ pick: n, done: true }); }}>{o}</button>
            ))}
          </div>
          {L.done ? <SolSays mood="happy">{t.spotReply} {step.explain}</SolSays> : null}
        </>
      );
    }
    case "tot": {
      const at = L.at ?? 0;
      const picks = L.tot ?? [];
      if (L.done || at >= step.pairs.length) {
        const kept = picks.filter(Boolean);
        return (
          <>
            <SolSays>{step.prompt}</SolSays>
            <p className="me">{kept.length ? kept.join(" · ") : t.pickedNone}</p>
          </>
        );
      }
      const [a, b] = step.pairs[at]!;
      const choose = (v: "a" | "b" | "both" | "neither") => {
        if (!active) return;
        buzz(8);
        const pick = v === "a" ? a : v === "b" ? b : v === "both" ? `${a} and ${b}` : "";
        if (pick) keepEntry(step.keep, format(t.pickAs, { x: pick }), from);
        const tot = [...picks, pick];
        set({ at: at + 1, tot, done: at + 1 >= step.pairs.length });
      };
      return (
        <>
          <SolSays>{step.prompt}</SolSays>
          <div className="card">
            <span className="label">{at + 1} / {step.pairs.length}</span>
            <div className="grid2">
              <button type="button" className="option" style={{ minHeight: "6rem", textAlign: "center" }} onClick={() => choose("a")}>{a}</button>
              <button type="button" className="option" style={{ minHeight: "6rem", textAlign: "center" }} onClick={() => choose("b")}>{b}</button>
            </div>
            <div className="chips" style={{ justifyContent: "center" }}>
              <button type="button" className="chip" onClick={() => choose("both")}>{t.both}</button>
              <button type="button" className="chip" onClick={() => choose("neither")}>{t.neither}</button>
            </div>
          </div>
        </>
      );
    }
    case "takeaway":
      return (
        <div className="takeaway">
          <span className="label" style={{ color: "#fff", opacity: 0.85 }}>{t.takeaway}</span>
          <b data-say>{step.text}</b>
          <span className="src">
            {step.source.url ? <a href={step.source.url} target="_blank" rel="noopener noreferrer">{step.source.label}</a> : step.source.label}
            {step.evidence ? ` · ${t.evidence}: ${step.evidence}` : ""}
          </span>
          {L.saved ? <span className="src" role="status">{t.savedTakeaway}</span> : (
            <button className="btn" type="button" onClick={() => { store.add({ kind: "keeper", text: step.text, from }); buzz(12); keptChime(); set({ saved: true, done: true }); }}>{t.saveTakeaway}</button>
          )}
        </div>
      );
    case "experiment":
      return (
        <>
          <div className="experiment">
            <span className="label">{t.experiment}</span>
            <b data-say>{step.text}</b>
          </div>
          {L.pick !== undefined ? (
            <>
              <p className="me">{L.pick === 0 ? t.tryIt : t.notToday}</p>
              <SolSays mood={L.pick === 0 ? "happy" : "calm"}>{L.pick === 0 ? t.tryReply : t.notReply}</SolSays>
            </>
          ) : active ? (
            <div className="replies">
              <button type="button" className="reply" onClick={() => set({ pick: 0, done: true })}>{t.tryIt}</button>
              <button type="button" className="reply" onClick={() => set({ pick: 1, done: true })}>{t.notToday}</button>
            </div>
          ) : null}
        </>
      );
    case "breathe":
      if (!active) return null;
      if (!L.started) {
        return (
          <>
            <SolSays mood="calm">{t.breatheAsk}</SolSays>
            {!L.done ? (
              <div className="replies">
                <button type="button" className="reply" onClick={() => set({ started: true })}>{t.breatheYes}</button>
                <button type="button" className="reply" onClick={() => set({ done: true })}>{c.copy.app.skip}</button>
              </div>
            ) : null}
          </>
        );
      }
      return <Breath onDone={() => set({ done: true })} />;
    case "name": {
      const value = L.text ?? name;
      return (
        <>
          <SolSays mood="curious">{step.text}</SolSays>
          {L.done ? (
            L.kept ? <><p className="me">{value}</p><SolSays mood="happy">{format(t.nameHello, { name: value.toLowerCase() })}</SolSays></> : null
          ) : active ? (
            <div className="card">
              <label className="sr" htmlFor="name-in">{step.text}</label>
              <input id="name-in" className="field" autoComplete="nickname" placeholder={step.placeholder} value={value} onChange={(e) => set({ text: e.target.value })} />
              <div className="actions">
                <button className="btn" type="button" disabled={!value.trim()} onClick={() => { store.setName(value); set({ text: value.trim(), kept: true, done: true }); }}>{t.thatsMe}</button>
                <button className="btn ghost" type="button" onClick={() => set({ done: true })}>{c.copy.app.skip}</button>
              </div>
            </div>
          ) : null}
        </>
      );
    }
    case "end":
      return <SolSays mood="happy">{line(step.text)}</SolSays>;
  }
}

// the first thing anyone sees: the sky at this hour, sol, and the name
function WelcomeSky() {
  const { on } = useCompanion();
  const [tod] = useState(() => timeOfDay());
  return (
    <div className={`welcome-sky ${tod}`} style={{ background: `var(--sky-${tod})` }} aria-hidden="true">
      {on ? <div className="welcome-sol"><Sol mood={tod === "night" ? "sleepy" : "happy"} /></div> : null}
      <p className="welcome-name">{content().copy.app.name}</p>
    </div>
  );
}
