import { useRef, useLayoutEffect } from "react";
import gsap from "gsap";

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!ref.current) return;

    const tl = gsap.timeline({
      onComplete,
    });

    // Hold for 1.2s, then blur + fade out
    tl.to(ref.current, { duration: 1.2 })
      .to(ref.current, {
        opacity: 0,
        filter: "blur(12px)",
        duration: 0.5,
        ease: "power2.in",
      });
  }, [onComplete]);

  return (
    <div
      ref={ref}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background"
    >
      <span className="font-brand text-3xl tracking-[0.25em] text-foreground/80 select-none">
        ARAMIS
      </span>
    </div>
  );
}
