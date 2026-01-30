import { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { TreeDeciduous, Sprout, Flower2, Apple, Crown } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { useUserStreak } from "@/hooks/useStreaks";
import { cn } from "@/lib/utils";

interface Milestone {
  days: number;
  name: string;
  icon: React.ElementType;
  description: string;
  color: string;
}

const milestones: Milestone[] = [
  {
    days: 7,
    name: "Seed",
    icon: Sprout,
    description: "Your journey begins",
    color: "text-emerald-500",
  },
  {
    days: 30,
    name: "Sprout",
    icon: TreeDeciduous,
    description: "Growing strong roots",
    color: "text-green-500",
  },
  {
    days: 60,
    name: "Bloom",
    icon: Flower2,
    description: "Beauty in consistency",
    color: "text-pink-500",
  },
  {
    days: 100,
    name: "Flourish",
    icon: Apple,
    description: "Bearing fruit",
    color: "text-orange-500",
  },
  {
    days: 365,
    name: "Harvest",
    icon: Crown,
    description: "A year of wisdom",
    color: "text-primary",
  },
];

const OrchardPage = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  const { data: streakData } = useUserStreak();
  const longestStreak = streakData?.longest_streak || 0;
  const currentStreak = streakData?.current_streak || 0;

  // Find next milestone
  const nextMilestone = milestones.find(m => m.days > longestStreak) || milestones[milestones.length - 1];
  const progressToNext = nextMilestone ? Math.min((longestStreak / nextMilestone.days) * 100, 100) : 100;

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Title animation
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: -30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
      );

      // Cards stagger animation
      if (cardsRef.current) {
        const cards = cardsRef.current.querySelectorAll(".milestone-card");
        gsap.fromTo(
          cards,
          { opacity: 0, y: 30, scale: 0.9 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.5,
            stagger: 0.1,
            delay: 0.3,
            ease: "back.out(1.7)",
          }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  const handleCardHover = (element: HTMLElement, unlocked: boolean) => {
    if (unlocked) {
      gsap.to(element, {
        scale: 1.05,
        duration: 0.3,
        ease: "power2.out",
      });
    }
  };

  const handleCardLeave = (element: HTMLElement) => {
    gsap.to(element, {
      scale: 1,
      duration: 0.3,
      ease: "power2.out",
    });
  };

  return (
    <PageContainer>
      <div ref={containerRef} className="space-y-8 pb-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 ref={titleRef} className="text-4xl font-serif text-foreground">
            The Orchard
          </h1>
          <p className="font-emphasis text-lg text-muted-foreground">
            Where dedication bears fruit
          </p>
        </div>

        {/* Current Progress */}
        <div className="glass-card-glow p-6 text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <TreeDeciduous className="h-6 w-6 text-primary" />
            <span className="text-3xl font-serif text-foreground">{currentStreak}</span>
            <span className="text-muted-foreground font-ui">day streak</span>
          </div>

          {nextMilestone && longestStreak < nextMilestone.days && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-ui">
                <span className="text-muted-foreground">Progress to {nextMilestone.name}</span>
                <span className="text-primary">{longestStreak}/{nextMilestone.days} days</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${progressToNext}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Milestones Grid */}
        <div ref={cardsRef} className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {milestones.map((milestone) => {
            const unlocked = longestStreak >= milestone.days;
            const Icon = milestone.icon;

            return (
              <div
                key={milestone.days}
                className={cn(
                  "milestone-card",
                  unlocked ? "unlocked" : "locked"
                )}
                onMouseEnter={(e) => handleCardHover(e.currentTarget, unlocked)}
                onMouseLeave={(e) => handleCardLeave(e.currentTarget)}
              >
                <div
                  className={cn(
                    "w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center",
                    unlocked ? "bg-primary/20" : "bg-muted"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-6 w-6",
                      unlocked ? milestone.color : "text-muted-foreground"
                    )}
                  />
                </div>

                <h3
                  className={cn(
                    "font-serif text-lg mb-1",
                    unlocked ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {milestone.name}
                </h3>

                <p
                  className={cn(
                    "text-xs font-ui mb-2",
                    unlocked ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {milestone.days} days
                </p>

                <p className="text-xs text-muted-foreground">
                  {unlocked ? milestone.description : "Keep growing..."}
                </p>

                {unlocked && (
                  <div className="absolute top-2 right-2">
                    <div className="h-2 w-2 bg-primary rounded-full animate-pulse-gold" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Inspirational Quote */}
        <div className="text-center py-4">
          <p className="font-emphasis text-lg text-muted-foreground italic">
            "Every expert was once a beginner. Every oak tree was once an acorn."
          </p>
        </div>
      </div>
    </PageContainer>
  );
};

export default OrchardPage;
