import { useLayoutEffect, useRef, RefObject } from 'react';
import gsap from 'gsap';

// Fade in animation hook
export function useGsapFadeIn<T extends HTMLElement>(delay = 0): RefObject<T> {
  const ref = useRef<T>(null);

  useLayoutEffect(() => {
    if (!ref.current) return;

    gsap.fromTo(
      ref.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, delay, ease: "power2.out" }
    );
  }, [delay]);

  return ref;
}

// Scale in animation hook
export function useGsapScaleIn<T extends HTMLElement>(delay = 0): RefObject<T> {
  const ref = useRef<T>(null);

  useLayoutEffect(() => {
    if (!ref.current) return;

    gsap.fromTo(
      ref.current,
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 0.4, delay, ease: "back.out(1.7)" }
    );
  }, [delay]);

  return ref;
}

// Stagger animation for lists
export function useGsapStagger<T extends HTMLElement>(
  containerSelector: string,
  itemSelector: string,
  delay = 0
): RefObject<T> {
  const ref = useRef<T>(null);

  useLayoutEffect(() => {
    if (!ref.current) return;

    const items = ref.current.querySelectorAll(itemSelector);
    if (items.length === 0) return;

    gsap.fromTo(
      items,
      { opacity: 0, y: 15 },
      {
        opacity: 1,
        y: 0,
        duration: 0.4,
        delay,
        stagger: 0.08,
        ease: "power2.out"
      }
    );
  }, [containerSelector, itemSelector, delay]);

  return ref;
}

// Slide in from side
export function useGsapSlideIn<T extends HTMLElement>(
  direction: 'left' | 'right' = 'left',
  delay = 0
): RefObject<T> {
  const ref = useRef<T>(null);

  useLayoutEffect(() => {
    if (!ref.current) return;

    const xStart = direction === 'left' ? -30 : 30;

    gsap.fromTo(
      ref.current,
      { opacity: 0, x: xStart },
      { opacity: 1, x: 0, duration: 0.5, delay, ease: "power2.out" }
    );
  }, [direction, delay]);

  return ref;
}

// Animate element manually
export function gsapFadeIn(element: HTMLElement | null, delay = 0) {
  if (!element) return;

  gsap.fromTo(
    element,
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.6, delay, ease: "power2.out" }
  );
}

// Animate element out
export function gsapFadeOut(element: HTMLElement | null, onComplete?: () => void) {
  if (!element) return;

  gsap.to(element, {
    opacity: 0,
    y: -10,
    duration: 0.3,
    ease: "power2.in",
    onComplete
  });
}

// Page transition in
export function gsapPageEnter(element: HTMLElement | null) {
  if (!element) return;

  gsap.fromTo(
    element,
    { opacity: 0, y: 30 },
    { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }
  );
}

// Glow pulse effect
export function gsapGlowPulse(element: HTMLElement | null) {
  if (!element) return;

  gsap.to(element, {
    boxShadow: "0 0 30px hsl(43, 55%, 52%, 0.5)",
    duration: 0.8,
    repeat: 1,
    yoyo: true,
    ease: "power2.inOut"
  });
}

// Shake animation for errors
export function gsapShake(element: HTMLElement | null) {
  if (!element) return;

  const tl = gsap.timeline();
  tl.to(element, { x: -5, duration: 0.05 })
    .to(element, { x: 5, duration: 0.1 })
    .to(element, { x: -5, duration: 0.1 })
    .to(element, { x: 5, duration: 0.1 })
    .to(element, { x: 0, duration: 0.05 });
}

// Counter animation
export function gsapCounter(
  element: HTMLElement | null,
  endValue: number,
  duration = 1.5
) {
  if (!element) return;

  const obj = { value: 0 };
  
  gsap.to(obj, {
    value: endValue,
    duration,
    ease: "power2.out",
    onUpdate: () => {
      element.textContent = Math.round(obj.value).toString();
    }
  });
}

// Milestone unlock celebration
export function gsapCelebrate(element: HTMLElement | null) {
  if (!element) return;

  const tl = gsap.timeline();

  tl.to(element, {
    scale: 1.1,
    duration: 0.3,
    ease: "back.out(2)"
  })
  .to(element, {
    boxShadow: "0 0 50px hsl(43, 55%, 52%, 0.6)",
    duration: 0.5,
    ease: "power2.out"
  })
  .to(element, {
    scale: 1,
    boxShadow: "0 0 20px hsl(43, 55%, 52%, 0.3)",
    duration: 0.4,
    ease: "power2.inOut"
  });

  return tl;
}
