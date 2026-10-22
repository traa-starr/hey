// Shared pieces: the screen wrapper, bars, tabs, sol's messages, chips, habit glyphs, the loudness control.
import * as m from "motion/react-m";
import { useEffect, useRef, type ReactNode } from "react";
import { content } from "../content/load";
import type { Color, Habit } from "../content/schema";
import { buzz, stepChime } from "../lib/feedback";
import { readScreen, screenText, speak } from "../lib/speech";
import type { Piece } from "../lib/template";
import { format } from "../lib/template";
import { href, isMoving, type Route } from "../router";
import { useData } from "../store/useStore";
import { GLYPH, Icon } from "./icons";
import { Sol, type Mood } from "./Sol";

const ease = [0.2, 0.8, 0.2, 1] as const;
// the first screen after opening the app keeps the browser's own focus
let moved = false;

// one screen: settles in, reads itself aloud when asked to, and moves focus to its heading
export function Screen({ children, id }: { children: ReactNode; id: string }) {
  const { settings } = useData();
  const ref = useRef<HTMLDivElement>(null);
  const auto = settings.readAloud && settings.autoRead;
  useEffect(() => {
    if (auto && ref.current) speak(screenText(ref.current));
  }, [id, auto]);
  useEffect(() => {
    if (!moved) {
      moved = true;
      return;
    }
    const h = ref.current?.querySelector<HTMLElement>("h1, h2");
    if (h) {
      h.tabIndex = -1;
      h.focus({ preventScroll: true });
    }
  }, [id]);
  return (
    <m.div key={id} ref={ref} className="screen" initial={isMoving() ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease }}>
      {children}
    </m.div>
  );
}

function Speaker() {
  const { settings } = useData();
  if (!settings.readAloud) return null;
  return <button className="ibtn" type="button" onClick={readScreen} aria-label={content().copy.app.readAloud}>{Icon.speaker}</button>;
}

// close, an optional back, progress, and read aloud
export function FlowTop({ at, of, onClose, back, title }: { at?: number; of?: number; onClose: () => void; back?: () => void; title?: string }) {
  const copy = content().copy.app;
  const pct = of ? Math.round((Math.min((at ?? 0) + 1, of) / of) * 100) : 0;
  return (
    <div className="top">
      <button className="ibtn" type="button" onClick={onClose} aria-label={copy.close}>{Icon.close}</button>
      {back ? <button className="ibtn" type="button" onClick={back} aria-label={copy.back}>{Icon.back}</button> : null}
      {of ? (
        <div className="bar" role="progressbar" aria-label={copy.progress} aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}><span style={{ width: `${pct}%` }} /></div>
      ) : title ? (
        <h1 className="h2" style={{ flex: 1, fontSize: "1.35rem" }}>{title}</h1>
      ) : (
        <span style={{ flex: 1 }} />
      )}
      <Speaker />
    </div>
  );
}

export function PageTitle({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
      <h1 className="title" data-say>{children}</h1>
      <Speaker />
    </div>
  );
}

export type Tab = "home" | "learn" | "practice" | "you";
export function Tabs({ current }: { current: Tab }) {
  const t = content().copy.tabs;
  const tabs: { name: Tab; route: Route }[] = [
    { name: "home", route: { name: "home" } },
    { name: "learn", route: { name: "learn" } },
    { name: "practice", route: { name: "practice" } },
    { name: "you", route: { name: "you" } }
  ];
  return (
    <nav className="tabs" aria-label={t.label}>
      {tabs.map((x) => (
        <a key={x.name} href={href(x.route)} aria-current={current === x.name ? "page" : undefined} onClick={() => buzz(4)}>
          {Icon[x.name]}{t[x.name]}
        </a>
      ))}
    </nav>
  );
}

export function useCompanion() {
  const { companion } = useData();
  return { name: companion.name || content().copy.app.companionDefault, on: companion.on };
}

// a message from sol (or a plain bubble when the companion is turned off)
export function SolSays({ children, mood = "calm", say = true }: { children: ReactNode; mood?: Mood; say?: boolean }) {
  const { on } = useCompanion();
  return (
    <div className="msg">
      {on ? <span className="av"><Sol mood={mood} /></span> : null}
      <p className="bubble" data-say={say ? true : undefined}>{children}</p>
    </div>
  );
}

