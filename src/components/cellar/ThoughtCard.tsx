import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useTogglePin } from "@/hooks/useJournal";
import { haptic } from "@/lib/haptics";
import { Badge } from "@/components/ui/badge";
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
  const navigate = useNavigate();
  const togglePin = useTogglePin();
  const preview = entry.content.length > 120
    ? entry.content.slice(0, 120) + "…"
    : entry.content;

  const handlePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    haptic("light");
    togglePin.mutate({ id: entry.id, pinned: !entry.pinned });
  };

  return (
    <div
      className="thought-card group relative cursor-pointer hover:scale-[1.02] transition-transform"
      onClick={() => navigate(`/compose?entry=${entry.id}`)}
    >
      {/* Pin button */}
      <button
        onClick={handlePin}
        className={`absolute top-2 right-2 p-1 rounded-lg transition-all z-10 ${
          entry.pinned
            ? "opacity-100 text-primary"
            : "opacity-0 group-hover:opacity-60 text-muted-foreground hover:text-primary"
        }`}
      >
        <Icon icon={entry.pinned ? "ph:push-pin-fill" : "ph:push-pin-duotone"} className="h-3.5 w-3.5" />
      </button>

      {entry.title && (
        <h3 className="text-sm font-serif text-foreground mb-1.5 line-clamp-2 pr-6">
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
        <div className="flex items-center gap-1.5">
          {entry.ai_category && (
            <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
              {entry.ai_category}
            </Badge>
          )}
          {entry.mood && (
            <span className="text-sm">{moodEmoji[entry.mood] || ""}</span>
          )}
        </div>
      </div>
    </div>
  );
}
