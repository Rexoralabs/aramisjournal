import { useState, useEffect, useCallback, useRef, useLayoutEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Icon } from "@iconify/react";
import { format } from "date-fns";
import gsap from "gsap";
import { PageContainer } from "@/components/layout/PageContainer";
import {
  useJournalEntries,
  useJournalEntry,
  useCreateEntry,
  useUpdateEntry,
  useDeleteEntry,
  useTodayEntry,
} from "@/hooks/useJournal";
import { useUpdateStreak } from "@/hooks/useStreaks";
import { useStreamChat } from "@/hooks/useStreamChat";
import { toast } from "sonner";
import { haptic } from "@/lib/haptics";
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [aiSummary, setAiSummary] = useState("");
  const [isSummarizing, setIsSummarizing] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const lastSavedContentRef = useRef("");
  const lastSavedTitleRef = useRef("");

  const { data: entries = [] } = useJournalEntries();
  const { data: selectedEntry } = useJournalEntry(selectedEntryId);
  const { data: todayEntry, isLoading: loadingTodayEntry } = useTodayEntry();
  const createEntry = useCreateEntry();
  const updateEntry = useUpdateEntry();
  const deleteEntry = useDeleteEntry();
  const updateStreak = useUpdateStreak();
  const { streamChat } = useStreamChat();

  const isEditing = !!selectedEntryId && !!selectedEntry;
  const currentEntry = isEditing ? selectedEntry : todayEntry;

  useLayoutEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power2.out" });
    }
  }, []);

  // Load entry data
  useEffect(() => {
    if (selectedEntry) {
      setTitle(selectedEntry.title || "");
      setContent(selectedEntry.content);
      lastSavedContentRef.current = selectedEntry.content;
      lastSavedTitleRef.current = selectedEntry.title || "";
      setSaveStatus("saved");
    } else if (todayEntry && !state?.initialContent && !selectedEntryId) {
      setTitle(todayEntry.title || "");
      setContent(todayEntry.content);
      lastSavedContentRef.current = todayEntry.content;
      lastSavedTitleRef.current = todayEntry.title || "";
      setSaveStatus("saved");
    }
  }, [selectedEntry, todayEntry, state?.initialContent, selectedEntryId]);

  // Auto-save with debounce
  const autoSave = useCallback(async (currentTitle: string, currentContent: string) => {
    if (!currentContent.trim()) return;
    if (currentContent === lastSavedContentRef.current && currentTitle === lastSavedTitleRef.current) return;

    setSaveStatus("saving");
    try {
      if (isEditing && selectedEntry) {
        await updateEntry.mutateAsync({ id: selectedEntry.id, title: currentTitle || undefined, content: currentContent });
      } else if (todayEntry) {
        await updateEntry.mutateAsync({ id: todayEntry.id, title: currentTitle || undefined, content: currentContent });
      } else {
        await createEntry.mutateAsync({ title: currentTitle || undefined, content: currentContent, prompt_used: state?.prompt });
        const result = await updateStreak.mutateAsync();
        if (result.isNewMilestone) {
          toast.success(`🎉 Milestone achieved: ${result.newStreak} day streak!`);
        }
      }
      lastSavedContentRef.current = currentContent;
      lastSavedTitleRef.current = currentTitle;
      setSaveStatus("saved");
    } catch {
      setSaveStatus("idle");
    }
  }, [isEditing, selectedEntry, todayEntry, state?.prompt, createEntry, updateEntry, updateStreak]);

  useEffect(() => {
    if (!content.trim()) return;
    if (content === lastSavedContentRef.current && title === lastSavedTitleRef.current) return;

    setSaveStatus("idle");
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => autoSave(title, content), 1500);

    return () => clearTimeout(saveTimerRef.current);
  }, [content, title, autoSave]);

  const handleSelectEntry = (entryId: string | null) => {
    if (entryId) {
      setSearchParams({ entry: entryId });
    } else {
      setSearchParams({});
      if (todayEntry) {
        setTitle(todayEntry.title || "");
        setContent(todayEntry.content);
      } else {
        setTitle("");
        setContent("");
      }
    }
    setSidebarOpen(false);
    setAiSummary("");
  };

  const handleDelete = async (entryId: string) => {
    await deleteEntry.mutateAsync(entryId);
    if (currentEntry?.id === entryId) {
      handleSelectEntry(null);
    }
  };

  const handleNewEntry = () => {
    setSearchParams({});
    setTitle("");
    setContent("");
    lastSavedContentRef.current = "";
    lastSavedTitleRef.current = "";
    setSaveStatus("idle");
    setAiSummary("");
    setSidebarOpen(false);
  };

  // Formatting helpers
  const insertFormatting = (prefix: string, suffix: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end);
    const before = content.substring(0, start);
    const after = content.substring(end);
    const newContent = `${before}${prefix}${selected}${suffix}${after}`;
    setContent(newContent);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 0);
  };

  // AI Summary
  const handleGenerateSummary = async () => {
    if (!content.trim() || isSummarizing) return;
    setIsSummarizing(true);
    setAiSummary("");
    haptic("medium");

    let fullResponse = "";
    await streamChat({
      messages: [
        { role: "user", content: `Summarize the following journal entry in 2-6 concise sentences. Focus on the key themes, emotions, and insights.\n\n${content}` },
      ],
      onDelta: (chunk) => {
        fullResponse += chunk;
        setAiSummary(fullResponse);
      },
      onDone: () => {
        setIsSummarizing(false);
        haptic("success");
      },
      onError: () => {
        setIsSummarizing(false);
        toast.error("Failed to generate summary");
      },
    });
  };

  if (loadingTodayEntry) {
    return (
      <PageContainer className="flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </PageContainer>
    );
  }

  return (
    <>
      {/* Entry Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40" onClick={() => setSidebarOpen(false)} />
      )}
      <aside
        className={`fixed left-0 top-0 h-full w-72 bg-card border-r border-border z-50 transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-lg text-foreground">Entries</h2>
            <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-lg hover:bg-muted transition-colors">
              <Icon icon="ph:x" className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>

          <button
            onClick={handleNewEntry}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/15 transition-colors mb-4"
          >
            <Icon icon="ph:plus" className="h-5 w-5 text-primary" />
            <span className="font-ui text-sm text-foreground">New Entry</span>
          </button>

          <div className="flex-1 overflow-y-auto space-y-1 scrollbar-hide">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className={`group flex items-start justify-between p-3 rounded-lg transition-colors cursor-pointer ${
                  currentEntry?.id === entry.id ? "bg-primary/10 border border-primary/20" : "hover:bg-muted"
                }`}
                onClick={() => handleSelectEntry(entry.id)}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate font-sans">{entry.title || "Untitled"}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 font-ui">
                    {format(new Date(entry.entry_date), "MMM d, yyyy")}
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 rounded opacity-0 group-hover:opacity-100 hover:bg-destructive/10 transition-all"
                    >
                      <Icon icon="ph:trash" className="h-3.5 w-3.5 text-destructive" />
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Entry</AlertDialogTitle>
                      <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(entry.id)} className="bg-destructive text-destructive-foreground">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </div>
        </div>
      </aside>

      <PageContainer className="pb-8">
        <div ref={containerRef} className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => { haptic("selection"); setSidebarOpen(true); }}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <Icon icon="ph:list" className="h-5 w-5 text-muted-foreground" />
              </button>
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <Icon icon="ph:arrow-left" className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              {/* Save status */}
              <span className="text-xs font-ui text-muted-foreground">
                {saveStatus === "saving" && "Saving..."}
                {saveStatus === "saved" && "✓ Saved"}
              </span>

              {/* Delete button */}
              {currentEntry && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="p-2 rounded-lg hover:bg-destructive/10 transition-colors">
                      <Icon icon="ph:trash" className="h-5 w-5 text-destructive" />
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Entry</AlertDialogTitle>
                      <AlertDialogDescription>Are you sure? This action cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => currentEntry && handleDelete(currentEntry.id)} className="bg-destructive text-destructive-foreground">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>

          {/* Formatting Toolbar */}
          <div className="flex items-center gap-1 px-1">
            <button onClick={() => insertFormatting("**", "**")} className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" title="Bold">
              <Icon icon="ph:text-b-bold" className="h-4 w-4" />
            </button>
            <button onClick={() => insertFormatting("*", "*")} className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" title="Italic">
              <Icon icon="ph:text-italic" className="h-4 w-4" />
            </button>
            <button onClick={() => insertFormatting("## ")} className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" title="Heading">
              <Icon icon="ph:text-h" className="h-4 w-4" />
            </button>
            <button onClick={() => insertFormatting("- ")} className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" title="List">
              <Icon icon="ph:list-bullets" className="h-4 w-4" />
            </button>
            <button onClick={() => insertFormatting("> ")} className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" title="Quote">
              <Icon icon="ph:quotes" className="h-4 w-4" />
            </button>
          </div>

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
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing your thoughts..."
              className="w-full min-h-[50vh] resize-none bg-transparent text-foreground leading-relaxed placeholder:text-muted-foreground/50 focus:outline-none"
              autoFocus
            />
          </div>

          {/* Word Count + AI Summary Button */}
          <div className="flex items-center justify-between">
            <p className="text-xs font-ui text-muted-foreground">
              {content.split(/\s+/).filter(Boolean).length} words
            </p>
            <button
              onClick={handleGenerateSummary}
              disabled={!content.trim() || isSummarizing}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50 text-sm font-ui"
            >
              <Icon icon="ph:sparkle-duotone" className="h-4 w-4" />
              {isSummarizing ? "Summarizing..." : "Generate Summary"}
            </button>
          </div>

          {/* AI Summary Display */}
          {aiSummary && (
            <div className="glass-card p-5 animate-fade-in">
              <div className="flex items-center gap-2 mb-3">
                <Icon icon="ph:sparkle-duotone" className="h-4 w-4 text-primary" />
                <span className="text-xs font-ui text-muted-foreground">AI Summary</span>
              </div>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{aiSummary}</p>
            </div>
          )}
        </div>
      </PageContainer>
    </>
  );
};

export default WritePage;
