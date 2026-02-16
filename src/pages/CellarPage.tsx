import { useState, useRef, useLayoutEffect, useMemo } from "react";
import { Icon } from "@iconify/react";
import gsap from "gsap";
import { PageContainer } from "@/components/layout/PageContainer";
import { ThoughtCard } from "@/components/cellar/ThoughtCard";
import { CellarAISidebar } from "@/components/cellar/CellarAISidebar";
import { useJournalEntries } from "@/hooks/useJournal";
import { useCategorizeEntries } from "@/hooks/useCellarAI";
import { haptic } from "@/lib/haptics";

const CellarPage = () => {
  const [aiSidebarOpen, setAiSidebarOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: entries = [] } = useJournalEntries();
  const { categorize, isLoading: isCategorizing } = useCategorizeEntries();

  useLayoutEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power2.out" });
    }
  }, []);

  // Derive categories from entries
  const categories = useMemo(() => {
    const cats = new Set<string>();
    entries.forEach(e => { if (e.ai_category) cats.add(e.ai_category); });
    return ["All", ...Array.from(cats).sort()];
  }, [entries]);

  // Filter and sort: pinned first, then by filter
  const filteredEntries = useMemo(() => {
    let filtered = entries;
    if (activeFilter !== "All") {
      filtered = entries.filter(e => e.ai_category === activeFilter);
    }
    return [...filtered].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return 0;
    });
  }, [entries, activeFilter]);

  // Group by category when "All" is selected and categories exist
  const hasCategories = categories.length > 1;
  const groupedEntries = useMemo(() => {
    if (activeFilter !== "All" || !hasCategories) return null;
    const groups: Record<string, typeof entries> = {};
    filteredEntries.forEach(e => {
      const cat = e.ai_category || "Uncategorized";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(e);
    });
    return groups;
  }, [filteredEntries, activeFilter, hasCategories]);

  const handleCategorize = () => {
    haptic("medium");
    categorize(entries);
  };

  return (
    <PageContainer>
      <div ref={containerRef} className="pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-serif text-foreground">The Cellar</h1>
            <p className="text-sm text-muted-foreground font-ui mt-1">Your stored reflections</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCategorize}
              disabled={isCategorizing || entries.length === 0}
              className="h-10 w-10 rounded-2xl bg-primary/15 flex items-center justify-center hover:bg-primary/25 transition-colors touch-target disabled:opacity-50"
              title="AI Categorize"
            >
              {isCategorizing ? (
                <span className="h-4 w-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              ) : (
                <Icon icon="ph:sparkle-duotone" className="h-5 w-5 text-primary" />
              )}
            </button>
            <button
              onClick={() => { haptic("selection"); setAiSidebarOpen(true); }}
              className="h-10 w-10 rounded-2xl bg-primary/15 flex items-center justify-center hover:bg-primary/25 transition-colors touch-target"
              title="AI Chat"
            >
              <Icon icon="ph:chat-teardrop-dots-duotone" className="h-5 w-5 text-primary" />
            </button>
          </div>
        </div>

        {/* Topic Filter Pills */}
        {hasCategories && (
          <div className="mb-6">
            <p className="text-xs font-ui text-muted-foreground uppercase tracking-wider mb-3 text-center">Topics</p>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => { haptic("light"); setActiveFilter(cat); }}
                  className={`px-4 py-1.5 rounded-full text-xs font-ui whitespace-nowrap transition-all ${
                    activeFilter === cat
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        {entries.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-emphasis text-lg text-muted-foreground">Your cellar is empty.</p>
            <p className="text-sm text-muted-foreground font-ui mt-2">Start writing in the Compose module to see your entries here.</p>
          </div>
        ) : groupedEntries ? (
          // Grouped masonry view
          <div className="space-y-8">
            {Object.entries(groupedEntries).map(([category, catEntries]) => (
              <div key={category}>
                <h2 className="text-sm font-ui text-muted-foreground uppercase tracking-wider mb-3 px-1">{category}</h2>
                <div className="masonry-grid">
                  {catEntries.map(entry => (
                    <ThoughtCard key={entry.id} entry={entry} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Flat masonry view
          <div className="masonry-grid">
            {filteredEntries.map(entry => (
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
