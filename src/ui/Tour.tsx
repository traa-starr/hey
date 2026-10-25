// the quick look around: each tab in turn. the app shows the real page, dawn lights one part of it
// and says a few words. scripted from content/tour.json. tapping the lit spot or "next" moves on; skipping is always there.
import * as m from "motion/react-m";
import { useReducedMotion } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { content } from "../content/load";
import type { Tour as TourContent } from "../content/schema";
import { buzz } from "../lib/feedback";
import { format } from "../lib/template";
import { go as goTo, parse, type Route } from "../router";
import { store } from "../store/store";
import { useData } from "../store/useStore";
import { Dawn } from "./Dawn";
import { useCompanion, useLine } from "./kit";

type Step = TourContent["steps"][number];
type Box = { x: number; y: number; w: number; h: number };

const TAB_AT = { learn: 0, practice: 1, home: 2, book: 3, you: 4 } as const;
const ROUTE: Record<NonNullable<Step["tab"]>, Route> = { home: { name: "home" }, learn: { name: "learn" }, practice: { name: "practice" }, book: { name: "book" }, you: { name: "you" } };
// what each `show` lights on the page (the tab itself is found by its place in the tab bar)
const SPOT = {
  sky: ".sky", next: ".next", shortcuts: ".grid2", paths: ".path", bars: ".path .steps", tiles: ".tile", ways: ".way",
  cover: ".cover", pages: ".grid3", shelf: ".shelf", map: "section[aria-labelledby='map-h']", settings: "a[href$='settings']"
} as const;

const find = (step: Step): Element | null => {
  if (!step.show) return null;
  if (step.show === "tab") return step.tab ? document.querySelectorAll(".tabs a")[TAB_AT[step.tab]] ?? null : null;
  return document.querySelector(`main ${SPOT[step.show]}`);
};
// a lit spot stays on screen, above the tab bar's own space
const rectOf = (el: Element | null): Box | null => {
  const r = el?.getBoundingClientRect();
  if (!r || !r.width) return null;
  const top = Math.max(r.top, 8);
  const bottom = Math.min(r.bottom, window.innerHeight - 8);
  return bottom > top ? { x: r.left, y: top, w: r.width, h: bottom - top } : null;
};

export function Tour() {
  const tour = content().tour;
  const { tour: at } = useData();
  const comp = useCompanion();
  const line = useLine();
  const reduce = useReducedMotion();
  const next = useRef<HTMLButtonElement>(null);
  const [, again] = useState(0);
  const i = Math.min(at?.i ?? 0, (tour?.steps.length ?? 1) - 1);
  const step = tour?.steps[i];

  // the page holds still while the tour is up
  useLayoutEffect(() => {
    document.body.style.overflow = "hidden";
    return () => void (document.body.style.overflow = "");
  }, []);
  // each step shows its own page, brings the lit part into view, and is measured as it renders. a page that loads late
  // is looked for again a few times.
  useEffect(() => {
    if (!step) return;
    if (step.tab && parse(window.location.hash).name !== step.tab) goTo(ROUTE[step.tab], true);
    let placed = !step.show || step.show === "tab";
    const look = () => {
      if (!placed) {
        const el = find(step);
        if (el) {
          placed = true;
          el.scrollIntoView({ block: "center" });
        }
      }
      again((n) => n + 1);
    };
    const frame = requestAnimationFrame(look);
    const waits = [150, 500, 1200].map((ms) => window.setTimeout(look, ms));
    window.addEventListener("resize", look);
    return () => {
      cancelAnimationFrame(frame);
      waits.forEach(window.clearTimeout);
      window.removeEventListener("resize", look);
    };
  }, [step]);
  // each step takes focus, so screen readers hear it and keyboards start there
  useEffect(() => next.current?.focus({ preventScroll: true }), [i]);

  if (!tour || !step || !at || at.end) return null;
  const spot = rectOf(find(step));
  const last = i === tour.steps.length - 1;
  const finish = (end: "done" | "skipped") => store.setTour({ i, end });
  const advance = () => {
    buzz(4);
    if (last) finish("done");
    else store.setTour({ i: i + 1, end: "" });
  };
  const move = reduce ? { duration: 0 } : { type: "spring" as const, stiffness: 260, damping: 26 };
  // the card sits out of the way: above the lit spot when it is low on the screen, below it otherwise
  const high = !spot || spot.y + spot.h / 2 > window.innerHeight * 0.45;
  const count = format(tour.count, { n: i + 1, total: tour.steps.length });

  return (
    <div className="tour" role="dialog" aria-label={tour.label}>
      {spot ? (
        <m.button
          type="button" className="tour-spot" aria-hidden="true" tabIndex={-1} onClick={advance}
          initial={false} animate={{ left: spot.x - 4, top: spot.y - 4, width: spot.w + 8, height: spot.h + 8 }} transition={move}
        />
      ) : (
        <div className="tour-dim" />
      )}
      <m.div key={i} className={`tour-card${high ? " up" : ""}`} initial={reduce ? false : { opacity: 0, y: high ? -8 : 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <p className="small">{step.kicker ? `${step.kicker} · ${count}` : count}</p>
        <div className="tour-body">
          {comp.on ? <span className="tour-av" aria-hidden="true"><Dawn mood={step.show ? "curious" : "happy"} /></span> : null}
          <p className="tour-say" aria-live="polite">{line(step.say)}</p>
        </div>
        <div className="tour-row">
          <button className="link" type="button" onClick={() => finish("skipped")}>{tour.skip}</button>
          <button className="btn" ref={next} type="button" onClick={advance}>{last ? tour.done : tour.next}</button>
        </div>
      </m.div>
    </div>
  );
}
