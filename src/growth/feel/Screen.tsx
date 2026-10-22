// A development-only look at the feel check, for building and checking practices against it.
import { useState } from "react";
import { content } from "../../content/load";
import { go } from "../../router";
import { FlowTop, Screen } from "../../ui/kit";
import { FEEL, middle } from "./feel";
import { FeelCheck } from "./FeelCheck";
import { Shift } from "./Shift";

export default function FeelDemo() {
  const [before, setBefore] = useState(middle);
  const [after, setAfter] = useState(middle);
  const close = () => go({ name: "practice" });
  if (!import.meta.env.DEV) {
    return (
      <>
        <FlowTop onClose={close} />
        <Screen id="feel-missing"><p className="empty">{content().copy.errors.missing}</p></Screen>
      </>
    );
  }
  return (
    <>
      <FlowTop onClose={close} title={FEEL.copy.demoTitle} />
      <Screen id="feel-demo">
        <FeelCheck id="before" phase="before" value={before} onChange={setBefore} />
        <p className="empty">{FEEL.copy.demoMiddle}</p>
        <FeelCheck id="after" phase="after" value={after} onChange={setAfter} />
        <Shift before={before} after={after} />
      </Screen>
    </>
  );
}
