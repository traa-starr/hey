// one way to answer, up close: why it works, an example in the two voices, and its source.
import { content } from "../content/load";
import { go } from "../router";
import { FlowBar, Screen } from "../ui/kit";

export function Way({ id }: { id: string }) {
  const c = content();
  const copy = c.copy.explore;
  const f = c.formulas.find((x) => x.id === id);
  const back = () => go({ name: "explore" });
  if (!f) {
    return (
      <>
        <FlowBar at={0} of={1} onClose={back} />
        <Screen id="way-missing"><p className="lede">{c.copy.errors.missing}</p></Screen>
      </>
    );
  }
  return (
    <>
      <FlowBar at={0} of={1} onClose={back} back={back} />
      <Screen id={`way-${f.id}`}>
        <p className="label" style={{ marginTop: "var(--s4)" }}>{c.copy.explore.waysTitle}</p>
        <h1 className="title" style={{ marginTop: 0 }} data-say>{f.name}</h1>
        <p className="lede" data-say>{f.frame}</p>
        <div className="card exchange">
          <p className="label">{copy.example}</p>
          <p className="inner" style={{ fontSize: "1.05rem" }}>{f.example.before}</p>
          <p className="reply sm">{f.example.after}</p>
        </div>
        <div className="more">
          <p className="label">{copy.why}</p>
          <p data-say>{f.why}</p>
        </div>
        <p className="source">
          {copy.source}: {f.source.url ? <a href={f.source.url} target="_blank" rel="noopener noreferrer">{f.source.label}</a> : f.source.label} · {c.copy.answer.evidence}: {f.evidence}
        </p>
        <div className="actions"><button className="btn" type="button" onClick={() => go({ name: "answer", way: f.id })}>{copy.tryIt}</button></div>
      </Screen>
    </>
  );
}