// fill {companion} and {name} in sol's lines
export function useLine() {
  const { name } = useData();
  const comp = useCompanion();
  return (s: string) => format(s, { companion: comp.name, name: name.toLowerCase() || content().copy.greeting.noName });
}

// morph: a habit's glyph grows into its page when tapped (each habit appears once per screen where this is set)
export function HabitGlyph({ habit, size, morph }: { habit: Pick<Habit, "glyph" | "color"> & { id?: string }; size?: "sm" | "lg"; morph?: boolean }) {
  return (
    <span
      className={`glyph${size ? ` ${size}` : ""}`} aria-hidden="true"
      style={{ background: `var(--${habit.color})`, ...(morph && habit.id ? { viewTransitionName: `habit-${habit.id}` } : {}) }}
    >{GLYPH[habit.glyph]}</span>
  );
}
export const colorVar = (c: Color, soft = false) => `var(--${c}${soft ? "-soft" : ""})`;

export function Ideas({ ideas, picked, onPick, label }: { ideas: string[]; picked?: string; onPick: (v: string) => void; label?: string }) {
  if (!ideas.length) return null;
  return (
    <div className="section">
      <span className="label">{label ?? content().copy.app.ideas}</span>
      <div className="chips">
        {ideas.map((x) => (
          <button key={x} type="button" className="chip idea" aria-pressed={picked === x} onClick={() => { buzz(4); onPick(x); }}>{x}</button>
        ))}
      </div>
    </div>
  );
}

export function Chips({ options, picked, onPick, label }: { options: string[]; picked?: string | string[]; onPick: (v: string, n: number) => void; label?: string }) {
  const on = (x: string) => (Array.isArray(picked) ? picked.includes(x) : picked === x);
  return (
    <div className="chips" role="group" aria-label={label}>
      {options.map((x, n) => (
        <button key={x} type="button" className="chip" aria-pressed={on(x)} onClick={() => { buzz(4); onPick(x, n); }}>{x}</button>
      ))}
    </div>
  );
}

// how loud the inner voice is: the sentence itself carries it
export function Loudness({ said, value, onChange, reply }: { said: string; value: number; onChange: (n: number) => void; reply?: string }) {
  const set = (n: number) => {
    if (n !== value) {
      buzz(6);
      stepChime(n);
    }
    onChange(n);
  };
  return (
    <>
      <div className="stage"><p className="said" style={{ ["--loud" as string]: value || 2 }} data-say>{said}</p></div>
      {reply ? <p className="reply-line" style={{ fontSize: "1.3rem" }} data-say>{reply}</p> : null}
      <LoudRange value={value} onChange={set} />
    </>
  );
}

export function LoudRange({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const l = content().copy.loudness;
  return (
    <div className="range">
      <p className="loudname" aria-hidden="true">{value ? l.names[value - 1] : l.unset}</p>
      <label className="sr" htmlFor="loudness">{l.label}</label>
      <input
        id="loudness" type="range" min={1} max={5} step={1} value={value || 3}
        aria-valuetext={value ? l.names[value - 1] : l.notSet}
        onChange={(e) => onChange(Number(e.target.value))}
        onPointerUp={(e) => onChange(Number((e.target as HTMLInputElement).value))}
        onKeyUp={(e) => { if (!value && (e.key === "Enter" || e.key === " ")) onChange(3); }}
      />
      <div className="ends" aria-hidden="true"><span>{l.names[0]}</span><span>{l.names[4]}</span></div>
    </div>
  );
}

// a sentence with its blanks showing while it's being written
export function Sentence({ parts, className = "reply-line" }: { parts: Piece[]; className?: string }) {
  return (
    <p className={className} data-say>
      {parts.map((p, n) =>
        p.slot ? (p.empty ? <span key={n} className="slot" aria-label="blank">&nbsp;</span> : <span key={n}>{p.text}</span>) : <span key={n}>{p.text}</span>
      )}
    </p>
  );
}
