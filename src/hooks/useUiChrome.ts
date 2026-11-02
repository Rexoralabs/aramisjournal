import { useSyncExternalStore } from "react";

let navHidden = false;
const listeners = new Set<() => void>();

export function setNavHidden(v: boolean) {
  navHidden = v;
  listeners.forEach((l) => l());
}

export function useNavHidden() {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    () => navHidden,
    () => false
  );
}
