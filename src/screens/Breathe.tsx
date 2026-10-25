// one minute, slow, with dawn.
import { useState } from "react";
import { content } from "../content/load";
import { go } from "../router";
import { Breath } from "../ui/Breath";
import { FlowTop, Screen, DawnSays, useLine } from "../ui/kit";

export function Breathe() {
  const t = content().copy.breathe;
  const line = useLine();
  const [run, setRun] = useState(0);
  const [done, setDone] = useState(false);
  return (
    <>
      <FlowTop onClose={() => go({ name: "practice" })} title={t.title} />
      <Screen id="breathe">
        {run === 0 ? (
          <>
            <DawnSays mood="calm">{line(t.sub)}</DawnSays>
            <button className="btn" type="button" onClick={() => setRun(1)}>{t.start}</button>
          </>
        ) : (
          <>
            <Breath key={run} breaths={6} onDone={() => setDone(true)} />
            {done ? <button className="btn quiet" type="button" onClick={() => { setDone(false); setRun(run + 1); }}>{t.again}</button> : null}
          </>
        )}
      </Screen>
    </>
  );
}
