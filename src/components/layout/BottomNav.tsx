import { Link, useLocation } from "react-router-dom";
import { Home, PenLine, CalendarDays, TreeDeciduous, LayoutGrid, User } from "lucide-react";
import { useRef, useLayoutEffect } from "react";
import { format } from "date-fns";
import gsap from "gsap";
import { cn } from "@/lib/utils";
import { haptic } from "@/lib/haptics";

const navItems = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/write", icon: PenLine, label: "Write" },
  { path: "/calendar", icon: CalendarDays, label: "Calendar" },
  { path: "/orchard", icon: TreeDeciduous, label: "Orchard" },
  { path: "/insights", icon: LayoutGrid, label: "Insights" },
  { path: "/profile", icon: User, label: "Profile" },
];

export function BottomNav() {
  const location = useLocation();
  const navRef = useRef<HTMLDivElement>(null);
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
    <nav ref={navRef} className="fixed bottom-4 left-0 right-0 z-50 px-4 pb-safe">
      <div className="flex items-end justify-center relative">
        {/* Floating nav pill */}
        <div
          ref={pillRef}
          className="flex items-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-2.5 rounded-full bg-card/95 backdrop-blur-xl border border-border/50 shadow-lg"
        >
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => haptic('selection')}
                className={cn(
                  "w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all duration-200 touch-target",
                  isActive
                    ? "bg-primary/15"
                    : "hover:bg-muted/50 active:scale-95"
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 transition-colors duration-200",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                />
              </Link>
            );
          })}
        </div>

        {/* Date display in corner */}
        <span className="absolute right-4 sm:right-6 bottom-1 text-xs font-ui text-muted-foreground">
          {format(new Date(), "MM.dd.yy")}
        </span>
      </div>
    </nav>
  );
}
