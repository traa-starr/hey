import { useSyncExternalStore } from "react";
import { store } from "./store";

export const useData = () => useSyncExternalStore(store.subscribe, store.get, store.get);
