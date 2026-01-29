import { motion } from "framer-motion";
import { TrendingUp, Award, Brain } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { StreakDisplay } from "@/components/streak/StreakDisplay";
import { useUserStreak, useUserMilestones } from "@/hooks/useStreaks";
import { useJournalEntries } from "@/hooks/useJournal";

const milestoneData = [
  { days: 7, title: "First Week", icon: "🔥" },
  { days: 30, title: "Monthly Master", icon: "⭐" },
  { days: 60, title: "Dedicated Writer", icon: "💫" },
  { days: 100, title: "Century Club", icon: "🏆" },
  { days: 365, title: "Year of Reflection", icon: "👑" },
];

const InsightsPage = () => {
  const { data: streakData, isLoading: loadingStreak } = useUserStreak();
  const { data: milestones = [] } = useUserMilestones();
  const { data: entries = [] } = useJournalEntries();

  const currentStreak = streakData?.current_streak || 0;
  const longestStreak = streakData?.longest_streak || 0;
  const totalEntries = streakData?.total_entries || 0;

  // Calculate mood data from entries
  const moodValues: Record<string, number> = {
    amazing: 5,
    good: 4,
    okay: 3,
    down: 2,
    rough: 1,
  };

  const recentEntries = entries.slice(0, 7);
  const avgMood = recentEntries.length > 0
    ? recentEntries.reduce((sum, e) => sum + (e.mood ? moodValues[e.mood] : 3), 0) / recentEntries.length
    : 0;

  const avgWords = totalEntries > 0
    ? Math.round(entries.reduce((sum, e) => sum + (e.word_count || 0), 0) / entries.length)
    : 0;

  // Get week data for chart
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const moodData = days.map((day, i) => {
    const entry = recentEntries[6 - i];
    return {
      day,
      mood: entry?.mood ? moodValues[entry.mood] : 0,
    };
  }).reverse();

  const achievedMilestones = new Set(milestones.map(m => m.milestone_days));

  if (loadingStreak) {
    return (
      <PageContainer className="flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-serif text-foreground">Insights</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your journaling journey
          </p>
        </motion.div>

        {/* Streak Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card-glow p-5"
        >
          <div className="flex items-center justify-between">
            <StreakDisplay count={currentStreak} isActive={currentStreak > 0} />
            <div className="text-right">
              <p className="text-2xl font-serif font-bold text-foreground">
                {longestStreak}
              </p>
              <p className="text-xs text-muted-foreground">longest streak</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-border/50">
            <div className="text-center">
              <p className="text-xl font-serif font-bold text-foreground">
                {totalEntries}
              </p>
              <p className="text-xs text-muted-foreground">total entries</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-serif font-bold text-foreground">
                {avgMood > 0 ? avgMood.toFixed(1) : "—"}
              </p>
              <p className="text-xs text-muted-foreground">avg mood</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-serif font-bold text-foreground">
                {avgWords || "—"}
              </p>
              <p className="text-xs text-muted-foreground">avg words</p>
            </div>
          </div>
        </motion.div>

        {/* Mood Trend */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="font-serif text-lg text-foreground">Mood Trend</h3>
          </div>

          {entries.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              Start journaling to see your mood trends
            </p>
          ) : (
            <div className="flex items-end justify-between gap-2 h-24">
              {moodData.map((d, i) => (
                <motion.div
                  key={d.day}
                  initial={{ height: 0 }}
                  animate={{ height: d.mood > 0 ? `${(d.mood / 5) * 100}%` : "10%" }}
                  transition={{ delay: 0.3 + i * 0.05, duration: 0.5 }}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <div
                    className={`w-full rounded-t-md transition-all ${
                      d.mood > 0 ? "bg-primary" : "bg-muted"
                    }`}
                    style={{ height: "100%" }}
                  />
                  <span className="text-xs text-muted-foreground">{d.day}</span>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* AI Weekly Summary */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Brain className="h-5 w-5 text-primary" />
            <h3 className="font-serif text-lg text-foreground">Weekly Reflection</h3>
          </div>

          {entries.length === 0 ? (
            <p className="text-muted-foreground">
              Write your first entry to get personalized AI insights about your journaling patterns.
            </p>
          ) : (
            <>
              <p className="text-sm text-foreground/80 leading-relaxed">
                {entries.length < 3 
                  ? "Keep journaling! After a few more entries, I'll be able to identify themes and patterns in your writing."
                  : `You've been exploring themes of reflection and personal growth. Your entries show ${
                      avgMood >= 4 ? "a positive trend" : avgMood >= 3 ? "a balanced emotional state" : "some challenging moments"
                    }. Keep up the great work with your ${currentStreak} day streak!`
                }
              </p>

              {entries.length >= 3 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {["reflection", "growth", "mindfulness"].map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full bg-primary/10 text-xs text-primary font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </>
          )}
        </motion.div>

        {/* Milestones */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            <h3 className="font-serif text-lg text-foreground">Milestones</h3>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {milestoneData.map((m, i) => {
              const achieved = achievedMilestones.has(m.days);
              return (
                <motion.div
                  key={m.days}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className={`flex flex-col items-center p-3 rounded-xl ${
                    achieved
                      ? "glass-card-glow"
                      : "glass-card opacity-50"
                  }`}
                >
                  <span className="text-2xl">{m.icon}</span>
                  <span className="text-xs font-medium text-foreground mt-1">
                    {m.days}
                  </span>
                  <span className="text-[10px] text-muted-foreground text-center">
                    days
                  </span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </PageContainer>
  );
};

export default InsightsPage;
