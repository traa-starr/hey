// A tiny hash router: GitHub Pages serves one file, and the back button just works.
import { useSyncExternalStore } from "react";
import { flushSync } from "react-dom";
import type { Kind } from "./store/types";

export type Route =
  | { name: "home" }
  | { name: "learn" }
  | { name: "path"; id: string }
  | { name: "lesson"; key: string }
  | { name: "welcome" }
  | { name: "practice" }
  | { name: "check" }
  | { name: "catch"; habit?: string }
  | { name: "answer"; way?: string; habit?: string }
  | { name: "breathe" }
  | { name: "checkin" }
  | { name: "you" }
  | { name: "habit"; id: string }
  | { name: "book"; tab?: Kind }
  | { name: "settings" }
  | { name: "way"; id: string };

export function parse(hash: string): Route {
  const decode = (x: string) => {
    try {
      return decodeURIComponent(x);
    } catch {
      return x;
    }
  };
  const parts = hash.replace(/^#\/?/, "").split("/").filter(Boolean).map(decode);
  const [head, ...rest] = parts;
  const one = rest[0];
  switch (head) {
    case "learn": case "welcome": case "practice": case "check": case "breathe": case "checkin": case "you": case "settings":
      return { name: head };
    case "book": return one === "voice" || one === "about" || one === "keeper" ? { name: "book", tab: one } : { name: "book" };
    case "path": return one ? { name: "path", id: one } : { name: "learn" };
    case "lesson": return rest.length ? { name: "lesson", key: rest.join("/") } : { name: "learn" };
    case "catch": return one ? { name: "catch", habit: one } : { name: "catch" };
    case "answer":
      if (one === "way" && rest[1]) return { name: "answer", way: rest[1] };
      if (one === "habit" && rest[1]) return { name: "answer", habit: rest[1] };
      return { name: "answer" };
    case "habit": return one ? { name: "habit", id: one } : { name: "you" };
    case "way": return one ? { name: "way", id: one } : { name: "practice" };
    default: return { name: "home" };
  }
}

export function href(r: Route): string {
  const e = encodeURIComponent;
  switch (r.name) {
    case "home": return "#/";
    case "path": return `#/path/${e(r.id)}`;
    case "lesson": return `#/lesson/${r.key.split("/").map(e).join("/")}`;
    case "catch": return r.habit ? `#/catch/${e(r.habit)}` : "#/catch";
    case "answer": return r.way ? `#/answer/way/${e(r.way)}` : r.habit ? `#/answer/habit/${e(r.habit)}` : "#/answer";
    case "habit": return `#/habit/${e(r.id)}`;
    case "way": return `#/way/${e(r.id)}`;
    case "book": return r.tab ? `#/book/${r.tab}` : "#/book";
    default: return `#/${r.name}`;
  }
}

export function go(r: Route, replace = false) {
  const h = href(r);
  if (replace) history.replaceState(null, "", h);
  else if (location.hash !== h) location.hash = h;
  window.dispatchEvent(new HashChangeEvent("hashchange"));
}

// how deep a screen sits: tabs, then what opens from them, then what opens from those
const DEPTH: Partial<Record<Route["name"], number>> = { home: 0, learn: 0, practice: 0, you: 0, lesson: 2, way: 2 };
const depth = (r: Route) => (r.name === "book" && r.tab ? 2 : DEPTH[r.name] ?? 1);

// which way a change of screen moves: deeper slides in from the right, back slides away, tabs cross-fade
export function direction(from: Route, to: Route): "forward" | "back" | "tab" | null {
  if (href(from) === href(to)) return null;
  // switching within one screen (the book's pages, say) needs no movement
  if (from.name === to.name && depth(from) === depth(to)) return null;
  const a = depth(from), b = depth(to);
  if (a === 0 && b === 0) return "tab";
  return b < a ? "back" : "forward";
}

let current: Route = typeof location === "undefined" ? { name: "home" } : parse(location.hash);
let moving = false;
const listeners = new Set<() => void>();

// true while a view transition is swapping screens, so screens skip their own entrance
export const isMoving = () => moving;

function onHash() {
  const next = parse(location.hash);
  const type = direction(current, next);
  if (href(next) === href(current)) return;
  const apply = () => {
    current = next;
    listeners.forEach((l) => l());
    if (type) window.scrollTo(0, 0);
  };
  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  if (!type || reduce || !document.startViewTransition) {
    apply();
    return;
  }
  const root = document.documentElement;
  root.dataset.nav = type;
  moving = true;
  // a screen that loads on first use shows a placeholder for a moment: wait (briefly) for the real screen before
  // sliding it in. timers, not animation frames: the browser holds frames back while a transition is being set up.
  const vt = document.startViewTransition(async () => {
    flushSync(apply);
    for (let i = 0; i < 30 && document.querySelector("[data-loading]"); i++) await new Promise((r) => setTimeout(r, 16));
  });
  vt.finished.finally(() => {
    moving = false;
    delete root.dataset.nav;
  });
}

if (typeof window !== "undefined") window.addEventListener("hashchange", onHash);

const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};

export function useRoute(): Route {
  return useSyncExternalStore(subscribe, () => current, () => current);
}
