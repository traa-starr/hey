// catch it: three taps when a habit speaks up. no typing. over time it shows when and where it talks.
import { useState } from "react";
import { content } from "../content/load";
import { buzz, keptChime, stepChime } from "../lib/feedback";
import { weights } from "../lib/voice";
import { go, href } from "../router";
import { store } from "../store/store";
import { useData } from "../store/useStore";
import { FlowTop, HabitGlyph, LoudRange, Screen, SolSays } from "../ui/kit";

export function Catch({ habit }: { habit?: string }) {
  const c = content();
  const t = c.copy.catch;
  const { logs } = useData();
  const [picked, setPicked] = useState<string | null | undefined>(habit && c.habits.some((h) => h.id === habit) ? habit : undefined);
  const [where, setWhere] = useState<string | null | undefined>(undefined);
  const [loud, setLoud] = useState(0);
  const [saved, setSaved] = useState(false);
  // the person's loudest habits come first
  const order = [...weights(c.habits, logs).map((w) => w.habit), ...c.habits].filter((h, n, all) => all.findIndex((x) => x.id === h.id) === n);
  const step = picked === undefined ? 0 : where === undefined ? 1 : saved ? 3 : 2;
  const leave = () => go({ name: "home" });

  return (
    <>
      <FlowTop at={step} of={4} onClose={leave} back={step > 0 && step < 3 ? () => (step === 1 ? setPicked(undefined) : setWhere(undefined)) : undefined} />
      <Screen id={`catch-${step}`}>
        {step === 0 ? (
          <>
            <h1 className="h2" data-say>{t.which}</h1>
            <div className="habit-grid">
              {order.map((h) => (
                <button key={h.id} type="button" className="habit-pick" onClick={() => { buzz(6); setPicked(h.id); }}>
                  <HabitGlyph habit={h} size="sm" />{h.short}
                </button>
              ))}
            </div>
            <button className="btn quiet" type="button" onClick={() => setPicked(null)}>{t.notSure}</button>
          </>
        ) : step === 1 ? (
          <>
            <h1 className="h2" data-say>{t.where}</h1>
            <div className="chips">
              {t.places.map((p) => <button key={p} type="button" className="chip" onClick={() => { buzz(6); setWhere(p); }}>{p}</button>)}
            </div>
            <button className="btn ghost" type="button" onClick={() => setWhere(null)}>{c.copy.app.skip}</button>
          </>
        ) : step === 2 ? (
          <>
            <h1 className="h2" data-say>{t.loud}</h1>
            <LoudRange value={loud} onChange={(n) => { if (n !== loud) { buzz(6); stepChime(n); } setLoud(n); }} />
            <button className="btn" type="button" disabled={!loud} onClick={() => {
              store.log({ type: "moment", habit: picked ?? null, where: where ?? null, loud });
              buzz(20);
              keptChime();
              setSaved(true);
            }}>{t.save}</button>
          </>
        ) : (
          <>
            <SolSays mood="happy">{t.saved}</SolSays>
            {picked ? (() => {
              const h = c.habits.find((x) => x.id === picked)!;
              return <a className="habit-row" href={href({ name: "habit", id: h.id })}><HabitGlyph habit={h} /><span><b>{h.name}</b><small>{h.job}</small></span></a>;
            })() : null}
            <div className="actions">
              <a className="btn" href={href({ name: "answer", habit: picked ?? undefined })}>{t.answerNow}</a>
              <button className="btn quiet" type="button" onClick={leave}>{t.done}</button>
            </div>
          </>
        )}
      </Screen>
    </>
  );
}
