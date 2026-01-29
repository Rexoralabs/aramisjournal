import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameDay } from "date-fns";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PageContainer } from "@/components/layout/PageContainer";
import { useJournalEntries } from "@/hooks/useJournal";

const moodEmoji: Record<string, string> = {
  amazing: "✨",
  good: "😊",
  okay: "😐",
  down: "😔",
  rough: "😢",
};

const HistoryPage = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { data: entries = [], isLoading } = useJournalEntries();

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get the day of week the month starts on (0 = Sunday)
  const startDay = monthStart.getDay();
  const paddingDays = Array(startDay).fill(null);

  const entriesByDate = entries.reduce((acc, entry) => {
    const dateKey = entry.entry_date;
    acc[dateKey] = entry;
    return acc;
  }, {} as Record<string, typeof entries[0]>);

  const filteredEntries = entries.filter((entry) =>
    entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (entry.title && entry.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (isLoading) {
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
          <h1 className="text-3xl font-serif text-foreground">History</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse your journal entries
          </p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative"
        >
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search entries..."
            className="w-full rounded-xl bg-input/50 py-3 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </motion.div>

        {/* Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-4"
        >
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
              className="p-2 rounded-full hover:bg-muted transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-muted-foreground" />
            </button>
            <h3 className="font-serif text-lg text-foreground">
              {format(currentMonth, "MMMM yyyy")}
            </h3>
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
              className="p-2 rounded-full hover:bg-muted transition-colors"
            >
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
              <div key={i} className="text-center text-xs text-muted-foreground py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {paddingDays.map((_, i) => (
              <div key={`pad-${i}`} className="aspect-square" />
            ))}
            {daysInMonth.map((day) => {
              const dateKey = format(day, "yyyy-MM-dd");
              const hasEntry = entriesByDate[dateKey];
              const isSelected = selectedDate && isSameDay(day, selectedDate);

              return (
                <motion.button
                  key={dateKey}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedDate(hasEntry ? day : null)}
                  className={`aspect-square rounded-lg flex items-center justify-center text-sm transition-all relative ${
                    isToday(day)
                      ? "ring-2 ring-primary"
                      : ""
                  } ${
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : hasEntry
                      ? "bg-primary/20 text-foreground hover:bg-primary/30"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {format(day, "d")}
                  {hasEntry && !isSelected && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px]">
                      {hasEntry.mood ? moodEmoji[hasEntry.mood] : "📝"}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Entries List */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <h3 className="font-serif text-lg text-foreground">
            {searchQuery ? "Search Results" : "All Entries"}
          </h3>

          <AnimatePresence>
            {filteredEntries.length === 0 ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-muted-foreground py-8"
              >
                {entries.length === 0 
                  ? "No entries yet. Start your journaling journey!"
                  : "No entries found"}
              </motion.p>
            ) : (
              <div className="space-y-2">
                {filteredEntries.map((entry, i) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass-card p-4 cursor-pointer hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(entry.entry_date), "EEEE, MMMM d")}
                        </p>
                        {entry.title && (
                          <p className="font-medium text-foreground mt-1">{entry.title}</p>
                        )}
                        <p className="mt-1 line-clamp-2 text-sm text-foreground/80">
                          {entry.content.slice(0, 120)}
                          {entry.content.length > 120 ? "..." : ""}
                        </p>
                      </div>
                      {entry.mood && (
                        <span className="text-xl ml-2">{moodEmoji[entry.mood]}</span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </PageContainer>
  );
};

export default HistoryPage;
