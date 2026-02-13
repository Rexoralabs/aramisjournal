import { Link, useLocation } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";
import { haptic } from "@/lib/haptics";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

const navItems = [
  { path: "/", icon: "ph:house-duotone", label: "Home" },
  { path: "/compose", icon: "ph:pencil-simple-duotone", label: "Compose" },
  { path: "/calendar", icon: "ph:calendar-duotone", label: "Calendar" },
  { path: "/focus", icon: "ph:timer-duotone", label: "Focus" },
  { path: "/cellar", icon: "ph:vault-duotone", label: "Cellar" },
  { path: "/insights", icon: "ph:chart-bar-duotone", label: "Insights" },
  { path: "/profile", icon: "ph:user-circle-duotone", label: "Profile" },
];

export function BottomNav() {
  const location = useLocation();
  const pillRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (pillRef.current) {
      gsap.fromTo(
        pillRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, delay: 0.2, ease: "power2.out" }
      );
    }
  }, []);

  return (
    <nav className="fixed left-0 right-0 z-50 bottom-4 pb-safe px-4">
      <div className="flex items-end justify-center relative">
        <div
          ref={pillRef}
          className="flex items-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-2.5 rounded-full bg-card/95 backdrop-blur-xl border border-border/50 shadow-lg"
        >
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <Tooltip key={item.path} delayDuration={300}>
                <TooltipTrigger asChild>
                  <Link
                    to={item.path}
                    onClick={() => haptic("selection")}
                    className={cn(
                      "w-9 h-9 sm:w-10 sm:h-10 lg:w-11 lg:h-11 rounded-full flex items-center justify-center transition-all duration-200 touch-target",
                      isActive
                        ? "bg-primary/15"
                        : "hover:bg-muted/50 hover:scale-110 active:scale-95"
                    )}
                  >
                    <Icon
                      icon={item.icon}
                      className={cn(
                        "h-[18px] w-[18px] sm:h-5 sm:w-5 transition-colors duration-200",
                        isActive ? "text-primary" : "text-muted-foreground"
                      )}
                    />
                  </Link>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="font-ui text-xs rounded-xl"
                >
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
