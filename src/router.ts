// A tiny hash router: GitHub Pages serves one file, and the back button just works.
import { useSyncExternalStore } from "react";

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
  | { name: "book" }
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
    case "learn": case "welcome": case "practice": case "check": case "breathe": case "checkin": case "you": case "book": case "settings":
      return { name: head };
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
    default: return `#/${r.name}`;
  }
}

export function go(r: Route, replace = false) {
  const h = href(r);
  if (replace) history.replaceState(null, "", h);
  else if (location.hash !== h) location.hash = h;
  window.dispatchEvent(new HashChangeEvent("hashchange"));
}

const subscribe = (cb: () => void) => {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
};

export function useRoute(): Route {
  const hash = useSyncExternalStore(subscribe, () => location.hash, () => "");
  return parse(hash);
}
