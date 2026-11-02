import { Link, useLocation } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";
import { haptic } from "@/lib/haptics";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useNavHidden } from "@/hooks/useUiChrome";

const navItems = [
  { path: "/", icon: "ph:house-duotone", label: "Home" },
  { path: "/compose", icon: "ph:pencil-simple-duotone", label: "Compose" },
  { path: "/calendar", icon: "ph:calendar-duotone", label: "Calendar" },
  { path: "/focus", icon: "ph:timer-duotone", label: "Focus" },
  { path: "/cellar", icon: "ph:vault-duotone", label: "Cellar" },
  { path: "/insights", icon: "ph:chart-bar-duotone", label: "Insights" },
  { path: "/profile", icon: "ph:user-circle-duotone", label: "Profile" },
];

export function SideNav() {
  const location = useLocation();
  const pillRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const hidden = useNavHidden();

  useLayoutEffect(() => {
    if (pillRef.current) {
      gsap.fromTo(
        pillRef.current,
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.5, delay: 0.2, ease: "power3.out" }
      );
    }
  }, []);

  useLayoutEffect(() => {
    if (!navRef.current) return;
    gsap.to(navRef.current, {
      opacity: hidden ? 0 : 1,
      filter: hidden ? "blur(8px)" : "blur(0px)",
      x: hidden ? -12 : 0,
      duration: 0.4,
      ease: "power3.out",
    });
  }, [hidden]);

  return (
    <nav ref={navRef} className={cn("fixed left-4 top-1/2 -translate-y-1/2 z-50", hidden && "pointer-events-none")}>
      <div
        ref={pillRef}
        className="flex flex-col items-center gap-1 px-2 py-3 rounded-2xl glass-liquid"
      >
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <Tooltip key={item.path} delayDuration={200}>
              <TooltipTrigger asChild>
                <Link
                  to={item.path}
                  onClick={() => haptic("selection")}
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200",
                    isActive
                      ? "bg-primary/15 shadow-sm"
                      : "hover:bg-muted/50 hover:scale-110 active:scale-95"
                  )}
                >
                  <Icon
                    icon={item.icon}
                    className={cn(
                      "h-[18px] w-[18px] transition-colors duration-200",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                </Link>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                className="font-ui text-xs rounded-xl"
              >
                {item.label}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </nav>
  );
}