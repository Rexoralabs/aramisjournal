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
      { opacity: 0, filter: "blur(8px)", scale: 0.98 },
      { opacity: 1, filter: "blur(0px)", scale: 1, duration: 0.5, ease: "power2.out" }
    );
  }, []);

  return (
    <main
      ref={ref}
      className={cn("min-h-screen pl-20 pt-6 pr-4 pb-6", className)}
      style={{ opacity: 0 }}
    >
      <div className="mx-auto max-w-3xl lg:max-w-4xl xl:max-w-5xl">
        {children}
      </div>
    </main>
  );
}