// #/grow/<feature>/<sub>: loads the practice's own screen on first use.
import { lazy } from "react";
import { content } from "../content/load";
import { go } from "../router";
import { FlowTop, Screen } from "../ui/kit";
import { isOn, plugin, screenLoaders } from "./registry";

// made once, up front; each screen's code still loads only when it's first opened
const SCREENS = Object.fromEntries(screenLoaders().map(([id, load]) => [id, lazy(load)]));

export function GrowthScreen({ feature, sub }: { feature: string; sub?: string }) {
  const S = isOn(plugin(feature)) ? SCREENS[feature] : undefined;
  if (S) return <S sub={sub} />;
  return (
    <>
      <FlowTop onClose={() => go({ name: "practice" })} />
      <Screen id="grow-missing"><p className="empty">{content().copy.errors.missing}</p></Screen>
    </>
  );
}
