// practice: the tools, one tap away.
import { content } from "../content/load";
import { onPlugins } from "../growth/registry";
import { href, type Route } from "../router";
import { Icon } from "../ui/icons";
import { PageTitle, Screen, DawnSays, Tabs } from "../ui/kit";

export function Practice() {
  const c = content();
  const t = c.copy.practice;
  const tools: { key: keyof typeof Icon; title: string; sub: string; color: string; route: Route }[] = [
    { key: "catch", title: t.catch, sub: t.catchSub, color: "coral", route: { name: "catch" } },
    { key: "answer", title: t.answer, sub: t.answerSub, color: "violet", route: { name: "answer" } },
    { key: "breathe", title: t.breathe, sub: t.breatheSub, color: "teal", route: { name: "breathe" } },
    { key: "check", title: t.check, sub: t.checkSub, color: "gold", route: { name: "check" } },
    { key: "tot", title: t.tot, sub: t.totSub, color: "pink", route: { name: "lesson", key: "what-you-like/this-or-that" } }
  ];
  return (
    <>
      <Screen id="practice">
        <PageTitle>{t.title}</PageTitle>
        <DawnSays mood="calm">{t.dawn}</DawnSays>
        <div className="grid2">
          {tools.map((x) => (
            <a key={x.key} className="tile" style={{ background: `var(--${x.color}-soft)` }} href={href(x.route)}>
              <span className="ico" style={{ background: `var(--${x.color})` }}>{Icon[x.key]}</span>
              <b>{x.title}</b><small>{x.sub}</small>
            </a>
          ))}
          {onPlugins().flatMap((p) => (p.tile ? [p.tile] : []).map((tile) => (
            <a key={p.id} className="tile" style={{ background: `var(--${tile.color}-soft)` }} href={href({ name: "grow", feature: p.id })}>
              <span className="ico" style={{ background: `var(--${tile.color})` }}>{tile.icon}</span>
              <b>{tile.title}</b><small>{tile.sub}</small>
            </a>
          )))}
        </div>
        <section className="section" aria-labelledby="ways-h">
          <h2 id="ways-h" className="label">{t.ways}</h2>
          <div className="ways">
            {c.formulas.map((f) => (
              <a key={f.id} className="way" href={href({ name: "way", id: f.id })}>
                <span className="way-name"><b>{f.name}</b><small>{f.evidence}</small></span>
                <span className="eg"><span className="inner">{f.example.before}</span><span className="mine">{f.example.after}</span></span>
              </a>
            ))}
          </div>
        </section>
      </Screen>
      <Tabs current="practice" />
    </>
  );
}
