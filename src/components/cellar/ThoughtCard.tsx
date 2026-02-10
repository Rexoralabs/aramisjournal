import { Trash2 } from "lucide-react";
import { format } from "date-fns";
import type { CellarThought } from "@/hooks/useCellar";

interface ThoughtCardProps {
  thought: CellarThought;
  onDelete: (id: string) => void;
}

export function ThoughtCard({ thought, onDelete }: ThoughtCardProps) {
  return (
    <div className="thought-card group relative">
      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
        {thought.content}
      </p>
      <div className="flex items-center justify-between mt-3">
        <span className="text-xs text-muted-foreground font-ui">
          {format(new Date(thought.created_at), "MMM d")}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(thought.id);
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-destructive/10"
        >
          <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
        </button>
      </div>
    </div>
  );
}
