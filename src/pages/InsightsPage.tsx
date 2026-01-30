import { useRef, useLayoutEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { Lightbulb, FileText, Flame, Smile, TrendingUp } from "lucide-react";
import gsap from "gsap";
import { PageContainer } from "@/components/layout/PageContainer";
import { useJournalEntries } from "@/hooks/useJournal";
import { useUserStreak } from "@/hooks/useStreaks";

const InsightsPage = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  const { data: entries = [] } = useJournalEntries();
  const { data: streakData } = useUserStreak();

  const totalEntries = streakData?.total_entries || entries.length;
  const currentStreak = streakData?.current_streak || 0;
  const longestStreak = streakData?.longest_streak || 0;

  // Calculate mood distribution
  const moodCounts = entries.reduce((acc, entry) => {
    if (entry.mood) {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const moodEmoji: Record<string, string> = {
    amazing: "✨",
    good: "😊",
    okay: "😐",
    down: "😔",
    rough: "😢",
  };

  // Calculate average mood
  const moodValues: Record<string, number> = {
    amazing: 5,
    good: 4,
    okay: 3,
    down: 2,
    rough: 1,
  };

  const entriesWithMood = entries.filter(e => e.mood);
  const avgMood = entriesWithMood.length > 0
    ? entriesWithMood.reduce((sum, e) => sum + (moodValues[e.mood!] || 0), 0) / entriesWithMood.length
    : 0;

  // Calculate writing days this month
  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const entryDates = new Set(entries.map(e => e.entry_date));
  const writingDaysThisMonth = daysInMonth.filter(
    day => entryDates.has(format(day, "yyyy-MM-dd"))
  ).length;

  // AI Insight (placeholder - would be real AI later)
  const insights = [
    "You tend to write longer entries in the evening hours.",
    "Your mood has been trending positively this week.",
    "You've been most consistent on weekends.",
    "Reflective prompts generate your deepest entries.",
  ];
  const randomInsight = insights[Math.floor(Math.random() * insights.length)];

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.4, ease: "power2.out" }
      );

      if (cardsRef.current) {
        const cards = cardsRef.current.querySelectorAll(".insight-card");
        gsap.fromTo(
          cards,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.4,
            stagger: 0.08,
            delay: 0.2,
            ease: "power2.out",
          }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <PageContainer>
      <div ref={containerRef} className="space-y-6 pb-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-serif text-foreground">Your Journey</h1>
          <p className="text-muted-foreground font-ui text-sm mt-1">
            Insights from your reflection
          </p>
        </div>

        <div ref={cardsRef} className="space-y-4">
          {/* AI Insight Card */}
          <div className="insight-card glass-card-glow p-5">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Lightbulb className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-ui text-sm font-medium text-muted-foreground mb-1">
                  AI Insight
                </h3>
                <p className="text-foreground">{randomInsight}</p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="insight-card glass-card p-4 text-center">
              <FileText className="h-5 w-5 mx-auto text-muted-foreground mb-2" />
              <p className="text-2xl font-serif text-foreground">{totalEntries}</p>
              <p className="text-xs font-ui text-muted-foreground">Total Entries</p>
            </div>

            <div className="insight-card glass-card p-4 text-center">
              <Flame className="h-5 w-5 mx-auto text-primary mb-2" />
              <p className="text-2xl font-serif text-primary">{currentStreak}</p>
              <p className="text-xs font-ui text-muted-foreground">Current Streak</p>
            </div>

            <div className="insight-card glass-card p-4 text-center">
              <Smile className="h-5 w-5 mx-auto text-muted-foreground mb-2" />
              <p className="text-2xl font-serif text-foreground">{avgMood.toFixed(1)}</p>
              <p className="text-xs font-ui text-muted-foreground">Avg Mood</p>
            </div>
          </div>

          {/* Mood Distribution */}
          {Object.keys(moodCounts).length > 0 && (
            <div className="insight-card glass-card p-5">
              <h3 className="font-serif text-lg text-foreground mb-4">Mood Distribution</h3>
              <div className="space-y-3">
                {Object.entries(moodCounts)
                  .sort(([, a], [, b]) => b - a)
                  .map(([mood, count]) => (
                    <div key={mood} className="flex items-center gap-3">
                      <span className="text-xl w-8">{moodEmoji[mood]}</span>
                      <div className="flex-1">
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{
                              width: `${(count / entriesWithMood.length) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                      <span className="text-sm font-ui text-muted-foreground w-8">
                        {count}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Monthly Activity */}
          <div className="insight-card glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-lg text-foreground">This Month</h3>
              <span className="text-sm font-ui text-muted-foreground">
                {format(today, "MMMM yyyy")}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-primary" />
              <div>
                <p className="text-foreground">
                  <span className="text-2xl font-serif">{writingDaysThisMonth}</span>
                  <span className="text-muted-foreground"> / {daysInMonth.length} days</span>
                </p>
                <p className="text-xs font-ui text-muted-foreground">
                  You've journaled on {Math.round((writingDaysThisMonth / daysInMonth.length) * 100)}% of days this month
                </p>
              </div>
            </div>
          </div>

          {/* Longest Streak */}
          <div className="insight-card glass-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg text-foreground">Longest Streak</h3>
                <p className="text-xs font-ui text-muted-foreground">Your personal best</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-serif text-primary">{longestStreak}</p>
                <p className="text-xs font-ui text-muted-foreground">days</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default InsightsPage;
