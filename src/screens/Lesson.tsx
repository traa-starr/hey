// Plays any lesson file, one step per screen. Progress is saved after every step, so a set resumes.
import { useEffect, useState } from "react";
import { content } from "../content/load";
import type { Keep, Lesson as LessonT, Step, Visual } from "../content/schema";
import { buzz, keptChime } from "../lib/feedback";
import { fill, finish, format, pieces } from "../lib/template";
import { go } from "../router";
import { store } from "../store/store";
import { useData } from "../store/useStore";
import { Chips, FlowBar, Ideas, Screen, Sentence } from "../ui/kit";

type Local = {
  pick?: number;
  picks?: number[];
  at?: number;
  tot?: string[];
  vals?: Record<string, string>;
  custom?: Record<string, boolean>;
  text?: string;
  kept?: boolean;
  more?: boolean;
};

function keepEntry(keep: Keep, text: string, from: string) {
  if (keep === "my-words") return store.add({ kind: "voice", text, from });
  return store.add({ kind: "about", sub: keep === "what-i-like" ? "like" : "think", text, from });
}

export function Lesson({ path, isWelcome }: { path: string; isWelcome?: boolean }) {
  const c = content();
  const lesson: LessonT | undefined = c.lessons[path];
  const { progress } = useData();
  const resume = progress[path];
  const [i, setI] = useState(resume?.i ?? 0);
  // each step keeps its own answers, so going back never repeats what was already kept
  const [locals, setLocals] = useState<Record<number, Local>>((resume?.locals as Record<number, Local>) ?? {});

  useEffect(() => {
    if (lesson && (i > 0 || Object.keys(locals).length)) store.setProgress(path, { i, locals });
  }, [path, i, locals, lesson]);

  const leave = () => {
    // closing the welcome is skipping it; it can be replayed from your book
    if (isWelcome) {
      store.setWelcomed();
      store.setProgress(path, null);
      go({ name: "today" }, true);
    } else go({ name: "explore" });
  };
  if (!lesson) {
    return (
      <>
        <FlowBar at={0} of={1} onClose={leave} />
        <Screen id="missing"><p className="lede">{c.copy.errors.missing}</p></Screen>
      </>
    );
  }
  const step = lesson.steps[Math.min(i, lesson.steps.length - 1)]!;
  const L = locals[i] ?? {};
  const set = (patch: Partial<Local>) => setLocals((x) => ({ ...x, [i]: { ...(x[i] ?? {}), ...patch } }));

  const finishLesson = () => {
    store.markTried(lesson.id);
    store.setProgress(path, null);
    if (isWelcome) store.setWelcomed();
  };
  const next = () => {
    window.scrollTo(0, 0);
    if (i < lesson.steps.length - 1) setI(i + 1);
    else {
      finishLesson();
      if (step.type === "close" && step.then === "answer") go({ name: "answer" }, true);
      else go({ name: isWelcome ? "today" : "explore" }, true);
    }
  };
  const later = () => {
    finishLesson();
    go({ name: "today" }, true);
  };

  return (
    <>
      <FlowBar at={i} of={lesson.steps.length} onClose={leave} back={i > 0 ? () => setI(i - 1) : undefined} />
      <Screen id={`${path}-${i}`}>
        <StepView step={step} L={L} set={set} next={next} later={later} from={lesson.title} />
      </Screen>
    </>
  );
}

function NextButton({ label, onClick, disabled }: { label?: string; onClick: () => void; disabled?: boolean }) {
  return (
    <div className="actions">
      <button className="btn" type="button" onClick={onClick} disabled={disabled}>{label ?? content().copy.app.next}</button>
    </div>
  );
}

