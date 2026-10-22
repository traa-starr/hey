// learn: paths of short lessons, each with its own color and progress. no streaks, just where you are.
import { content } from "../content/load";
import { format } from "../lib/template";
import { go, href } from "../router";
import { useData } from "../store/useStore";
import { pathArt } from "../ui/art";
import { FlowTop, HabitGlyph, PageTitle, Screen, Tabs, colorVar } from "../ui/kit";


export function Learn() {
  const c = content();
  const { done } = useData();
  return (
    <>
      <Screen id="learn">
        <PageTitle>{c.copy.learn.title}</PageTitle>
        {c.paths.map((p) => (
          <a key={p.id} className="path" href={href({ name: "path", id: p.id })}>
            <span className="path-head">
              <span className="art" style={{ background: colorVar(p.color), ["--art-bg" as string]: colorVar(p.color), viewTransitionName: `path-${p.id}` }}>{pathArt(p.id)}</span>
              <span><b>{p.name}</b><small>{p.blurb}</small></span>
            </span>
            <span className="steps" aria-label={format(c.copy.learn.lessons, { n: p.items.length })}>
              {p.items.map((it) => <span key={it.key} className={`st${done[it.key] ? " done" : ""}`} />)}
            </span>
          </a>
        ))}
      </Screen>
      <Tabs current="learn" />
    </>
  );
}

export function PathView({ id }: { id: string }) {
  const c = content();
  const t = c.copy.learn;
  const { done, progress } = useData();
  const p = c.paths.find((x) => x.id === id);
  const back = () => go({ name: "learn" });
  if (!p) {
    return (
      <>
        <FlowTop onClose={back} />
        <Screen id="path-missing"><p className="empty">{c.copy.errors.missing}</p></Screen>
      </>
    );
  }
  return (
    <>
      <FlowTop onClose={back} title={p.name} />
      <Screen id={`path-${p.id}`}>
        <div className="path-hero">
          <span className="art" style={{ background: colorVar(p.color), ["--art-bg" as string]: colorVar(p.color), viewTransitionName: `path-${p.id}` }}>{pathArt(p.id)}</span>
          <p className="soft">{p.blurb}</p>
        </div>
        <div className="lessons">
          {p.items.map((it, n) => (
            <a key={it.key} className="lesson-row" href={href({ name: "lesson", key: it.key })}>
              {it.habit ? <HabitGlyph habit={it.habit} /> : <span className={`num${done[it.key] ? " done" : ""}`}>{n + 1}</span>}
              <span style={{ minWidth: 0 }}><b>{it.lesson.title}</b><small>{it.lesson.subtitle}</small></span>
              <span className="meta">{progress[it.key] ? t.resume : done[it.key] ? t.done : format(t.minutes, { n: it.lesson.minutes })}</span>
            </a>
          ))}
        </div>
      </Screen>
    </>
  );
}
