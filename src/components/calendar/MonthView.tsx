import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth,
  format 
} from "date-fns";
import { DayCell } from "./DayCell";
import { JournalEntry } from "@/hooks/useJournal";

interface MonthViewProps {
  currentMonth: Date;
  selectedDate: Date | null;
  entriesByDate: Record<string, JournalEntry>;
  onSelectDate: (date: Date) => void;
}

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function MonthView({ 
  currentMonth, 
  selectedDate, 
  entriesByDate, 
  onSelectDate 
}: MonthViewProps) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  return (
    <div className="space-y-3">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-ui text-muted-foreground py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const hasEntry = !!entriesByDate[dateKey];
          const isCurrentMonth = isSameMonth(day, currentMonth);

          return (
            <DayCell
              key={dateKey}
              date={day}
              isCurrentMonth={isCurrentMonth}
              isSelected={selectedDate ? format(selectedDate, 'yyyy-MM-dd') === dateKey : false}
              hasEntry={hasEntry}
              onSelect={onSelectDate}
            />
          );
        })}
      </div>
    </div>
  );
}