function StepView({ step, L, set, next, later, from }: {
  step: Step; L: Local; set: (p: Partial<Local>) => void; next: () => void; later: () => void; from: string;
}) {
  const copy = content().copy;
  const { name } = useData();
  switch (step.type) {
    case "welcome":
      return (
        <>
          {step.visual ? <Scene v={step.visual} /> : null}
          <h1 className="huge" data-say>{step.text}</h1>
          <NextButton label={step.button} onClick={next} />
        </>
      );
    case "show":
      return (
        <>
          {step.visual ? <Scene v={step.visual} /> : null}
          <h1 className="ask" data-say>{step.text}</h1>
          {step.more ? (
            L.more ? (
              <div className="more">
                <p data-say>{step.more}</p>
                {step.source ? (
                  <p className="source">{step.source.url ? <a href={step.source.url} target="_blank" rel="noopener noreferrer">{step.source.label}</a> : step.source.label}</p>
                ) : null}
              </div>
            ) : (
              <button className="link" type="button" aria-expanded={false} onClick={() => set({ more: true })}>{copy.app.tellMore}</button>
            )
          ) : null}
          <NextButton label={step.button} onClick={next} />
        </>
      );
    case "promises":
      return (
        <>
          <h1 className="ask" data-say>{step.prompt}</h1>
          <div className="stack">{step.items.map((x) => <p className="promise" key={x} data-say>{x}</p>)}</div>
          <NextButton label={step.button} onClick={next} />
        </>
      );
    case "close":
      return (
        <>
          <h1 className="ask" style={{ marginTop: "var(--s8)" }} data-say>{step.text}</h1>
          <div className="actions">
            <button className="btn" type="button" onClick={next}>{step.button ?? copy.app.done}</button>
            {step.later ? <button className="btn quiet" type="button" onClick={later}>{step.later}</button> : null}
          </div>
        </>
      );
    case "try-on": {
      const picked = L.pick;
      return (
        <>
          <h1 className="ask" data-say>{step.prompt}</h1>
          {step.answers ? (
            <>
              <div className="stack">{step.options.map((o) => <p key={o} className="choice voice-line static" data-say>{o}</p>)}</div>
              <p className="lede" style={{ fontSize: "1.3rem" }} data-say>{step.question}</p>
              <Chips options={step.answers} picked={picked !== undefined ? step.answers[picked] : undefined} onPick={(_, n) => set({ pick: n })} label={step.question} />
            </>
          ) : (
            <>
              <p className="small" data-say>{step.question}</p>
              <div className="stack" role="group" aria-label={step.question}>
                {step.options.map((o, n) => (
                  <button key={o} type="button" className="choice voice-line" aria-pressed={picked === n} onClick={() => { buzz(4); set({ pick: n }); }}>{o}</button>
                ))}
              </div>
            </>
          )}
          {picked !== undefined ? (<><p className="note" role="status">{step.reply}</p><NextButton onClick={next} /></>) : null}
        </>
      );
    }
    case "this-or-that": {
      const at = L.at ?? 0;
      const picks = L.tot ?? [];
      if (at >= step.pairs.length) {
        const kept = picks.filter(Boolean);
        return (
          <>
            <h1 className="ask" data-say>{copy.lesson.picks}</h1>
            {kept.length ? <div className="chips">{kept.map((p) => <span className="chip" key={p}>{p}</span>)}</div> : <p className="empty">{copy.lesson.noPicks}</p>}
            {kept.length ? <p className="note" role="status">{copy.lesson.kept}</p> : null}
            <NextButton onClick={next} />
          </>
        );
      }
      const [a, b] = step.pairs[at]!;
      const choose = (v: string) => {
        buzz(8);
        let pick = "";
        if (v === "a") pick = a;
        else if (v === "b") pick = b;
        else if (v === copy.lesson.both) pick = `${a} and ${b}`;
        if (pick) keepEntry(step.keep, format(copy.lesson.pickAs, { x: pick }), from);
        set({ at: at + 1, tot: [...picks, pick] });
      };
      return (
        <>
          <p className="small" data-say>{step.prompt}</p>
          <span className="count">{format(copy.lesson.ofTotal, { n: at + 1, total: step.pairs.length })}</span>
          <div className="tot">
            <button type="button" className="choice" onClick={() => choose("a")} data-say>{a}</button>
            <button type="button" className="choice" onClick={() => choose("b")} data-say>{b}</button>
          </div>
          <div className="chips">{(step.extras ?? []).map((x) => <button key={x} type="button" className="chip" onClick={() => choose(x)}>{x}</button>)}</div>
        </>
      );
    }
    case "build": {
      const vals = L.vals ?? {};
      const custom = L.custom ?? {};
      const ready = step.parts.every((p) => (vals[p.key] ?? "").trim());
      const result = finish(fill(step.template, vals));
      if (L.kept) {
        return (
          <>
            <p className="reply" data-say>{result}</p>
            <p className="note" role="status">{step.reply ?? copy.lesson.kept}</p>
            <NextButton onClick={next} />
          </>
        );
      }
      return (
        <>
          <h1 className="lede" data-say>{step.prompt}</h1>
          <Sentence parts={pieces(step.template, vals)} />
          {step.parts.map((p) => (
            <div className="fieldset" key={p.key}>
              <label className="label" htmlFor={`part-${p.key}`} id={`lbl-${p.key}`}>{p.label}</label>
              {p.chips ? (
                <Chips options={p.chips} picked={custom[p.key] ? undefined : vals[p.key]} label={p.label}
                  onPick={(v) => set({ vals: { ...vals, [p.key]: v }, custom: { ...custom, [p.key]: false } })} />
              ) : null}
              {p.input || p.allowCustom ? (
                <input
                  id={`part-${p.key}`} className="field voice" autoComplete="off"
                  placeholder={p.placeholder ?? copy.lesson.orYourOwn}
                  value={p.input ? vals[p.key] ?? "" : custom[p.key] ? vals[p.key] ?? "" : ""}
                  onChange={(e) => set({ vals: { ...vals, [p.key]: e.target.value }, custom: { ...custom, [p.key]: !p.input && !!e.target.value } })}
                />
              ) : null}
              {p.input && p.ideas ? <Ideas ideas={p.ideas} picked={vals[p.key]} onPick={(v) => set({ vals: { ...vals, [p.key]: v } })} /> : null}
            </div>
          ))}
          <div className="actions">
            <button className="btn" type="button" disabled={!ready} onClick={() => { keepEntry(step.keep, result, from); buzz(20); keptChime(); set({ kept: true }); }}>{copy.lesson.keep}</button>
            <button className="btn quiet" type="button" onClick={next}>{copy.app.skip}</button>
          </div>
        </>
      );
    }
    case "write": {
      const chips = L.picks ?? [];
      const text = L.text ?? (step.keep === "name" ? name : "");
      if (L.kept) {
        return (
          <>
            <p className="note" role="status" style={{ marginTop: "var(--s8)" }}>
              {step.keep === "name" ? format(copy.lesson.nameHello, { name: text.trim().toLowerCase() }) : copy.lesson.kept}
            </p>
            <NextButton onClick={next} />
          </>
        );
      }
      const canKeep = chips.length > 0 || !!text.trim();
      return (
        <>
          <h1 className="ask" data-say>{step.prompt}</h1>
          {step.chips ? (
            <Chips options={step.chips} picked={chips.map((n) => step.chips![n]!)} label={step.prompt}
              onPick={(_, n) => set({ picks: chips.includes(n) ? chips.filter((x) => x !== n) : [...chips, n] })} />
          ) : null}
          {step.input ? (
            <div className="fieldset">
              <label className="label" htmlFor="write-in">{step.input.label}</label>
              <input id="write-in" className="field voice" autoComplete={step.keep === "name" ? "nickname" : "off"}
                placeholder={step.input.placeholder} value={text}
                onChange={(e) => set({ text: e.target.value })} />
            </div>
          ) : null}
          <div className="actions">
            <button className="btn" type="button" disabled={!canKeep} onClick={() => {
              if (step.keep === "name") {
                const n = text.trim();
                store.setName(n);
                set({ kept: true, text: n });
              } else {
                chips.forEach((n) => keepEntry(step.keep as Keep, step.chips![n]!, from));
                if (text.trim()) keepEntry(step.keep as Keep, text, from);
                keptChime();
                set({ kept: true });
              }
            }}>{step.keep === "name" ? copy.lesson.thatsMe : copy.lesson.keep}</button>
            <button className="btn quiet" type="button" onClick={next}>{step.skip ?? copy.app.skip}</button>
          </div>
        </>
      );
    }
    case "pocket": {
      const chips = L.picks ?? [];
      return (
        <>
          <h1 className="ask" data-say>{step.prompt}</h1>
          <Chips options={step.phrases} picked={chips.map((n) => step.phrases[n]!)} label={step.prompt}
            onPick={(_, n) => set({ picks: chips.includes(n) ? chips.filter((x) => x !== n) : [...chips, n] })} />
          <NextButton label={chips.length ? copy.lesson.keepThese : copy.app.next} onClick={() => {
            chips.forEach((n) => keepEntry(step.keep, step.phrases[n]!, from));
            if (chips.length) keptChime();
            next();
          }} />
        </>
      );
    }
    case "try":
      return (
        <>
          <h1 className="ask" data-say>{step.prompt}</h1>
          <div className="stack" role="group" aria-label={step.prompt}>
            {step.options.map((o, n) => (
              <button key={o} type="button" className="choice" aria-pressed={L.pick === n} onClick={() => { buzz(4); set({ pick: n }); }}>{o}</button>
            ))}
          </div>
          {L.pick !== undefined ? (<><p className="note" role="status">{copy.lesson.tryReply}</p><NextButton onClick={next} /></>) : (
            <div className="actions"><button className="btn quiet" type="button" onClick={next}>{step.skip ?? copy.app.skip}</button></div>
          )}
        </>
      );
  }
}

// typographic scenes for the welcome: the two voices, shown rather than explained
function Scene({ v }: { v: Visual }) {
  return (
    <div className="visual" aria-hidden="true">
      {v.inner ? (
        v.loud ? <p className="said" style={{ ["--loud" as string]: v.loud }}>{v.inner}</p> : <p className="inner" style={{ opacity: v.mine ? 0.6 : 1 }}>{v.inner}</p>
      ) : null}
      {v.mine ? <p className="mine">{v.mine}</p> : null}
    </div>
  );
}
