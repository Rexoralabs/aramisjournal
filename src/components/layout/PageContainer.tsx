import { ReactNode, useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

export function PageContainer({ children, className }: PageContainerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(
      ref.current,
      { opacity: 0, filter: "blur(8px)" },
      { opacity: 1, filter: "blur(0px)", duration: 0.5, ease: "power2.out" }
    );
  }, []);

  return (
    <main
      ref={ref}
      className={cn("min-h-screen pb-20 pt-6", className)}
      style={{ opacity: 0 }}
    >
      <div className="container mx-auto max-w-lg px-4 md:max-w-2xl lg:max-w-4xl xl:max-w-5xl">
        {children}
      </div>
    </main>
  );
}
