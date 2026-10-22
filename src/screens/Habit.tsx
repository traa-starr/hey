// one voice habit up close: what it says, what it's trying to do, and ways to answer it.
import { content } from "../content/load";
import { go, href } from "../router";
import { FlowTop, HabitGlyph, Screen, SolSays, colorVar } from "../ui/kit";

export function Habit({ id }: { id: string }) {
  const c = content();
  const t = c.copy.habit;
  const h = c.habits.find((x) => x.id === id);
  const back = () => go({ name: "you" });
  if (!h) {
    return (
      <>
        <FlowTop onClose={back} />
        <Screen id="habit-missing"><p className="empty">{c.copy.errors.missing}</p></Screen>
      </>
    );
  }
  return (
    <>
      <FlowTop onClose={back} title="" />
      <Screen id={`habit-${h.id}`}>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <HabitGlyph habit={h} size="lg" morph />
          <h1 className="h2" style={{ fontSize: "2rem" }} data-say>{h.name}</h1>
        </div>
        <div className="card" style={{ background: colorVar(h.color, true) }}>
          <span className="label">{t.says}</span>
          {h.says.map((s) => <p key={s} className="quote" style={{ fontSize: "1.3rem" }} data-say>“{s}”</p>)}
        </div>
        <SolSays mood="happy"><b>{t.job}:</b> {h.job}</SolSays>
        <SolSays mood="curious"><b>{t.misses}:</b> {h.misses}</SolSays>
        <section className="section" aria-labelledby="answers-h">
          <h2 id="answers-h" className="label">{t.answers}</h2>
          {h.answers.map((a) => {
            const way = c.formulas.find((f) => f.id === a.way);
            return (
              <a key={a.line} className="way" href={href({ name: "way", id: a.way })}>
                <span className="way-name"><b>{way?.name ?? a.way}</b><small>{way?.evidence}</small></span>
                <span className="eg"><span className="mine">{a.line}</span></span>
              </a>
            );
          })}
        </section>
        <div className="actions">
          <a className="btn" href={href({ name: "lesson", key: `habit:${h.id}` })}>{t.lesson}</a>
          <a className="btn quiet" href={href({ name: "catch", habit: h.id })}>{t.catch}</a>
        </div>
      </Screen>
    </>
  );
}
