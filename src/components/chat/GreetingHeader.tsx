import { useRef, useLayoutEffect } from "react";
import gsap from "gsap";

interface GreetingHeaderProps {
  displayName: string;
}

export function GreetingHeader({ displayName }: GreetingHeaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const greetingRef = useRef<HTMLHeadingElement>(null);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  useLayoutEffect(() => {
    if (greetingRef.current) {
      gsap.fromTo(
        greetingRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
      );
    }
  }, []);

  return (
    <div ref={containerRef} className="text-center py-6">
      <h1
        ref={greetingRef}
        className="text-3xl md:text-4xl font-serif text-foreground"
      >
        {getGreeting()}, <span className="text-primary">{displayName}</span>
      </h1>
    </div>
  );
}
