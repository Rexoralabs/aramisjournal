import { useSyncExternalStore } from "react";
import { designMotion } from "@/lib/designMotion";

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
  return designMotion();
}
