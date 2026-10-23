// the quick look around: the companion moves along the tabs, lights each one, and says a few words.
// scripted from content/tour.json. tapping the lit spot or "next" moves on; skipping is always there.
import * as m from "motion/react-m";
import { useReducedMotion } from "motion/react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { content } from "../content/load";
import { buzz } from "../lib/feedback";
import { format } from "../lib/template";
import { store } from "../store/store";
import { useData } from "../store/useStore";
import { Sol } from "./Sol";
import { useCompanion, useLine } from "./kit";

const TAB_AT = { learn: 0, practice: 1, home: 2, book: 3, you: 4 } as const;
type Box = { x: number; y: number; w: number; h: number };

const rectOf = (el: Element | null | undefined): Box | null => {
  const r = el?.getBoundingClientRect();
  return r && r.width ? { x: r.left, y: r.top, w: r.width, h: r.height } : null;
};

export function Tour() {
  const tour = content().tour;
  const { tour: at } = useData();
  const comp = useCompanion();
  const line = useLine();
  const reduce = useReducedMotion();
  const next = useRef<HTMLButtonElement>(null);
  const [lit, setLit] = useState<{ tab: Box | null; spot: Box | null }>({ tab: null, spot: null });
  const i = Math.min(at?.i ?? 0, (tour?.steps.length ?? 1) - 1);
  const step = tour?.steps[i];

  // measure the tab and the spot to light; the page holds still while the tour is up
  const measure = useCallback(() => {
    if (!step) return;
    const tab = rectOf(document.querySelectorAll(".tabs a")[TAB_AT[step.tab]]);
    setLit({ tab, spot: step.tab === "home" ? rectOf(document.querySelector(".sky")) : tab });
  }, [step]);
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    document.body.style.overflow = "hidden";
    return () => void (document.body.style.overflow = "");
  }, []);
  useLayoutEffect(measure, [measure]);
  useEffect(() => {
    // home settles in for a moment when it first appears, so measure once more after it has
    const t = window.setTimeout(measure, 500);
    window.addEventListener("resize", measure);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("resize", measure);
    };
  }, [measure]);
  // each step takes focus, so screen readers hear it and keyboards start there
  useEffect(() => next.current?.focus({ preventScroll: true }), [i]);

  if (!tour || !step || !at || at.end) return null;
  const last = i === tour.steps.length - 1;
  const finish = (end: "done" | "skipped") => store.setTour({ i, end });
  const go = () => {
    buzz(4);
    if (last) finish("done");
    else store.setTour({ i: i + 1, end: "" });
  };
  const move = reduce ? { duration: 0 } : { type: "spring" as const, stiffness: 260, damping: 26 };
  const sol = lit.tab ? lit.tab.x + lit.tab.w / 2 - 28 : 0;

  return (
    <div className="tour" role="dialog" aria-label={tour.label}>
      {lit.spot ? (
        <m.button
          type="button" className="tour-spot" aria-hidden="true" tabIndex={-1} onClick={go}
          initial={false} animate={{ left: lit.spot.x - 4, top: lit.spot.y - 4, width: lit.spot.w + 8, height: lit.spot.h + 8 }} transition={move}
        />
      ) : null}
      {comp.on && lit.tab ? (
        <m.div className="tour-sol" aria-hidden="true" initial={false} animate={{ x: sol }} transition={move}>
          <Sol mood={step.tab === "home" ? "happy" : "curious"} />
        </m.div>
      ) : null}
      <m.div key={i} className="tour-card" initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <p className="small">{format(tour.count, { n: i + 1, total: tour.steps.length })}</p>
        <p className="tour-say" aria-live="polite">{line(step.say)}</p>
        <div className="tour-row">
          <button className="link" type="button" onClick={() => finish("skipped")}>{tour.skip}</button>
          <button className="btn" ref={next} type="button" onClick={go}>{last ? tour.done : tour.next}</button>
        </div>
      </m.div>
    </div>
  );
}
