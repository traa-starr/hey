import "@fontsource-variable/bricolage-grotesque/opsz.css";
import "@fontsource-variable/newsreader/opsz-italic.css";
import "@fontsource/instrument-sans/400.css";
import "@fontsource/instrument-sans/500.css";
import "@fontsource/instrument-sans/600.css";
import "./styles/app.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import { App } from "./App";
import { listenForInstall } from "./lib/install";
import { store } from "./store/store";

listenForInstall();
store.open();
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
try {
  registerSW({ immediate: true });
} catch {
  // offline support is a bonus where service workers aren't allowed
}
