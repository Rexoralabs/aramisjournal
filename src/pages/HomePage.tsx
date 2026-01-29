import { format } from "date-fns";
import { motion } from "framer-motion";
import { PageContainer } from "@/components/layout/PageContainer";
import { StreakDisplay } from "@/components/streak/StreakDisplay";
import { DailyPrompt } from "@/components/journal/DailyPrompt";
import { QuickEntry } from "@/components/journal/QuickEntry";
import { useUserProfile } from "@/hooks/useProfile";
import { useUserStreak } from "@/hooks/useStreaks";
import { useJournalEntries } from "@/hooks/useJournal";

// Sample prompts - will be AI generated later
const dailyPrompts = [
  "What moment today made you pause and appreciate life?",
  "If you could give your younger self one piece of advice, what would it be?",
  "What's something you're looking forward to?",
  "Describe a challenge you overcame recently and what it taught you.",
  "What are three things you're grateful for right now?",
  "What would you do if you knew you couldn't fail?",
  "Describe a person who has positively influenced your life.",
];

const getRandomPrompt = () => {
  const today = new Date();
  const index = today.getDate() % dailyPrompts.length;
  return dailyPrompts[index];
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

const moodEmoji: Record<string, string> = {
  amazing: "✨",
  good: "😊",
  okay: "😐",
  down: "😔",
  rough: "😢",
};

const HomePage = () => {
  const currentPrompt = getRandomPrompt();
  const today = new Date();
  
  const { data: profile } = useUserProfile();
  const { data: streakData } = useUserStreak();
  const { data: entries } = useJournalEntries();

  const recentEntries = entries?.slice(0, 2) || [];
  const displayName = profile?.display_name || "Writer";
  const currentStreak = streakData?.current_streak || 0;

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <p className="text-sm text-muted-foreground">
              {format(today, "EEEE")}
            </p>
            <h1 className="text-3xl font-serif text-foreground">
              {format(today, "MMMM d")}
            </h1>
          </div>
          <StreakDisplay count={currentStreak} isActive={currentStreak > 0} />
        </motion.div>

        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="py-4"
        >
          <h2 className="text-xl font-serif text-foreground">
            {getGreeting()}, <span className="text-primary">{displayName}</span>
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Ready to reflect on your day?
          </p>
        </motion.div>

        {/* Daily Prompt */}
        <DailyPrompt prompt={currentPrompt} />

        {/* Quick Entry */}
        <QuickEntry initialPrompt={currentPrompt} />

        {/* Recent Entries Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg text-foreground">Recent</h3>
            <a
              href="/history"
              className="text-sm text-primary hover:text-primary/80 transition-colors"
            >
              View all
            </a>
          </div>

          {recentEntries.length === 0 ? (
            <div className="glass-card p-6 text-center">
              <p className="text-muted-foreground">
                No entries yet. Start writing your first journal entry!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentEntries.map((entry, i) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="glass-card p-4 cursor-pointer hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(entry.entry_date), "MMMM d")}
                      </p>
                      <p className="mt-1 line-clamp-2 text-sm text-foreground/80">
                        {entry.content.slice(0, 100)}
                        {entry.content.length > 100 ? "..." : ""}
                      </p>
                    </div>
                    {entry.mood && (
                      <span className="text-xl ml-2">
                        {moodEmoji[entry.mood]}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </PageContainer>
  );
};

export default HomePage;
