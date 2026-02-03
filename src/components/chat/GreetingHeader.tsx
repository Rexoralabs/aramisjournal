import { useRef, useLayoutEffect } from "react";
import gsap from "gsap";

interface GreetingHeaderProps {
  displayName: string;
}

export function GreetingHeader({ displayName }: GreetingHeaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const greetingRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    
    if (greetingRef.current && subtitleRef.current) {
      tl.fromTo(
        greetingRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.6 }
      ).fromTo(
        subtitleRef.current,
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.5 },
        "-=0.3"
      );
    }
  }, []);

  return (
    <div ref={containerRef} className="text-center py-6 sm:py-8 flex-1 flex flex-col items-center justify-center px-4">
      <h1
        ref={greetingRef}
        className="text-3xl sm:text-4xl md:text-5xl font-serif text-foreground mb-2 sm:mb-3"
      >
        Hey, <span className="text-primary">{displayName}</span>.
      </h1>
      <p
        ref={subtitleRef}
        className="text-base sm:text-lg md:text-xl text-muted-foreground font-sans"
      >
        How Was Your Day?
      </p>
    </div>
  );
}
