import { MotionConfig } from "motion/react";
import { Component, useEffect, type ReactNode } from "react";
import { content } from "./content/load";
import { stopSpeaking } from "./lib/speech";
import { HUES, timeOfDay } from "./lib/time";
import { go, useRoute } from "./router";
import { Answer } from "./screens/Answer";
import { Book } from "./screens/Book";
import { Explore } from "./screens/Explore";
import { Lesson } from "./screens/Lesson";
import { Today } from "./screens/Today";
import { Way } from "./screens/Way";
import { useData } from "./store/useStore";

// the page color follows the hour; appearance can pin light or dark
function useTheme() {
  const { settings } = useData();
  useEffect(() => {
    const root = document.documentElement;
    const apply = () => {
      root.style.setProperty("--h", String(HUES[timeOfDay()]));
      if (settings.appearance === "time") root.removeAttribute("data-theme");
      else root.setAttribute("data-theme", settings.appearance);
      const meta = document.querySelector('meta[name="theme-color"]');
      const sky = getComputedStyle(root).getPropertyValue("--sky").trim();
      if (meta && sky) meta.setAttribute("content", sky);
    };
    apply();
    const t = window.setInterval(apply, 60_000);
    const dark = matchMedia("(prefers-color-scheme: dark)");
    dark.addEventListener("change", apply);
    return () => {
      clearInterval(t);
      dark.removeEventListener("change", apply);
    };
  }, [settings.appearance]);
}

function Routes() {
  const route = useRoute();
  const data = useData();
  const c = content();
  useTheme();
  useEffect(() => stopSpeaking, [route]);

  // first open: the welcome comes before anything else
  const needsWelcome = data.ready && !data.welcomed && !!c.start && route.name === "today";
  useEffect(() => {
    if (needsWelcome) go({ name: "welcome" }, true);
  }, [needsWelcome]);

  if (!data.ready || needsWelcome) return <p className="boot">{c.copy.app.loading}</p>;

  const flow = ["welcome", "answer", "way", "set"].includes(route.name);
  let page: ReactNode;
  switch (route.name) {
    case "welcome": page = <Lesson key="welcome" path={c.startPath} isWelcome />; break;
    case "answer": page = <Answer key={`answer-${route.way ?? ""}`} way={route.way} />; break;
    case "way": page = <Way id={route.id} />; break;
    case "set": page = <Lesson key={route.path} path={route.path} />; break;
    case "explore": page = <Explore />; break;
    case "book": page = <Book />; break;
    default: page = <Today />;
  }
  return <main className={`app${flow ? " flow" : ""}`}>{page}</main>;
}

class Guard extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (!this.state.failed) return this.props.children;
    let text = "something didn't load. the rest of hey you still works.";
    try {
      text = content().copy.errors.content;
    } catch {
      // content itself is what failed
    }
    return (
      <main className="app">
        <p className="boot">{text}</p>
        <a className="link center" href="#/" onClick={() => this.setState({ failed: false })}>hey you</a>
      </main>
    );
  }
}

export function App() {
  return (
    <Guard>
      <MotionConfig reducedMotion="user">
        <Routes />
      </MotionConfig>
    </Guard>
  );
}
