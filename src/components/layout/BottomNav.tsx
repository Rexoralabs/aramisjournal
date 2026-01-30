import { Link, useLocation } from "react-router-dom";
import { MessageCircle, PenLine, TreeDeciduous, BarChart3, User } from "lucide-react";
import { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", icon: MessageCircle, label: "Today" },
  { path: "/write", icon: PenLine, label: "Write" },
  { path: "/orchard", icon: TreeDeciduous, label: "Orchard" },
  { path: "/insights", icon: BarChart3, label: "Insights" },
  { path: "/profile", icon: User, label: "Profile" },
];

export function BottomNav() {
  const location = useLocation();
  const indicatorRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!indicatorRef.current || !navRef.current) return;

    const activeIndex = navItems.findIndex(item => item.path === location.pathname);
    if (activeIndex === -1) return;

    const navItems_el = navRef.current.querySelectorAll('a');
    const activeItem = navItems_el[activeIndex];
    
    if (activeItem) {
      const rect = activeItem.getBoundingClientRect();
      const navRect = navRef.current.getBoundingClientRect();
      const leftPos = rect.left - navRect.left + rect.width / 2 - 12;

      gsap.to(indicatorRef.current, {
        left: leftPos,
        duration: 0.3,
        ease: "power2.out"
      });
    }
  }, [location.pathname]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-card border-t border-border/50 px-2 pb-safe">
      <div ref={navRef} className="mx-auto flex max-w-lg items-center justify-around py-2 relative">
        <div
          ref={indicatorRef}
          className="absolute -top-1 h-1 w-6 rounded-full bg-primary transition-opacity"
          style={{ left: '50%', transform: 'translateX(-50%)' }}
        />
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className="relative flex flex-col items-center px-3 py-2 group"
            >
              <div
                className={cn(
                  "transition-transform duration-200",
                  isActive && "scale-110"
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 transition-colors duration-200",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
              </div>
              <span
                className={cn(
                  "mt-1 text-xs font-ui transition-colors duration-200",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
