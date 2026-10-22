// a ten-second check-in, only when the person opens it: how loud is it today, and (optionally) which habit.
import { useState } from "react";
import { content } from "../content/load";
import { buzz, keptChime, stepChime } from "../lib/feedback";
import { go } from "../router";
import { store } from "../store/store";
import { FlowTop, HabitGlyph, LoudRange, Screen, SolSays, useCompanion } from "../ui/kit";
import { Sol } from "../ui/Sol";

export function CheckIn() {
  const c = content();
  const t = c.copy.checkin;
  const comp = useCompanion();
  const [loud, setLoud] = useState(0);
  const [habits, setHabits] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const leave = () => go({ name: "home" });
  return (
    <>
      <FlowTop onClose={leave} title="" />
      <Screen id={saved ? "checkin-done" : "checkin"}>
        {saved ? (
          <>
            {comp.on ? <div style={{ width: "9rem", height: "9rem", margin: "0 auto" }}><Sol mood="happy" /></div> : null}
            <SolSays mood="happy">{t.saved}</SolSays>
            <button className="btn" type="button" onClick={leave}>{c.copy.app.done}</button>
          </>
        ) : (
          <>
            {comp.on ? <div style={{ width: "8rem", height: "8rem", margin: "0 auto" }}><Sol mood="curious" /></div> : null}
            <h1 className="h2" style={{ textAlign: "center" }} data-say>{t.ask}</h1>
            <LoudRange value={loud} onChange={(n) => { if (n !== loud) { buzz(6); stepChime(n); } setLoud(n); }} />
            <p className="label">{t.which}</p>
            <div className="chips">
              {c.habits.map((h) => (
                <button key={h.id} type="button" className="chip" aria-pressed={habits.includes(h.id)} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
                  onClick={() => { buzz(4); setHabits((x) => (x.includes(h.id) ? x.filter((y) => y !== h.id) : [...x, h.id])); }}>
                  <HabitGlyph habit={h} size="sm" />{h.short}
                </button>
              ))}
            </div>
            <button className="btn" type="button" disabled={!loud} onClick={() => { store.log({ type: "checkin", loud, habits }); keptChime(); setSaved(true); }}>{t.save}</button>
          </>
        )}
      </Screen>
    </>
  );
}
