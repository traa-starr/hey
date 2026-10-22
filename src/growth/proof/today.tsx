// Home's evening card: after 17:00, when an experiment is open, a quiet "what happened?". Never shows the thought itself.
// "not tonight" puts it away for the day, and an experiment left open never comes back as a nag.
import { useState } from "react";
import { buzz } from "../../lib/feedback";
import { dayKey } from "../../lib/time";
import { href } from "../../router";
import { useData } from "../../store/useStore";
import { useLine } from "../../ui/kit";
import type { TodayCard } from "../types";
import { eveningExperiment, experiments, isEvening } from "./data";
import { T } from "./proof";
import "./proof.css";

const KEY = "proof.notTonight";
const put = () => { try { sessionStorage.setItem(KEY, dayKey()); } catch { /* fine: the card just stays */ } };
const away = () => { try { return sessionStorage.getItem(KEY) === dayKey(); } catch { return false; } };

export function useToday(): TodayCard | null {
  const { grown, ready } = useData();
  const L = useLine();
  const [hidden, setHidden] = useState(away);
  const exp = ready && isEvening() ? eveningExperiment(experiments(grown)) : null;
  if (!exp || hidden) return null;
  return {
    priority: 40,
    node: (
      <div className="proof-card" data-testid="proof-evening">
        <p className="label">{T.eveningLabel}</p>
        <p>{L(T.eveningAsk)}</p>
        <a className="btn quiet" href={href({ name: "grow", feature: "proof", sub: `close/${exp.id}` })} onClick={() => buzz(6)}>{L(T.tell)}</a>
        <button className="link" type="button" onClick={() => { buzz(4); put(); setHidden(true); }}>{T.eveningNot}</button>
      </div>
    )
  };
}
