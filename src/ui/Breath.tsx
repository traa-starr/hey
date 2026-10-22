// a slow breathing circle: 4 seconds in, 6 out, three times. a counted text guide under reduced motion.
import { useReducedMotion } from "motion/react";
import * as m from "motion/react-m";
import { useEffect, useRef, useState } from "react";
import { content } from "../content/load";

export function Breath({ onDone, breaths = 3 }: { onDone?: () => void; breaths?: number }) {
  const t = content().copy.breathe;
  const reduce = useReducedMotion();
  const [word, setWord] = useState(t.in);
  const done = useRef(onDone);
  useEffect(() => {
    done.current = onDone;
  });
  useEffect(() => {
    if (reduce) {
      done.current?.();
      return;
    }
    const timers: number[] = [];
    for (let i = 0; i < breaths; i++) {
      timers.push(window.setTimeout(() => setWord(t.in), i * 10000));
      timers.push(window.setTimeout(() => setWord(t.out), i * 10000 + 4000));
    }
    timers.push(window.setTimeout(() => { setWord(t.done); done.current?.(); }, breaths * 10000));
    return () => timers.forEach(clearTimeout);
  }, [reduce, breaths, t]);
  if (reduce) return <p className="card" data-say>{t.static}</p>;
  return (
    <div className="calm" aria-live="polite">
      <m.div className="breath" animate={{ scale: [0.65, 1.2, 1.2, 0.65] }} transition={{ duration: 10, times: [0, 0.4, 0.42, 1], repeat: breaths - 1, ease: "easeInOut" }} />
      <span className="calm-word">{word}</span>
    </div>
  );
}
