// A tiny hash router: GitHub Pages serves one file, and the back button just works.
import { useSyncExternalStore } from "react";

export type Route =
  | { name: "today" }
  | { name: "explore" }
  | { name: "book" }
  | { name: "welcome" }
  | { name: "answer"; way?: string }
  | { name: "way"; id: string }
  | { name: "set"; path: string };

export function parse(hash: string): Route {
  const parts = hash.replace(/^#\/?/, "").split("/").filter(Boolean).map(decodeURIComponent);
  const [head, ...rest] = parts;
  switch (head) {
    case "explore": return { name: "explore" };
    case "book": return { name: "book" };
    case "welcome": return { name: "welcome" };
    case "answer": return rest[0] ? { name: "answer", way: rest[0] } : { name: "answer" };
    case "way": return rest[0] ? { name: "way", id: rest[0] } : { name: "explore" };
    case "set": return rest.length ? { name: "set", path: `${rest.join("/")}.json` } : { name: "explore" };
    default: return { name: "today" };
  }
}

export function href(r: Route): string {
  switch (r.name) {
    case "today": return "#/";
    case "answer": return r.way ? `#/answer/${encodeURIComponent(r.way)}` : "#/answer";
    case "way": return `#/way/${encodeURIComponent(r.id)}`;
    case "set": return `#/set/${r.path.replace(/\.json$/, "").split("/").map(encodeURIComponent).join("/")}`;
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
