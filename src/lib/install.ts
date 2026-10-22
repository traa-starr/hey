// Holds the browser's install offer (Android, desktop Chrome) until the person asks for it.
type InstallEvent = Event & { prompt: () => Promise<void> };
let pending: InstallEvent | null = null;
const listeners = new Set<() => void>();

export function listenForInstall() {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    pending = e as InstallEvent;
    listeners.forEach((l) => l());
  });
}
export const canInstall = () => !!pending;
export const onInstallChange = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
export async function install() {
  const e = pending;
  pending = null;
  listeners.forEach((l) => l());
  await e?.prompt();
}
export const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent);
