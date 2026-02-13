import { useState, useRef, useLayoutEffect, useMemo } from "react";
import { format, subDays, subWeeks, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { Icon } from "@iconify/react";
import gsap from "gsap";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { PageContainer } from "@/components/layout/PageContainer";
import { useJournalEntries } from "@/hooks/useJournal";
import { useUserStreak } from "@/hooks/useStreaks";

type TimeFilter = "7d" | "30d" | "all";

const moodValues: Record<string, number> = { amazing: 5, good: 4, okay: 3, down: 2, rough: 1 };
const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const InsightsPage = () => {
  const [filter, setFilter] = useState<TimeFilter>("30d");
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: entries = [] } = useJournalEntries();
  const { data: streakData } = useUserStreak();

  const now = new Date();
  const currentStreak = streakData?.current_streak || 0;
  const longestStreak = streakData?.longest_streak || 0;
  const totalPoints = (streakData as any)?.total_points || 0;

  const filterDays = filter === "7d" ? 7 : filter === "30d" ? 30 : 365;

  const filteredEntries = useMemo(() => {
    if (filter === "all") return entries;
    const cutoff = subDays(now, filterDays);
    return entries.filter((e) => new Date(e.entry_date) >= cutoff);
  }, [entries, filter, filterDays]);

  // Stats
  const totalWords = filteredEntries.reduce((s, e) => s + (e.word_count || 0), 0);
  const todayWords = entries.find((e) => e.entry_date === format(now, "yyyy-MM-dd"))?.word_count || 0;
  const thisWeekEntries = entries.filter((e) => {
    const d = new Date(e.entry_date);
    return d >= startOfWeek(now) && d <= endOfWeek(now);
  }).length;

  // Word count trend
  const wordTrendData = useMemo(() => {
    return Array.from({ length: filterDays }, (_, i) => {
      const d = subDays(now, filterDays - 1 - i);
      const dateStr = format(d, "yyyy-MM-dd");
      const entry = entries.find((e) => e.entry_date === dateStr);
      return { date: format(d, "MMM d"), words: entry?.word_count || 0 };
    });
  }, [entries, filterDays]);

  // Mood trend
  const moodData = useMemo(() => {
    return Array.from({ length: filterDays }, (_, i) => {
      const d = subDays(now, filterDays - 1 - i);
      const dateStr = format(d, "yyyy-MM-dd");
      const entry = entries.find((e) => e.entry_date === dateStr);
      return { date: format(d, "MMM d"), mood: entry?.mood ? moodValues[entry.mood] : null };
    }).filter((d) => d.mood !== null);
  }, [entries, filterDays]);

  // Entries per week
  const barData = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => {
      const ws = startOfWeek(subWeeks(now, 7 - i));
      const we = endOfWeek(subWeeks(now, 7 - i));
      const count = entries.filter((e) => { const d = new Date(e.entry_date); return d >= ws && d <= we; }).length;
      return { week: format(ws, "MMM d"), entries: count };
    });
  }, [entries]);

  // Day-of-week activity
  const dayActivity = useMemo(() => {
    const counts = Array(7).fill(0);
    entries.forEach((e) => { counts[new Date(e.entry_date).getDay()]++; });
    const max = Math.max(...counts, 1);
    return dayNames.map((name, i) => ({ name, count: counts[i], pct: (counts[i] / max) * 100 }));
  }, [entries]);

  // Monthly progress
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const entryDates = new Set(entries.map((e) => e.entry_date));
  const writingDaysThisMonth = daysInMonth.filter((d) => entryDates.has(format(d, "yyyy-MM-dd"))).length;
  const monthPercent = Math.round((writingDaysThisMonth / daysInMonth.length) * 100);

  // Sparkline data for stat cards (last 7 days of word counts)
  const sparkData = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = subDays(now, 6 - i);
      const entry = entries.find((e) => e.entry_date === format(d, "yyyy-MM-dd"));
      return { v: entry?.word_count || 0 };
    });
  }, [entries]);

  useLayoutEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power2.out" });
      const cards = containerRef.current.querySelectorAll(".stat-card");
      gsap.fromTo(cards, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.35, stagger: 0.05, delay: 0.1, ease: "power2.out" });
    }
  }, []);

  const tooltipStyle = {
    contentStyle: { background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "12px" },
    labelStyle: { color: "hsl(var(--foreground))" },
  };

  const MiniSparkline = () => (
    <ResponsiveContainer width={60} height={24}>
      <LineChart data={sparkData}>
        <Line type="monotone" dataKey="v" stroke="hsl(var(--primary))" strokeWidth={1.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );

  return (
    <PageContainer>
      <div ref={containerRef} className="space-y-5 pb-24">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif text-foreground">Insights</h1>
            <p className="text-muted-foreground font-ui text-sm mt-1">Your writing patterns</p>
          </div>
          {totalPoints > 0 && (
            <div className="flex items-center gap-1.5 bg-primary/10 px-3 py-1.5 rounded-full">
              <Icon icon="ph:star-duotone" className="h-4 w-4 text-primary" />
              <span className="text-sm font-ui text-primary font-medium">{totalPoints}</span>
            </div>
          )}
        </div>

        {/* Filter pills */}
        <div className="flex gap-2">
          {(["7d", "30d", "all"] as TimeFilter[]).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full font-ui text-xs transition-all ${filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
              {f === "7d" ? "7 Days" : f === "30d" ? "30 Days" : "All Time"}
            </button>
          ))}
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="stat-card glass-card p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-ui text-muted-foreground uppercase tracking-wider">Today</span>
              <MiniSparkline />
            </div>
            <p className="text-3xl font-serif text-foreground">{todayWords}</p>
            <p className="text-[10px] font-ui text-muted-foreground">words written</p>
          </div>
          <div className="stat-card glass-card p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-ui text-muted-foreground uppercase tracking-wider">This Week</span>
              <Icon icon="ph:calendar-check-duotone" className="h-4 w-4 text-primary" />
            </div>
            <p className="text-3xl font-serif text-foreground">{thisWeekEntries}</p>
            <p className="text-[10px] font-ui text-muted-foreground">entries</p>
          </div>
          <div className="stat-card glass-card p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-ui text-muted-foreground uppercase tracking-wider">Streak</span>
              <Icon icon="ph:fire-duotone" className="h-4 w-4 text-primary" />
            </div>
            <p className="text-3xl font-serif text-foreground">{currentStreak}</p>
            <p className="text-[10px] font-ui text-muted-foreground">best: {longestStreak}</p>
          </div>
          <div className="stat-card glass-card p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-ui text-muted-foreground uppercase tracking-wider">Total Words</span>
              <Icon icon="ph:article-duotone" className="h-4 w-4 text-primary" />
            </div>
            <p className="text-3xl font-serif text-foreground">{totalWords.toLocaleString()}</p>
            <p className="text-[10px] font-ui text-muted-foreground">{filteredEntries.length} entries</p>
          </div>
        </div>

        {/* Main chart — Word count over time */}
        <div className="glass-card p-5">
          <h3 className="font-ui text-xs text-muted-foreground mb-4 uppercase tracking-wider">Word Count Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={wordTrendData}>
              <defs>
                <linearGradient id="wordGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={30} />
              <Tooltip {...tooltipStyle} />
              <Area type="monotone" dataKey="words" stroke="hsl(var(--primary))" fill="url(#wordGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Secondary charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="glass-card p-5">
            <h3 className="font-ui text-xs text-muted-foreground mb-4 uppercase tracking-wider">Entries Per Week</h3>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={barData}>
                <XAxis dataKey="week" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={20} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="entries" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="glass-card p-5">
            <h3 className="font-ui text-xs text-muted-foreground mb-4 uppercase tracking-wider">Mood Over Time</h3>
            {moodData.length > 1 ? (
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={moodData}>
                  <defs>
                    <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[1, 5]} tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={20} />
                  <Tooltip {...tooltipStyle} />
                  <Area type="monotone" dataKey="mood" stroke="hsl(var(--primary))" fill="url(#moodGrad)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-8">Not enough mood data yet</p>
            )}
          </div>
        </div>

        {/* Day of week activity */}
        <div className="glass-card p-5">
          <h3 className="font-ui text-xs text-muted-foreground mb-4 uppercase tracking-wider">Writing Activity by Day</h3>
          <div className="flex items-end justify-between gap-2 h-20">
            {dayActivity.map((day) => (
              <div key={day.name} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full rounded-t-md bg-primary/20 relative" style={{ height: `${Math.max(day.pct, 4)}%` }}>
                  <div className="absolute inset-0 rounded-t-md bg-primary" style={{ height: `${day.pct}%` }} />
                </div>
                <span className="text-[9px] font-ui text-muted-foreground">{day.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly progress */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Icon icon="ph:trend-up-duotone" className="h-4 w-4 text-primary" />
              <span className="font-ui text-xs text-muted-foreground">{format(now, "MMMM")} Progress</span>
            </div>
            <span className="text-xs font-ui text-primary font-medium">{monthPercent}%</span>
          </div>
          <div className="flex items-baseline gap-1 mb-3">
            <span className="text-3xl font-serif text-foreground">{writingDaysThisMonth}</span>
            <span className="text-sm text-muted-foreground font-ui">/ {daysInMonth.length} days</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${monthPercent}%` }} />
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default InsightsPage;
