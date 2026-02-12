import { useState, useRef, useLayoutEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, subDays, subWeeks, startOfWeek, endOfWeek } from "date-fns";
import { Icon } from "@iconify/react";
import gsap from "gsap";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { PageContainer } from "@/components/layout/PageContainer";
import { useJournalEntries } from "@/hooks/useJournal";
import { useUserStreak } from "@/hooks/useStreaks";

type TimeFilter = "week" | "month" | "all";

const moodValues: Record<string, number> = { amazing: 5, good: 4, okay: 3, down: 2, rough: 1 };
const moodEmoji: Record<string, string> = { amazing: "✨", good: "😊", okay: "😐", down: "😔", rough: "😢" };

const InsightsPage = () => {
  const [filter, setFilter] = useState<TimeFilter>("month");
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  const { data: entries = [] } = useJournalEntries();
  const { data: streakData } = useUserStreak();

  const totalEntries = streakData?.total_entries || entries.length;
  const currentStreak = streakData?.current_streak || 0;
  const longestStreak = streakData?.longest_streak || 0;

  const now = new Date();
  const filteredEntries = entries.filter((e) => {
    if (filter === "all") return true;
    const d = new Date(e.entry_date);
    if (filter === "week") return d >= subDays(now, 7);
    if (filter === "month") return d >= startOfMonth(now);
    return true;
  });

  const entriesWithMood = filteredEntries.filter((e) => e.mood);
  const avgMood = entriesWithMood.length > 0
    ? entriesWithMood.reduce((s, e) => s + (moodValues[e.mood!] || 0), 0) / entriesWithMood.length
    : 0;

  // Monthly writing days
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const entryDates = new Set(entries.map((e) => e.entry_date));
  const writingDaysThisMonth = daysInMonth.filter((d) => entryDates.has(format(d, "yyyy-MM-dd"))).length;
  const monthPercent = Math.round((writingDaysThisMonth / daysInMonth.length) * 100);

  // Mood over time data (last 30 days)
  const moodLineData = Array.from({ length: 30 }, (_, i) => {
    const d = subDays(now, 29 - i);
    const dateStr = format(d, "yyyy-MM-dd");
    const entry = entries.find(e => e.entry_date === dateStr);
    return {
      date: format(d, "MMM d"),
      mood: entry?.mood ? moodValues[entry.mood] : null,
    };
  }).filter(d => d.mood !== null);

  // Entries per week data (last 8 weeks)
  const barData = Array.from({ length: 8 }, (_, i) => {
    const weekStart = startOfWeek(subWeeks(now, 7 - i));
    const weekEnd = endOfWeek(subWeeks(now, 7 - i));
    const count = entries.filter(e => {
      const d = new Date(e.entry_date);
      return d >= weekStart && d <= weekEnd;
    }).length;
    return { week: format(weekStart, "MMM d"), entries: count };
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
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="insight-card col-span-2 glass-card p-5">
              <div className="flex items-center gap-2 mb-1">
                <Icon icon="ph:flame-duotone" className="h-4 w-4 text-primary" />
                <span className="text-xs font-ui text-muted-foreground">Current Streak</span>
              </div>
              <p className="text-4xl font-serif text-foreground">{currentStreak}</p>
              <p className="text-xs font-ui text-muted-foreground mt-1">Best: {longestStreak} days</p>
            </div>
            <div className="flex flex-col gap-3">
              <div className="insight-card glass-card p-4 text-center flex-1 flex flex-col justify-center">
                <Icon icon="ph:file-text-duotone" className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
                <p className="text-2xl font-serif text-foreground">{totalEntries}</p>
                <p className="text-[10px] font-ui text-muted-foreground">Entries</p>
              </div>
              <div className="insight-card glass-card p-4 text-center flex-1 flex flex-col justify-center">
                <p className="text-2xl font-serif text-foreground">{avgMood > 0 ? avgMood.toFixed(1) : "—"}</p>
                <p className="text-[10px] font-ui text-muted-foreground">Avg Mood</p>
              </div>
            </div>
          </div>

          {/* Line Graph: Mood Over Time */}
          <div className="insight-card glass-card p-5">
            <h3 className="font-ui text-xs text-muted-foreground mb-4">Mood Over Time</h3>
            {moodLineData.length > 1 ? (
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={moodLineData}>
                  <defs>
                    <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[1, 5]} tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={20} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "12px" }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                  />
                  <Area type="monotone" dataKey="mood" stroke="hsl(var(--primary))" fill="url(#moodGrad)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-8">Not enough mood data yet</p>
            )}
          </div>

          {/* Bar Graph: Entries Per Week */}
          <div className="insight-card glass-card p-5">
            <h3 className="font-ui text-xs text-muted-foreground mb-4">Entries Per Week</h3>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={barData}>
                <XAxis dataKey="week" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={20} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "12px" }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Bar dataKey="entries" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly progress */}
          <div className="insight-card glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Icon icon="ph:trend-up-duotone" className="h-4 w-4 text-primary" />
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
