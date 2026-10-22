// The feel check: two dials and an optional word. Every practice uses this one, so they all feel alike.
import { buzz } from "../../lib/feedback";
import { format } from "../../lib/template";
import { FEEL, type Feel } from "./feel";
import "./feel.css";

export function FeelCheck({ value, onChange, phase, id }: { value: Feel; onChange: (f: Feel) => void; phase: "before" | "after"; id: string }) {
  const t = FEEL.copy;
  const dial = (key: "light" | "open", label: string, ends: string[]) => (
    <div className="dial">
      <label htmlFor={`${id}-${key}`}>{label}</label>
      <input
        id={`${id}-${key}`} type="range" min={0} max={10} step={1} value={value[key]}
        aria-valuetext={format(t.of, { n: value[key], from: ends[0]!, to: ends[1]! })}
        onChange={(e) => { buzz(4); onChange({ ...value, [key]: Number(e.target.value) }); }}
      />
      <div className="ends" aria-hidden="true"><span>{ends[0]}</span><span>{ends[1]}</span></div>
    </div>
  );
  return (
    <fieldset className="feel">
      <legend className="h2" data-say>{phase === "before" ? t.askBefore : t.askAfter}</legend>
      {dial("light", t.light, t.lightEnds)}
      {dial("open", t.open, t.openEnds)}
      <p className="label">{t.word}</p>
      <div className="chips" role="group" aria-label={t.word}>
        {FEEL.words.map((w) => (
          <button key={w} type="button" className="chip" aria-pressed={value.word === w} onClick={() => { buzz(4); onChange({ ...value, word: value.word === w ? null : w }); }}>{w}</button>
        ))}
      </div>
    </fieldset>
  );
}
