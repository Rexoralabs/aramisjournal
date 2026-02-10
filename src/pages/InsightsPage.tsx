import { useState, useRef, useLayoutEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, subDays } from "date-fns";
import { Flame, FileText, TrendingUp } from "lucide-react";
import gsap from "gsap";
import { PageContainer } from "@/components/layout/PageContainer";
import { useJournalEntries } from "@/hooks/useJournal";
import { useUserStreak } from "@/hooks/useStreaks";

type TimeFilter = "week" | "month" | "all";

const InsightsPage = () => {
  const [filter, setFilter] = useState<TimeFilter>("month");
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  const { data: entries = [] } = useJournalEntries();
  const { data: streakData } = useUserStreak();

  const totalEntries = streakData?.total_entries || entries.length;
  const currentStreak = streakData?.current_streak || 0;
  const longestStreak = streakData?.longest_streak || 0;

  // Filter entries by time
  const now = new Date();
  const filteredEntries = entries.filter((e) => {
    if (filter === "all") return true;
    const d = new Date(e.entry_date);
    if (filter === "week") return d >= subDays(now, 7);
    if (filter === "month") return d >= startOfMonth(now);
    return true;
  });

  // Mood stats
  const moodValues: Record<string, number> = { amazing: 5, good: 4, okay: 3, down: 2, rough: 1 };
  const moodEmoji: Record<string, string> = { amazing: "✨", good: "😊", okay: "😐", down: "😔", rough: "😢" };
  const entriesWithMood = filteredEntries.filter((e) => e.mood);
  const avgMood = entriesWithMood.length > 0
    ? entriesWithMood.reduce((s, e) => s + (moodValues[e.mood!] || 0), 0) / entriesWithMood.length
    : 0;

  const moodCounts = filteredEntries.reduce((acc, e) => {
    if (e.mood) acc[e.mood] = (acc[e.mood] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Monthly writing days
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const entryDates = new Set(entries.map((e) => e.entry_date));
  const writingDaysThisMonth = daysInMonth.filter((d) => entryDates.has(format(d, "yyyy-MM-dd"))).length;
  const monthPercent = Math.round((writingDaysThisMonth / daysInMonth.length) * 100);

  // Weekly heatmap (last 7 days)
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(now, 6 - i);
    return { day: format(d, "EEE"), date: format(d, "yyyy-MM-dd"), hasEntry: entryDates.has(format(d, "yyyy-MM-dd")) };
  });

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(containerRef.current, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power2.out" });
      if (cardsRef.current) {
        const cards = cardsRef.current.querySelectorAll(".insight-card");
        gsap.fromTo(cards, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.06, delay: 0.15, ease: "power2.out" });
      }
    });
    return () => ctx.revert();
  }, []);

  return (
    <PageContainer>
      <div ref={containerRef} className="space-y-5 pb-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-serif text-foreground">Your Journey</h1>
          <p className="text-muted-foreground font-ui text-sm mt-1">Patterns in your reflection</p>
        </div>

        {/* Filter chips */}
        <div className="flex gap-2">
          {(["week", "month", "all"] as TimeFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-2xl font-ui text-xs transition-all ${
                filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {f === "week" ? "This Week" : f === "month" ? "This Month" : "All Time"}
            </button>
          ))}
        </div>

        <div ref={cardsRef} className="space-y-4">
          {/* Stats row - featured + stacked */}
          <div className="grid grid-cols-3 gap-3">
            {/* Featured streak card */}
            <div className="insight-card col-span-2 glass-card p-5">
              <div className="flex items-center gap-2 mb-1">
                <Flame className="h-4 w-4 text-primary" />
                <span className="text-xs font-ui text-muted-foreground">Current Streak</span>
              </div>
              <p className="text-4xl font-serif text-foreground">{currentStreak}</p>
              <p className="text-xs font-ui text-muted-foreground mt-1">Best: {longestStreak} days</p>
            </div>

            {/* Stacked right column */}
            <div className="flex flex-col gap-3">
              <div className="insight-card glass-card p-4 text-center flex-1 flex flex-col justify-center">
                <FileText className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
                <p className="text-2xl font-serif text-foreground">{totalEntries}</p>
                <p className="text-[10px] font-ui text-muted-foreground">Entries</p>
              </div>
              <div className="insight-card glass-card p-4 text-center flex-1 flex flex-col justify-center">
                <p className="text-2xl font-serif text-foreground">{avgMood > 0 ? avgMood.toFixed(1) : "—"}</p>
                <p className="text-[10px] font-ui text-muted-foreground">Avg Mood</p>
              </div>
            </div>
          </div>

          {/* Two side-by-side sections */}
          <div className="grid grid-cols-2 gap-3">
            {/* Mood distribution */}
            <div className="insight-card glass-card p-4">
              <h3 className="font-ui text-xs text-muted-foreground mb-3">Mood Breakdown</h3>
              {Object.keys(moodCounts).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(moodCounts)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 4)
                    .map(([mood, count]) => (
                      <div key={mood} className="flex items-center gap-2">
                        <span className="text-sm">{moodEmoji[mood]}</span>
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${(count / entriesWithMood.length) * 100}%` }} />
                        </div>
                        <span className="text-[10px] font-ui text-muted-foreground">{count}</span>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No mood data yet</p>
              )}
            </div>

            {/* Weekly heatmap */}
            <div className="insight-card glass-card p-4">
              <h3 className="font-ui text-xs text-muted-foreground mb-3">This Week</h3>
              <div className="grid grid-cols-7 gap-1">
                {weekDays.map((d) => (
                  <div key={d.date} className="flex flex-col items-center gap-1">
                    <div
                      className={`h-6 w-6 rounded-lg flex items-center justify-center ${
                        d.hasEntry ? "bg-primary/20" : "bg-muted"
                      }`}
                    >
                      {d.hasEntry && <div className="h-2 w-2 rounded-full bg-primary" />}
                    </div>
                    <span className="text-[9px] font-ui text-muted-foreground">{d.day.charAt(0)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Monthly progress */}
          <div className="insight-card glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="font-ui text-xs text-muted-foreground">{format(now, "MMMM")}</span>
              </div>
              <span className="text-xs font-ui text-muted-foreground">{monthPercent}%</span>
            </div>
            <div className="flex items-baseline gap-1 mb-3">
              <span className="text-3xl font-serif text-foreground">{writingDaysThisMonth}</span>
              <span className="text-sm text-muted-foreground">/ {daysInMonth.length} days</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${monthPercent}%` }} />
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default InsightsPage;
