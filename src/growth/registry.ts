// Finds every growth practice by its folder, so adding one never means editing shared files.
import type { GrowthPlugin, GrowthScreenModule } from "./types";

const folder = (path: string) => path.split("/")[1] ?? "";
const manifests = import.meta.glob<GrowthPlugin>("./*/plugin.ts", { eager: true, import: "plugin" });
const screens = import.meta.glob<GrowthScreenModule>("./*/Screen.tsx");

export const PLUGINS: GrowthPlugin[] = Object.values(manifests).sort((a, b) => a.order - b.order);

// in development everything shows, so a practice can be built before it's switched on
export const isOn = (p: GrowthPlugin | undefined) => !!p && (p.enabled || import.meta.env.DEV);
export const plugin = (id: string) => PLUGINS.find((p) => p.id === id);
export const onPlugins = () => PLUGINS.filter(isOn);

// each practice's screen loader, by id
export const screenLoaders = () => Object.entries(screens).map(([path, load]) => [folder(path), load] as const);

// for the registry's own test: every manifest sits in a folder named after its id
export const manifestFolders = () => Object.entries(manifests).map(([path, p]) => ({ folder: folder(path), id: p.id }));
export const screenFolders = () => Object.keys(screens).map(folder);
