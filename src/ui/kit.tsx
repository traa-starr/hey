// Shared pieces: the screen wrapper, bars, idea chips, the loudness control, and a sentence being written.
import { motion } from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";
import { content } from "../content/load";
import { buzz, stepChime } from "../lib/feedback";
import { readScreen, screenText, speak } from "../lib/speech";
import type { Piece } from "../lib/template";
import { go, href, type Route } from "../router";
import { useData } from "../store/useStore";

const ease = [0.2, 0.7, 0.2, 1] as const;

// one screen: settles in, and reads itself aloud when the person asked for that
export function Screen({ children, id, label }: { children: ReactNode; id: string; label?: string }) {
  const { settings } = useData();
  const ref = useRef<HTMLDivElement>(null);
  const auto = settings.readAloud && settings.autoRead;
  useEffect(() => {
    if (auto && ref.current) speak(screenText(ref.current));
  }, [id, auto]);
  return (
    <motion.div
      key={id}
      ref={ref}
      className="screen"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease }}
      aria-label={label}
    >
      {children}
    </motion.div>
  );
}

export const Icon = {
  close: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
  ),
  speaker: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4h4l5 4V6L8 10z" /><path d="M16.5 9a4 4 0 0 1 0 6M19 6.5a7.5 7.5 0 0 1 0 11" /></svg>
  ),
  back: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
  )
};

function Speaker() {
  const { settings } = useData();
  const copy = content().copy;
  if (!settings.readAloud) return <span style={{ width: "2.75rem" }} aria-hidden="true" />;
  return (
    <button className="ibtn" type="button" onClick={readScreen} aria-label={copy.app.readAloud}>
      {Icon.speaker}
    </button>
  );
}

export function TopBar() {
  return (
    <div className="top">
      <span className="mark" aria-hidden="true">{content().copy.app.name}</span>
      <Speaker />
    </div>
  );
}

export function FlowBar({ at, of, onClose, back }: { at: number; of: number; onClose: () => void; back?: () => void }) {
  const copy = content().copy;
  const pct = Math.round((Math.min(at + 1, of) / of) * 100);
  return (
    <div className="top">
      {back ? (
        <button className="ibtn" type="button" onClick={back} aria-label="back">{Icon.back}</button>
      ) : (
        <button className="ibtn" type="button" onClick={onClose} aria-label={copy.app.close}>{Icon.close}</button>
      )}
      <div className="progress" role="progressbar" aria-label={copy.app.progress} aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
        <span style={{ width: `${pct}%` }} />
      </div>
      <Speaker />
    </div>
  );
}

export function Nav({ current }: { current: "today" | "explore" | "book" }) {
  const t = content().copy.tabs;
  const tabs: { name: typeof current; label: string; route: Route }[] = [
    { name: "today", label: t.today, route: { name: "today" } },
    { name: "explore", label: t.explore, route: { name: "explore" } },
    { name: "book", label: t.book, route: { name: "book" } }
  ];
  return (
    <nav className="nav" aria-label={t.label}>
      {tabs.map((x) => (
        <a key={x.name} href={href(x.route)} aria-current={current === x.name ? "page" : undefined} onClick={() => buzz(4)}>
          {x.label}
        </a>
      ))}
    </nav>
  );
}

export function Ideas({ ideas, picked, onPick, label }: { ideas: string[]; picked?: string; onPick: (v: string) => void; label?: string }) {
  if (!ideas.length) return null;
  return (
    <div className="ideas">
      <span className="label">{label ?? content().copy.app.ideas}</span>
      <div className="chips">
        {ideas.map((x) => (
          <button key={x} type="button" className="chip idea" aria-pressed={picked === x} onClick={() => { buzz(4); onPick(x); }}>
            {x}
          </button>
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
        <button key={x} type="button" className="chip" aria-pressed={on(x)} onClick={() => { buzz(4); onPick(x, n); }}>
          {x}
        </button>
      ))}
    </div>
  );
}

// how loud the inner voice is: the sentence itself carries it
export function Loudness({ said, value, onChange, reply }: { said: string; value: number; onChange: (n: number) => void; reply?: string }) {
  const l = content().copy.loudness;
  const set = (n: number) => {
    if (n !== value) {
      buzz(6);
      stepChime(n);
    }
    onChange(n);
  };
  return (
    <>
      <div className="stage">
        <p className="said" style={{ ["--loud" as string]: value || 2 }} data-say>{said}</p>
      </div>
      {reply ? <p className="reply sm" data-say>{reply}</p> : null}
      <div className="range">
        <p className="loudname" aria-hidden="true">{value ? l.names[value - 1] : l.unset}</p>
        <label className="sr" htmlFor="loudness">{l.label}</label>
        <input
          id="loudness"
          type="range"
          min={1}
          max={5}
          step={1}
          value={value || 3}
          aria-valuetext={value ? l.names[value - 1] : l.notSet}
          onChange={(e) => set(Number(e.target.value))}
          onPointerUp={(e) => set(Number((e.target as HTMLInputElement).value))}
          onKeyUp={(e) => { if (!value && (e.key === "Enter" || e.key === " ")) set(3); }}
        />
        <div className="ends" aria-hidden="true"><span>{l.names[0]}</span><span>{l.names[4]}</span></div>
      </div>
    </>
  );
}

// a sentence with its blanks showing while it's being written
export function Sentence({ parts, className = "reply" }: { parts: Piece[]; className?: string }) {
  return (
    <p className={className} aria-live="polite" data-say>
      {parts.map((p, n) =>
        p.slot ? (
          p.empty ? <span key={n} className="slot" aria-label="blank">&nbsp;</span> : <span key={n} className="filled">{p.text}</span>
        ) : (
          <span key={n}>{p.text}</span>
        )
      )}
    </p>
  );
}

export const goTo = (r: Route) => () => go(r);
