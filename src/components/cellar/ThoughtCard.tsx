import { format } from "date-fns";
import type { JournalEntry } from "@/hooks/useJournal";

const moodEmoji: Record<string, string> = {
  amazing: "✨",
  good: "😊",
  okay: "😐",
  down: "😔",
  rough: "😢",
};

interface ThoughtCardProps {
  entry: JournalEntry;
}

export function ThoughtCard({ entry }: ThoughtCardProps) {
  const preview = entry.content.length > 120
    ? entry.content.slice(0, 120) + "…"
    : entry.content;

  return (
    <div className="thought-card group relative">
      {entry.title && (
        <h3 className="text-sm font-serif text-foreground mb-1.5 line-clamp-2">
          {entry.title}
        </h3>
      )}
      <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
        {preview}
      </p>
      <div className="flex items-center justify-between mt-3">
        <span className="text-[10px] text-muted-foreground font-ui">
          {format(new Date(entry.entry_date), "MMM d")}
        </span>
        {entry.mood && (
          <span className="text-sm">{moodEmoji[entry.mood] || ""}</span>
        )}
      </div>
    </div>
  );
}
