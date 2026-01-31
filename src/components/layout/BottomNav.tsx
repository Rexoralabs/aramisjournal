import { Link, useLocation } from "react-router-dom";
import { Home, PenLine, TreeDeciduous, LayoutGrid, User } from "lucide-react";
import { useRef, useLayoutEffect } from "react";
import { format } from "date-fns";
import gsap from "gsap";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/write", icon: PenLine, label: "Write" },
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
    <nav ref={navRef} className="fixed bottom-4 left-0 right-0 z-50 px-4">
      <div className="flex items-end justify-center relative">
        {/* Floating nav pill */}
        <div
          ref={pillRef}
          className="flex items-center gap-1 px-3 py-2.5 rounded-full bg-card/95 backdrop-blur-xl border border-border/50 shadow-lg"
        >
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200",
                  isActive
                    ? "bg-primary/15"
                    : "hover:bg-muted/50"
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
        <span className="absolute right-6 bottom-1 text-xs font-ui text-muted-foreground">
          {format(new Date(), "MM.dd.yy")}
        </span>
      </div>
    </nav>
  );
}
