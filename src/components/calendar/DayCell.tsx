import { isToday, format } from "date-fns";
import { cn } from "@/lib/utils";

interface DayCellProps {
  date: Date;
  isCurrentMonth: boolean;
  isSelected: boolean;
  hasEntry: boolean;
  onSelect: (date: Date) => void;
}

export function DayCell({
  date,
  isCurrentMonth,
  isSelected,
  hasEntry,
  onSelect,
}: DayCellProps) {
  const today = isToday(date);
  const dayNumber = format(date, "d");

  return (
    <button
      onClick={() => onSelect(date)}
      className={cn(
        "relative aspect-square flex flex-col items-center justify-center rounded-xl transition-all touch-target",
        "min-h-[44px] text-sm font-ui",
        !isCurrentMonth && "opacity-30",
        isSelected && "bg-primary/20 border border-primary/40",
        !isSelected && isCurrentMonth && "hover:bg-muted/50",
        today && !isSelected && "border-2 border-primary"
      )}
    >
      <span
        className={cn(
          "transition-colors",
          today ? "text-primary font-medium" : "text-foreground",
          isSelected && "text-primary font-medium"
        )}
      >
        {dayNumber}
      </span>

      {/* Entry indicator dot */}
      {hasEntry && (
        <div
          className={cn(
            "absolute bottom-1.5 w-1.5 h-1.5 rounded-full",
            isSelected ? "bg-primary" : "bg-primary/60"
          )}
        />
      )}
    </button>
  );
}
