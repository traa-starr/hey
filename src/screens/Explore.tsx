// explore: every way to answer, and the getting-to-know-you sets.
import { content } from "../content/load";
import { format } from "../lib/template";
import { href } from "../router";
import { useData } from "../store/useStore";
import { Nav, Screen, TopBar } from "../ui/kit";

export function Explore() {
  const c = content();
  const copy = c.copy.explore;
  const { tried, progress } = useData();
  return (
    <>
      <TopBar />
      <Screen id="explore">
        <h1 className="title" data-say>{copy.title}</h1>
        <section className="section" aria-labelledby="ways">
          <div className="section-head">
            <h2 id="ways" data-say>{copy.waysTitle}</h2>
            <p className="small">{c.intro}</p>
          </div>
          <div className="ways">
            {c.formulas.map((f) => (
              <a key={f.id} className="way" href={href({ name: "way", id: f.id })}>
                <span className="way-name"><b>{f.name}</b><small>{f.evidence}</small></span>
                <span className="eg"><span className="inner">{f.example.before}</span><span className="mine">{f.example.after}</span></span>
              </a>
            ))}
          </div>
        </section>
        <section className="section" aria-labelledby="sets">
          <div className="section-head"><h2 id="sets" data-say>{copy.setsTitle}</h2></div>
          {c.practices.map((p) => (
            <div key={p.id} className="section" style={{ marginTop: 0 }}>
              <p className="label">{p.name}</p>
              <div className="rows">
                {p.sets.map(({ path, lesson }) => (
                  <a key={path} className="row" href={href({ name: "set", path })}>
                    <span><b>{lesson.title}</b><span>{lesson.subtitle}</span></span>
                    <span className="meta">
                      {progress[path] ? copy.resume : tried[lesson.id] ? copy.tried : format(copy.minutes, { n: lesson.minutes })}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </section>
      </Screen>
      <Nav current="explore" />
    </>
  );
}
