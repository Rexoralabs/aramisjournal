import { useState, useRef, useLayoutEffect, useCallback } from "react";
import { Icon } from "@iconify/react";
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
  const [isAnimating, setIsAnimating] = useState(false);
  const { data: entries = [] } = useJournalEntries();
  
  const containerRef = useRef<HTMLDivElement>(null);
  const monthRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power2.out" });
    }
  }, []);

  const handlePrevMonth = useCallback(() => {
    if (isAnimating || !monthRef.current) return;
    setIsAnimating(true);
    haptic('selection');
    
    gsap.to(monthRef.current, {
      rotateX: 90,
      opacity: 0,
      duration: 0.3,
      ease: "power2.in",
      transformOrigin: "top center",
      onComplete: () => {
        setCurrentMonth(prev => subMonths(prev, 1));
        gsap.fromTo(monthRef.current,
          { rotateX: -90, opacity: 0, transformOrigin: "bottom center" },
          { rotateX: 0, opacity: 1, duration: 0.3, ease: "power2.out", onComplete: () => setIsAnimating(false) }
        );
      }
    });
  }, [isAnimating]);

  const handleNextMonth = useCallback(() => {
    if (isAnimating || !monthRef.current) return;
    setIsAnimating(true);
    haptic('selection');
    
    gsap.to(monthRef.current, {
      rotateX: -90,
      opacity: 0,
      duration: 0.3,
      ease: "power2.in",
      transformOrigin: "bottom center",
      onComplete: () => {
        setCurrentMonth(prev => addMonths(prev, 1));
        gsap.fromTo(monthRef.current,
          { rotateX: 90, opacity: 0, transformOrigin: "top center" },
          { rotateX: 0, opacity: 1, duration: 0.3, ease: "power2.out", onComplete: () => setIsAnimating(false) }
        );
      }
    });
  }, [isAnimating]);

  const handleDateSelect = (date: Date) => {
    haptic('light');
    setSelectedDate(date);
  };

  const entriesByDate = entries.reduce((acc, entry) => {
    acc[entry.entry_date] = entry;
    return acc;
  }, {} as Record<string, typeof entries[0]>);

  const selectedEntry = selectedDate 
    ? entriesByDate[format(selectedDate, 'yyyy-MM-dd')]
    : null;

  return (
    <PageContainer>
      <div ref={containerRef} className="space-y-5 pb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-serif text-foreground">Calendar</h1>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between max-w-md mx-auto">
          <button onClick={handlePrevMonth} disabled={isAnimating} className="p-2 rounded-full hover:bg-muted transition-colors touch-target">
            <Icon icon="ph:caret-left" className="h-5 w-5 text-muted-foreground" />
          </button>
          <h2 className="text-lg font-serif text-foreground">{format(currentMonth, "MMMM yyyy")}</h2>
          <button onClick={handleNextMonth} disabled={isAnimating} className="p-2 rounded-full hover:bg-muted transition-colors touch-target">
            <Icon icon="ph:caret-right" className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Calendar Grid with perspective for 3D flip */}
        <div className="max-w-md mx-auto" style={{ perspective: "1000px" }}>
          <div ref={monthRef} className="glass-card p-3">
            <MonthView
              currentMonth={currentMonth}
              selectedDate={selectedDate}
              entriesByDate={entriesByDate}
              onSelectDate={handleDateSelect}
            />
          </div>
        </div>

        {/* Entry Preview */}
        <div className="max-w-md mx-auto lg:max-w-none">
          {selectedDate && <EntryPreview date={selectedDate} entry={selectedEntry} />}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 text-xs font-ui text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span>Has entry</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center">
              <span className="text-[9px] text-primary">T</span>
            </div>
            <span>Today</span>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default CalendarPage;
