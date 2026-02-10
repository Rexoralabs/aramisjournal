import { useState, useRef, useLayoutEffect } from "react";
import { Sparkles } from "lucide-react";
import gsap from "gsap";
import { PageContainer } from "@/components/layout/PageContainer";
import { ThoughtCard } from "@/components/cellar/ThoughtCard";
import { AddThoughtDialog } from "@/components/cellar/AddThoughtDialog";
import { CellarAISidebar } from "@/components/cellar/CellarAISidebar";
import { useCellarThoughts, useCreateThought, useDeleteThought } from "@/hooks/useCellar";
import { haptic } from "@/lib/haptics";

const CellarPage = () => {
  const [aiSidebarOpen, setAiSidebarOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: thoughts = [] } = useCellarThoughts();
  const createThought = useCreateThought();
  const deleteThought = useDeleteThought();

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
            <p className="text-sm text-muted-foreground font-ui mt-1">Store your loose thoughts</p>
          </div>
          <button
            onClick={() => {
              haptic("selection");
              setAiSidebarOpen(true);
            }}
            className="h-10 w-10 rounded-2xl bg-primary/15 flex items-center justify-center hover:bg-primary/25 transition-colors touch-target"
          >
            <Sparkles className="h-5 w-5 text-primary" />
          </button>
        </div>

        {/* Masonry Grid */}
        {thoughts.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-emphasis text-lg text-muted-foreground">Your cellar is empty.</p>
            <p className="text-sm text-muted-foreground font-ui mt-2">Tap + to store your first thought.</p>
          </div>
        ) : (
          <div className="masonry-grid">
            {thoughts.map((thought) => (
              <ThoughtCard
                key={thought.id}
                thought={thought}
                onDelete={(id) => deleteThought.mutate(id)}
              />
            ))}
          </div>
        )}

        {/* FAB */}
        <AddThoughtDialog onAdd={(content) => createThought.mutate({ content })} />
      </div>

      {/* AI Sidebar */}
      <CellarAISidebar
        isOpen={aiSidebarOpen}
        onClose={() => setAiSidebarOpen(false)}
        thoughts={thoughts}
      />
    </PageContainer>
  );
};

export default CellarPage;
