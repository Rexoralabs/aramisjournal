/** GSAP reads the same motion roles as CSS instead of inventing per-feature timings. */
export function designMotion() {
  if (typeof window === "undefined") return { ease: "expo.out", dur: 0.7, spring: "back.out(1.6)" };
  const style = getComputedStyle(document.documentElement);
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const duration = Number.parseFloat(style.getPropertyValue("--motion-enter"));
  return {
    ease: style.getPropertyValue("--motion-ease-enter").trim() || "expo.out",
    dur: reduced ? 0 : (Number.isFinite(duration) ? duration / 1000 : 0.7),
    spring: reduced ? "none" : style.getPropertyValue("--motion-ease-spring").trim() || "back.out(1.6)",
  };
}