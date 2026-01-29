import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { PageContainer } from "@/components/layout/PageContainer";
import { MoodSelector, Mood } from "@/components/journal/MoodSelector";
import { useCreateEntry, useTodayEntry, useUpdateEntry } from "@/hooks/useJournal";
import { useUpdateStreak } from "@/hooks/useStreaks";
import { toast } from "sonner";

interface LocationState {
  mood?: Mood;
  initialContent?: string;
  prompt?: string;
}

const WritePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState | null;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState(state?.initialContent || "");
  const [mood, setMood] = useState<Mood | undefined>(state?.mood);
  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const { data: todayEntry, isLoading: loadingEntry } = useTodayEntry();
  const createEntry = useCreateEntry();
  const updateEntry = useUpdateEntry();
  const updateStreak = useUpdateStreak();

  const today = new Date();

  // Load existing entry if available
  useEffect(() => {
    if (todayEntry && !state?.initialContent) {
      setTitle(todayEntry.title || "");
      setContent(todayEntry.content);
      setMood(todayEntry.mood as Mood | undefined);
    }
  }, [todayEntry, state?.initialContent]);

  // Track changes
  useEffect(() => {
    if (content.length > 0) {
      setHasChanges(true);
    }
  }, [content, title, mood]);

  const handleSave = useCallback(async () => {
    if (!content.trim()) {
      toast.error("Please write something before saving");
      return;
    }

    try {
      if (todayEntry) {
        await updateEntry.mutateAsync({
          id: todayEntry.id,
          title: title || undefined,
          content,
          mood,
        });
      } else {
        await createEntry.mutateAsync({
          title: title || undefined,
          content,
          mood,
          prompt_used: state?.prompt,
        });
        // Update streak when creating new entry
        const result = await updateStreak.mutateAsync();
        if (result.isNewMilestone) {
          toast.success(`🎉 Milestone achieved: ${result.newStreak} day streak!`);
        }
      }
      setHasChanges(false);
      navigate("/");
    } catch (error) {
      // Error handled by mutation
    }
  }, [content, title, mood, todayEntry, state?.prompt, createEntry, updateEntry, updateStreak, navigate]);

  const isSaving = createEntry.isPending || updateEntry.isPending;

  if (loadingEntry) {
    return (
      <PageContainer className="flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="pb-8">
      <div className="space-y-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowMoodSelector(!showMoodSelector)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-muted hover:bg-muted/80 transition-colors"
            >
              {mood ? (
                <span className="text-xl">
                  {mood === "amazing" && "✨"}
                  {mood === "good" && "😊"}
                  {mood === "okay" && "😐"}
                  {mood === "down" && "😔"}
                  {mood === "rough" && "😢"}
                </span>
              ) : (
                <span className="text-muted-foreground text-sm">😶</span>
              )}
            </button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSave}
              disabled={isSaving || !hasChanges}
              className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {isSaving ? "Saving..." : todayEntry ? "Update" : "Save"}
            </motion.button>
          </div>
        </motion.div>

        {/* Mood Selector Dropdown */}
        <AnimatePresence>
          {showMoodSelector && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="glass-card p-4">
                <MoodSelector selected={mood} onSelect={(m) => {
                  setMood(m);
                  setShowMoodSelector(false);
                }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Date Display */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <p className="text-sm text-muted-foreground">
            {format(today, "EEEE, MMMM d, yyyy")}
          </p>
        </motion.div>

        {/* Prompt Display */}
        {state?.prompt && !todayEntry && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex items-start gap-2 rounded-xl bg-primary/10 p-3"
          >
            <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <p className="text-sm text-foreground/80 italic">{state.prompt}</p>
          </motion.div>
        )}

        {/* Title Input */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title (optional)"
            className="w-full bg-transparent font-serif text-2xl font-semibold text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
          />
        </motion.div>

        {/* Content Editor */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="min-h-[50vh]"
        >
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing your thoughts..."
            className="w-full min-h-[50vh] resize-none bg-transparent text-foreground leading-relaxed placeholder:text-muted-foreground/50 focus:outline-none"
            autoFocus
          />
        </motion.div>

        {/* Word Count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <p className="text-xs text-muted-foreground">
            {content.split(/\s+/).filter(Boolean).length} words
          </p>
        </motion.div>
      </div>
    </PageContainer>
  );
};

export default WritePage;
