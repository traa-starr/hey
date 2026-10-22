import { LazyMotion, MotionConfig } from "motion/react";
import { Component, lazy, Suspense, useEffect, type ReactNode } from "react";
import { content } from "./content/load";
import { stopSpeaking } from "./lib/speech";
import { go, useRoute } from "./router";
import { Home } from "./screens/Home";
import { useData } from "./store/useStore";

const loadMotion = () => import("./lib/motion-features").then((m) => m.default);

// screens beyond home load on first use (and are cached for offline by the service worker)
const Answer = lazy(() => import("./screens/Answer").then((m) => ({ default: m.Answer })));
const Book = lazy(() => import("./screens/Book").then((m) => ({ default: m.Book })));
const Breathe = lazy(() => import("./screens/Breathe").then((m) => ({ default: m.Breathe })));
const Catch = lazy(() => import("./screens/Catch").then((m) => ({ default: m.Catch })));
const Chat = lazy(() => import("./screens/Chat").then((m) => ({ default: m.Chat })));
const Check = lazy(() => import("./screens/Check").then((m) => ({ default: m.Check })));
const CheckIn = lazy(() => import("./screens/CheckIn").then((m) => ({ default: m.CheckIn })));
const Habit = lazy(() => import("./screens/Habit").then((m) => ({ default: m.Habit })));
const Learn = lazy(() => import("./screens/Learn").then((m) => ({ default: m.Learn })));
const PathView = lazy(() => import("./screens/Learn").then((m) => ({ default: m.PathView })));
const Practice = lazy(() => import("./screens/Practice").then((m) => ({ default: m.Practice })));
const Settings = lazy(() => import("./screens/Settings").then((m) => ({ default: m.Settings })));
const Way = lazy(() => import("./screens/Way").then((m) => ({ default: m.Way })));
const You = lazy(() => import("./screens/You").then((m) => ({ default: m.You })));

// light or dark follows the phone unless pinned in settings
function useTheme() {
  const { settings } = useData();
  useEffect(() => {
    const root = document.documentElement;
    if (settings.appearance === "time") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", settings.appearance);
    const meta = document.querySelector('meta[name="theme-color"]');
    const bg = getComputedStyle(root).getPropertyValue("--bg").trim();
    if (meta && bg) meta.setAttribute("content", bg);
  }, [settings.appearance]);
}

const TABS = ["home", "learn", "practice", "you"];

function Routes() {
  const route = useRoute();
  const data = useData();
  const c = content();
  useTheme();
  useEffect(() => stopSpeaking, [route]);

  // first open: the welcome comes before anything else
  const needsWelcome = data.ready && !data.welcomed && !!c.start && route.name === "home";
  useEffect(() => {
    if (needsWelcome) go({ name: "welcome" }, true);
  }, [needsWelcome]);

  if (!data.ready || needsWelcome) return <p className="boot">{c.copy.app.loading}</p>;

  let page: ReactNode;
  switch (route.name) {
    case "welcome": page = <Chat key="welcome" lessonKey="start/welcome" isWelcome />; break;
    case "lesson": page = <Chat key={route.key} lessonKey={route.key} />; break;
    case "learn": page = <Learn />; break;
    case "path": page = <PathView id={route.id} />; break;
    case "practice": page = <Practice />; break;
    case "check": page = <Check />; break;
    case "catch": page = <Catch key={route.habit ?? ""} habit={route.habit} />; break;
    case "answer": page = <Answer key={`answer-${route.way ?? ""}-${route.habit ?? ""}`} way={route.way} habit={route.habit} />; break;
    case "breathe": page = <Breathe />; break;
    case "checkin": page = <CheckIn />; break;
    case "you": page = <You />; break;
    case "habit": page = <Habit id={route.id} />; break;
    case "book": page = <Book />; break;
    case "settings": page = <Settings />; break;
    case "way": page = <Way id={route.id} />; break;
    default: page = <Home />;
  }
  return (
    <main className={`app${TABS.includes(route.name) ? "" : " flow"}`}>
      <Suspense fallback={<p className="boot">{c.copy.app.loading}</p>}>{page}</Suspense>
    </main>
  );
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
        <a className="link" href="#/" onClick={() => this.setState({ failed: false })}>hey you</a>
      </main>
    );
  }
}

export function App() {
  return (
    <Guard>
      <LazyMotion features={loadMotion} strict>
        <MotionConfig reducedMotion="user">
          <Routes />
        </MotionConfig>
      </LazyMotion>
    </Guard>
  );
}
