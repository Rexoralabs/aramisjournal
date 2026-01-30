import { useState, useEffect, useCallback, useRef, useLayoutEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Save, ChevronDown, Trash2 } from "lucide-react";
import { format } from "date-fns";
import gsap from "gsap";
import { PageContainer } from "@/components/layout/PageContainer";
import { MoodSelector, Mood } from "@/components/journal/MoodSelector";
import {
  useJournalEntries,
  useJournalEntry,
  useCreateEntry,
  useUpdateEntry,
  useDeleteEntry,
  useTodayEntry,
} from "@/hooks/useJournal";
import { useUpdateStreak } from "@/hooks/useStreaks";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface LocationState {
  mood?: Mood;
  initialContent?: string;
  prompt?: string;
}

const WritePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const state = location.state as LocationState | null;

  const selectedEntryId = searchParams.get("entry");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState(state?.initialContent || "");
  const [mood, setMood] = useState<Mood | undefined>(state?.mood);
  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const [showEntryList, setShowEntryList] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const { data: entries = [] } = useJournalEntries();
  const { data: selectedEntry } = useJournalEntry(selectedEntryId);
  const { data: todayEntry, isLoading: loadingTodayEntry } = useTodayEntry();
  const createEntry = useCreateEntry();
  const updateEntry = useUpdateEntry();
  const deleteEntry = useDeleteEntry();
  const updateStreak = useUpdateStreak();

  const today = new Date();
  const isEditing = !!selectedEntryId && !!selectedEntry;
  const currentEntry = isEditing ? selectedEntry : todayEntry;

  useLayoutEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.4, ease: "power2.out" }
      );
    }
  }, []);

  // Load entry data when selected entry changes
  useEffect(() => {
    if (selectedEntry) {
      setTitle(selectedEntry.title || "");
      setContent(selectedEntry.content);
      setMood(selectedEntry.mood as Mood | undefined);
      setHasChanges(false);
    } else if (todayEntry && !state?.initialContent && !selectedEntryId) {
      setTitle(todayEntry.title || "");
      setContent(todayEntry.content);
      setMood(todayEntry.mood as Mood | undefined);
      setHasChanges(false);
    }
  }, [selectedEntry, todayEntry, state?.initialContent, selectedEntryId]);

  // Track changes
  useEffect(() => {
    if (content.length > 0) {
      setHasChanges(true);
    }
  }, [content, title, mood]);

  const handleSelectEntry = (entryId: string | null) => {
    if (entryId) {
      setSearchParams({ entry: entryId });
    } else {
      setSearchParams({});
      // Reset to today's entry or new
      if (todayEntry) {
        setTitle(todayEntry.title || "");
        setContent(todayEntry.content);
        setMood(todayEntry.mood as Mood | undefined);
      } else {
        setTitle("");
        setContent("");
        setMood(undefined);
      }
    }
    setShowEntryList(false);
    setHasChanges(false);
  };

  const handleSave = useCallback(async () => {
    if (!content.trim()) {
      toast.error("Please write something before saving");
      return;
    }

    try {
      if (isEditing && selectedEntry) {
        await updateEntry.mutateAsync({
          id: selectedEntry.id,
          title: title || undefined,
          content,
          mood,
        });
      } else if (todayEntry) {
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
        const result = await updateStreak.mutateAsync();
        if (result.isNewMilestone) {
          toast.success(`🎉 Milestone achieved: ${result.newStreak} day streak!`);
        }
      }
      setHasChanges(false);
    } catch (error) {
      // Error handled by mutation
    }
  }, [content, title, mood, isEditing, selectedEntry, todayEntry, state?.prompt, createEntry, updateEntry, updateStreak]);

  const handleDelete = async () => {
    if (!currentEntry) return;
    await deleteEntry.mutateAsync(currentEntry.id);
    handleSelectEntry(null);
  };

  const isSaving = createEntry.isPending || updateEntry.isPending;

  if (loadingTodayEntry) {
    return (
      <PageContainer className="flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="pb-8">
      <div ref={containerRef} className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2">
            {/* Entry selector dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowEntryList(!showEntryList)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors font-ui text-sm"
              >
                <span className="max-w-32 truncate">
                  {isEditing
                    ? selectedEntry?.title || format(new Date(selectedEntry?.entry_date || ""), "MMM d")
                    : "Today"}
                </span>
                <ChevronDown className="h-4 w-4" />
              </button>

              {showEntryList && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-card border border-border rounded-xl shadow-lg z-50 max-h-80 overflow-y-auto">
                  <button
                    onClick={() => handleSelectEntry(null)}
                    className="w-full text-left px-4 py-3 hover:bg-muted transition-colors border-b border-border"
                  >
                    <p className="font-medium text-foreground">Today's Entry</p>
                    <p className="text-xs text-muted-foreground">{format(today, "MMMM d, yyyy")}</p>
                  </button>
                  {entries.map((entry) => (
                    <button
                      key={entry.id}
                      onClick={() => handleSelectEntry(entry.id)}
                      className="w-full text-left px-4 py-3 hover:bg-muted transition-colors"
                    >
                      <p className="font-medium text-foreground truncate">
                        {entry.title || "Untitled"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(entry.entry_date), "MMMM d, yyyy")}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mood selector */}
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

            {/* Delete button (only for existing entries) */}
            {currentEntry && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="p-2 rounded-lg hover:bg-destructive/10 transition-colors">
                    <Trash2 className="h-5 w-5 text-destructive" />
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Entry</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this entry? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            {/* Save button */}
            <button
              onClick={handleSave}
              disabled={isSaving || !hasChanges}
              className="btn-luxury flex items-center gap-2 !px-4 !py-2"
            >
              <Save className="h-4 w-4" />
              {isSaving ? "Saving..." : currentEntry ? "Update" : "Save"}
            </button>
          </div>
        </div>

        {/* Mood Selector Dropdown */}
        {showMoodSelector && (
          <div className="glass-card p-4">
            <MoodSelector
              selected={mood}
              onSelect={(m) => {
                setMood(m);
                setShowMoodSelector(false);
              }}
            />
          </div>
        )}

        {/* Date Display */}
        <p className="text-sm font-ui text-muted-foreground">
          {isEditing && selectedEntry
            ? format(new Date(selectedEntry.entry_date), "EEEE, MMMM d, yyyy")
            : format(today, "EEEE, MMMM d, yyyy")}
        </p>

        {/* Title Input */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title (optional)"
          className="w-full bg-transparent font-serif text-2xl text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
        />

        {/* Content Editor */}
        <div className="min-h-[50vh]">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing your thoughts..."
            className="w-full min-h-[50vh] resize-none bg-transparent text-foreground leading-relaxed placeholder:text-muted-foreground/50 focus:outline-none"
            autoFocus
          />
        </div>

        {/* Word Count */}
        <div className="text-center">
          <p className="text-xs font-ui text-muted-foreground">
            {content.split(/\s+/).filter(Boolean).length} words
          </p>
        </div>
      </div>
    </PageContainer>
  );
};

export default WritePage;
