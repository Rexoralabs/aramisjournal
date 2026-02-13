import { useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import gsap from "gsap";

interface OfflineBannerProps {
  visible: boolean;
}

export function OfflineBanner({ visible }: OfflineBannerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    if (visible) {
      gsap.fromTo(ref.current, { y: -40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: "power2.out" });
    } else {
      gsap.to(ref.current, { y: -40, opacity: 0, duration: 0.2, ease: "power2.in" });
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <div ref={ref} className="fixed top-0 left-0 right-0 z-[60] bg-muted/95 backdrop-blur-sm border-b border-border px-4 py-2 flex items-center justify-center gap-2">
      <Icon icon="ph:wifi-slash-duotone" className="h-4 w-4 text-muted-foreground" />
      <span className="text-xs font-ui text-muted-foreground">You're offline. Changes will sync when reconnected.</span>
    </div>
  );
}
