import { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { PageContainer } from "@/components/layout/PageContainer";
import { PomodoroTimer } from "@/components/focus/PomodoroTimer";
import { TodoList } from "@/components/focus/TodoList";
import { useAwardPoints, useCheckAchievements } from "@/hooks/useGamification";

const FocusPage = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const awardPoints = useAwardPoints();
  const { check } = useCheckAchievements();

  useLayoutEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power2.out" });
    }
  }, []);

  const handleSessionComplete = () => {
    awardPoints.mutate(8);
    setTimeout(check, 500);
  };

  return (
    <PageContainer>
      <div ref={containerRef} className="space-y-8 pb-24">
        <div>
          <h1 className="text-3xl font-serif text-foreground">Focus</h1>
          <p className="text-sm text-muted-foreground font-ui mt-1">Stay present and productive</p>
        </div>

        <div className="glass-card p-8">
          <PomodoroTimer onSessionComplete={handleSessionComplete} />
        </div>

        <TodoList />
      </div>
    </PageContainer>
  );
};

export default FocusPage;
