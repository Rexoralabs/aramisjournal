import { useState, useRef, useLayoutEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, addMonths, subMonths } from "date-fns";
import gsap from "gsap";
import { PageContainer } from "@/components/layout/PageContainer";
import { MonthView } from "@/components/calendar/MonthView";
import { EntryPreview } from "@/components/calendar/EntryPreview";
import { useJournalEntries } from "@/hooks/useJournal";
import { haptic } from "@/lib/haptics";

const CalendarPage = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { data: entries = [] } = useJournalEntries();
  
  const containerRef = useRef<HTMLDivElement>(null);
  const monthRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.4, ease: "power2.out" }
      );
    }
  }, []);

  const handlePrevMonth = () => {
    haptic('selection');
    gsap.to(monthRef.current, {
      x: 20,
      opacity: 0,
      duration: 0.15,
      onComplete: () => {
        setCurrentMonth(subMonths(currentMonth, 1));
        gsap.fromTo(monthRef.current, 
          { x: -20, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.15 }
        );
      }
    });
  };

  const handleNextMonth = () => {
    haptic('selection');
    gsap.to(monthRef.current, {
      x: -20,
      opacity: 0,
      duration: 0.15,
      onComplete: () => {
        setCurrentMonth(addMonths(currentMonth, 1));
        gsap.fromTo(monthRef.current, 
          { x: 20, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.15 }
        );
      }
    });
  };

  const handleDateSelect = (date: Date) => {
    haptic('light');
    setSelectedDate(date);
  };

  // Get entries mapped by date string
  const entriesByDate = entries.reduce((acc, entry) => {
    acc[entry.entry_date] = entry;
    return acc;
  }, {} as Record<string, typeof entries[0]>);

  const selectedEntry = selectedDate 
    ? entriesByDate[format(selectedDate, 'yyyy-MM-dd')]
    : null;

  return (
    <PageContainer>
      <div ref={containerRef} className="space-y-6 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-serif text-foreground">Calendar</h1>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-full hover:bg-muted transition-colors touch-target"
          >
            <ChevronLeft className="h-5 w-5 text-muted-foreground" />
          </button>
          
          <h2 className="text-xl font-serif text-foreground">
            {format(currentMonth, "MMMM yyyy")}
          </h2>
          
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-full hover:bg-muted transition-colors touch-target"
          >
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div ref={monthRef} className="glass-card p-4">
          <MonthView
            currentMonth={currentMonth}
            selectedDate={selectedDate}
            entriesByDate={entriesByDate}
            onSelectDate={handleDateSelect}
          />
        </div>

        {/* Entry Preview */}
        {selectedDate && (
          <EntryPreview
            date={selectedDate}
            entry={selectedEntry}
          />
        )}

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 text-xs font-ui text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span>Has entry</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full border-2 border-primary flex items-center justify-center">
              <span className="text-[10px] text-primary">T</span>
            </div>
            <span>Today</span>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default CalendarPage;
