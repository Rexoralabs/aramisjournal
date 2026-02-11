import { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Sprout, TreeDeciduous, Flower2, Apple, Crown,
  Cherry, Grape, Citrus, Leaf, Star, Sun, Moon, Gem, Zap, Heart, Sparkles, Shield, Award,
} from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { useUserStreak } from "@/hooks/useStreaks";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

interface Fruit {
  days: number;
  name: string;
  title: string;
  icon: React.ElementType;
  description: string;
}

const fruits: Fruit[] = [
  { days: 1, name: "Seed", title: "First Seed", icon: Sprout, description: "You planted your first thought" },
  { days: 3, name: "Sprout", title: "Early Sprout", icon: Leaf, description: "Three days of growth" },
  { days: 7, name: "Lemon", title: "First Harvest", icon: Citrus, description: "A week of consistency" },
  { days: 14, name: "Strawberry", title: "Sweet Progress", icon: Cherry, description: "Two weeks strong" },
  { days: 21, name: "Cherry", title: "Cherry Picked", icon: Cherry, description: "Three weeks of wisdom" },
  { days: 30, name: "Apple", title: "Golden Apple", icon: Apple, description: "A month of reflection" },
  { days: 45, name: "Peach", title: "Peach Perfect", icon: Sun, description: "Six weeks of dedication" },
  { days: 60, name: "Orange", title: "Orange Blossom", icon: Flower2, description: "Two months of growth" },
  { days: 90, name: "Pomegranate", title: "Rich Harvest", icon: Gem, description: "A season of journaling" },
  { days: 100, name: "Fig", title: "Century Fig", icon: TreeDeciduous, description: "100 days milestone" },
  { days: 150, name: "Grape", title: "Vineyard", icon: Grape, description: "Five months cultivated" },
  { days: 200, name: "Mango", title: "Tropical Bliss", icon: Heart, description: "200 days of wisdom" },
  { days: 250, name: "Pineapple", title: "Golden Crown", icon: Crown, description: "250 days of mastery" },
  { days: 300, name: "Coconut", title: "Paradise Found", icon: Moon, description: "Almost a year" },
  { days: 365, name: "Olive", title: "The Ancient Olive", icon: Star, description: "A full year of reflection" },
  { days: 500, name: "Dragonfruit", title: "Mythical Harvest", icon: Zap, description: "Beyond extraordinary" },
  { days: 730, name: "Golden Apple", title: "The Eternal Orchard", icon: Award, description: "Two years of mastery" },
];

const OrchardPage = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const gardenRef = useRef<HTMLDivElement>(null);

  const { data: streakData } = useUserStreak();
  const longestStreak = streakData?.longest_streak || 0;
  const currentStreak = streakData?.current_streak || 0;

  const nextFruit = fruits.find(f => f.days > longestStreak) || fruits[fruits.length - 1];
  const progressToNext = nextFruit ? Math.min((longestStreak / nextFruit.days) * 100, 100) : 100;
  const unlockedCount = fruits.filter(f => longestStreak >= f.days).length;

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Hero parallax
      if (heroRef.current) {
        gsap.fromTo(heroRef.current, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1, ease: "power3.out" });
      }

      // Garden cards parallax on scroll
      if (gardenRef.current) {
        const cards = gardenRef.current.querySelectorAll(".fruit-card");
        cards.forEach((card, i) => {
          gsap.fromTo(
            card,
            { opacity: 0, y: 60 + (i % 3) * 20, scale: 0.92 },
            {
              opacity: 1, y: 0, scale: 1, duration: 0.6,
              ease: "power2.out",
              scrollTrigger: {
                trigger: card,
                start: "top 90%",
                end: "top 60%",
                toggleActions: "play none none reverse",
              },
            }
          );
        });

        // Parallax depth for unlocked fruit icons
        const unlockedIcons = gardenRef.current.querySelectorAll(".fruit-icon-unlocked");
        unlockedIcons.forEach((icon) => {
          gsap.to(icon, {
            y: -15,
            ease: "none",
            scrollTrigger: {
              trigger: icon,
              start: "top bottom",
              end: "bottom top",
              scrub: 1,
            },
          });
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <PageContainer>
      <div ref={containerRef} className="pb-8">
        {/* Hero Section */}
        <div ref={heroRef} className="text-center py-12 space-y-6">
          <h1 className="text-5xl sm:text-6xl font-serif text-foreground tracking-tight">
            The Orchard
          </h1>
          <p className="font-emphasis text-xl text-muted-foreground max-w-sm mx-auto">
            Where dedication bears fruit
          </p>

          {/* Streak display */}
          <div className="glass-card-glow p-8 max-w-sm mx-auto space-y-4">
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-5xl font-serif text-foreground">{currentStreak}</span>
              <span className="text-muted-foreground font-ui text-sm">day streak</span>
            </div>

            <div className="flex items-center justify-center gap-3 text-sm font-ui">
              <span className="text-muted-foreground">{unlockedCount}/{fruits.length} fruits</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground">Best: {longestStreak}</span>
            </div>

            {longestStreak < nextFruit.days && (
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs font-ui">
                  <span className="text-muted-foreground">Next: {nextFruit.name}</span>
                  <span className="text-primary">{longestStreak}/{nextFruit.days}</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-700"
                    style={{ width: `${progressToNext}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Fruit Garden - Editorial Scroll */}
        <div ref={gardenRef} className="space-y-16 py-8">
          {/* Unlocked section title */}
          {unlockedCount > 0 && (
            <div className="text-center">
              <h2 className="text-2xl font-serif text-foreground">Your Harvest</h2>
              <p className="text-sm font-ui text-muted-foreground mt-1">Fruits you've earned</p>
            </div>
          )}

          {/* Fruit grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {fruits.map((fruit) => {
              const unlocked = longestStreak >= fruit.days;
              const Icon = fruit.icon;

              return (
                <div
                  key={fruit.days}
                  className={cn("fruit-card", unlocked ? "milestone-card unlocked" : "milestone-card locked")}
                >
                  <div
                    className={cn(
                      "w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center",
                      unlocked ? "bg-primary/15" : "bg-muted"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-7 w-7",
                        unlocked ? "fruit-icon-unlocked text-primary" : "text-muted-foreground"
                      )}
                    />
                  </div>

                  <h3 className={cn("font-serif text-lg mb-0.5", unlocked ? "text-foreground" : "text-muted-foreground")}>
                    {fruit.title}
                  </h3>

                  <p className={cn("text-xs font-ui mb-2", unlocked ? "text-primary" : "text-muted-foreground")}>
                    {fruit.days} {fruit.days === 1 ? "day" : "days"}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {unlocked ? fruit.description : "Keep growing..."}
                  </p>

                  {unlocked && (
                    <div className="absolute top-3 right-3">
                      <div className="h-2 w-2 bg-primary rounded-full animate-pulse-gold" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Quote */}
        <div className="text-center py-12">
          <p className="font-emphasis text-lg text-muted-foreground max-w-sm mx-auto">
            "Every expert was once a beginner. Every oak tree was once an acorn."
          </p>
        </div>
      </div>
    </PageContainer>
  );
};

export default OrchardPage;
