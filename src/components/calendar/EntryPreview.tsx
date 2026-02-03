import { useRef, useLayoutEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { PenLine } from "lucide-react";
import gsap from "gsap";
import { JournalEntry } from "@/hooks/useJournal";
import { haptic } from "@/lib/haptics";

interface EntryPreviewProps {
  date: Date;
  entry: JournalEntry | null;
}

export function EntryPreview({ date, entry }: EntryPreviewProps) {
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }
      );
    }
  }, [date]);

  const handleNavigate = () => {
    haptic('light');
    navigate('/write', { state: { date: format(date, 'yyyy-MM-dd') } });
  };

  if (!entry) {
    return (
      <div ref={cardRef} className="glass-card p-5">
        <div className="text-center space-y-3">
          <p className="text-muted-foreground font-sans">
            No entry for {format(date, "MMMM d, yyyy")}
          </p>
          <button
            onClick={handleNavigate}
            className="btn-luxury inline-flex items-center gap-2"
          >
            <PenLine className="h-4 w-4" />
            Write Entry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={cardRef} className="glass-card p-5 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-serif text-lg text-foreground">
            {entry.title || format(date, "MMMM d")}
          </h3>
          <p className="text-xs font-ui text-muted-foreground">
            {format(new Date(entry.created_at), "h:mm a")}
          </p>
        </div>
        {entry.mood && (
          <span className="text-xs font-ui bg-primary/10 text-primary px-2 py-1 rounded-full capitalize">
            {entry.mood}
          </span>
        )}
      </div>

      <p className="text-sm text-muted-foreground line-clamp-3 font-sans">
        {entry.content}
      </p>

      <div className="flex items-center justify-between pt-2 border-t border-border/50">
        <span className="text-xs font-ui text-muted-foreground">
          {entry.word_count} words
        </span>
        <button
          onClick={handleNavigate}
          className="text-xs font-ui text-primary hover:underline"
        >
          Edit Entry →
        </button>
      </div>
    </div>
  );
}
