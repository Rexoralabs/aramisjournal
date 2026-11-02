import { useSyncExternalStore } from "react";

export type StyleMode = "modern" | "editorial";
const KEY = "aramis-style";
const listeners = new Set<() => void>();

export function getStyleMode(): StyleMode {
  if (typeof window === "undefined") return "modern";
  return (localStorage.getItem(KEY) as StyleMode) === "editorial" ? "editorial" : "modern";
}

export function applyStyleMode(mode: StyleMode = getStyleMode()) {
  document.documentElement.dataset.style = mode;
}

export function setStyleMode(mode: StyleMode) {
  localStorage.setItem(KEY, mode);
  applyStyleMode(mode);
  listeners.forEach((l) => l());
}

export function useStyleMode() {
  const mode = useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    getStyleMode,
    () => "modern" as StyleMode
  );
  return { mode, setMode: setStyleMode };
}

/** Motion presets per style mode */
export function motion() {
  return getStyleMode() === "modern"
    ? { ease: "expo.out", dur: 0.7, spring: "back.out(1.6)" }
    : { ease: "power2.out", dur: 0.4, spring: "power2.out" };
}
