import { useState, useRef, useLayoutEffect } from "react";
import { Icon } from "@iconify/react";
import gsap from "gsap";
import { PageContainer } from "@/components/layout/PageContainer";
import { ThoughtCard } from "@/components/cellar/ThoughtCard";
import { CellarAISidebar } from "@/components/cellar/CellarAISidebar";
import { useJournalEntries } from "@/hooks/useJournal";
import { haptic } from "@/lib/haptics";

const CellarPage = () => {
  const [aiSidebarOpen, setAiSidebarOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: entries = [] } = useJournalEntries();

  useLayoutEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power2.out" });
    }
  }, []);

  return (
    <PageContainer>
      <div ref={containerRef} className="pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-serif text-foreground">The Cellar</h1>
            <p className="text-sm text-muted-foreground font-ui mt-1">Your stored reflections</p>
          </div>
          <button
            onClick={() => {
              haptic("selection");
              setAiSidebarOpen(true);
            }}
            className="h-10 w-10 rounded-2xl bg-primary/15 flex items-center justify-center hover:bg-primary/25 transition-colors touch-target"
          >
            <Icon icon="solar:stars-bold-duotone" className="h-5 w-5 text-primary" />
          </button>
        </div>

        {/* Masonry Grid */}
        {entries.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-emphasis text-lg text-muted-foreground">Your cellar is empty.</p>
            <p className="text-sm text-muted-foreground font-ui mt-2">Start writing in the Write module to see your entries here.</p>
          </div>
        ) : (
          <div className="masonry-grid">
            {entries.map((entry) => (
              <ThoughtCard key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </div>

      {/* AI Sidebar */}
      <CellarAISidebar
        isOpen={aiSidebarOpen}
        onClose={() => setAiSidebarOpen(false)}
        entries={entries}
      />
    </PageContainer>
  );
};

export default CellarPage;
