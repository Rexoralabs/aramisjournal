import { useState, useEffect, useCallback, useRef, useLayoutEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Icon } from "@iconify/react";
import { format } from "date-fns";
import gsap from "gsap";
import { PageContainer } from "@/components/layout/PageContainer";
import { JournalEditor } from "@/components/journal/JournalEditor";
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
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const WritePage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedEntryId = searchParams.get("entry");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [aiSummary, setAiSummary] = useState("");
  const [isSummarizing, setIsSummarizing] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const loadedEntryIdRef = useRef<string | null>(null);
  const savingRef = useRef(false);
  const [draftKey, setDraftKey] = useState(0);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const summaryTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const lastSavedContentRef = useRef("");
  const lastSavedTitleRef = useRef("");
  const isNewEntryRef = useRef(false);
  const createdEntryIdRef = useRef<string | null>(null);

  const { data: entries = [] } = useJournalEntries();
  const { data: selectedEntry } = useJournalEntry(selectedEntryId);
  const { data: todayEntry, isLoading: loadingTodayEntry } = useTodayEntry();
  const createEntry = useCreateEntry();
  const updateEntry = useUpdateEntry();
  const deleteEntry = useDeleteEntry();
  const updateStreak = useUpdateStreak();
  const { streamChat } = useStreamChat();

  const isEditing = !!selectedEntryId && !!selectedEntry;
  const currentEntry = isEditing ? selectedEntry : (isNewEntryRef.current ? null : todayEntry);

  useLayoutEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power2.out" });
    }
  }, []);

  // Load entry data
  useEffect(() => {
    if (selectedEntry && selectedEntry.id !== loadedEntryIdRef.current) {
      loadedEntryIdRef.current = selectedEntry.id;
      setTitle(selectedEntry.title || "");
      setContent(selectedEntry.content);
      setAiSummary((selectedEntry as any).ai_summary || "");
      lastSavedContentRef.current = selectedEntry.content;
      lastSavedTitleRef.current = selectedEntry.title || "";
      isNewEntryRef.current = false;
      setSaveStatus("saved");
    } else if (todayEntry && !selectedEntryId && !isNewEntryRef.current && todayEntry.id !== loadedEntryIdRef.current) {
      loadedEntryIdRef.current = todayEntry.id;
      setTitle(todayEntry.title || "");
      setContent(todayEntry.content);
      setAiSummary((todayEntry as any).ai_summary || "");
      lastSavedContentRef.current = todayEntry.content;
      lastSavedTitleRef.current = todayEntry.title || "";
      setSaveStatus("saved");
    }
  }, [selectedEntry, todayEntry, selectedEntryId]);

  // Auto-save
  const autoSave = useCallback(async (currentTitle: string, currentContent: string) => {
    if (savingRef.current) return;
    if (!currentContent.trim()) return;
    if (currentContent === lastSavedContentRef.current && currentTitle === lastSavedTitleRef.current) return;

    savingRef.current = true;
    setSaveStatus("saving");
    try {
      if (isEditing && selectedEntry) {
        await updateEntry.mutateAsync({ id: selectedEntry.id, title: currentTitle || undefined, content: currentContent });
      } else if (createdEntryIdRef.current) {
        await updateEntry.mutateAsync({ id: createdEntryIdRef.current, title: currentTitle || undefined, content: currentContent });
      } else if (!isNewEntryRef.current && todayEntry) {
        await updateEntry.mutateAsync({ id: todayEntry.id, title: currentTitle || undefined, content: currentContent });
      } else {
        const result = await createEntry.mutateAsync({ title: currentTitle || undefined, content: currentContent });
        createdEntryIdRef.current = result.id;
        loadedEntryIdRef.current = result.id;
        isNewEntryRef.current = false;
        try { await updateStreak.mutateAsync(); } catch {}
      }
      lastSavedContentRef.current = currentContent;
      lastSavedTitleRef.current = currentTitle;
      setSaveStatus("saved");
    } catch {
      setSaveStatus("idle");
    } finally {
      savingRef.current = false;
    }
  }, [isEditing, selectedEntry, todayEntry, createEntry, updateEntry, updateStreak]);

  useEffect(() => {
    if (!content.trim()) return;
    if (content === lastSavedContentRef.current && title === lastSavedTitleRef.current) return;
    if (savingRef.current) return;
    setSaveStatus("idle");
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => autoSave(title, content), 1500);
    return () => clearTimeout(saveTimerRef.current);
  }, [content, title, autoSave, saveStatus]);

  // AI Summary auto-save
  useEffect(() => {
    const entryId = selectedEntryId || createdEntryIdRef.current || todayEntry?.id;
    if (!entryId || !aiSummary) return;
    clearTimeout(summaryTimerRef.current);
    summaryTimerRef.current = setTimeout(() => {
      updateEntry.mutate({ id: entryId, ai_summary: aiSummary } as any);
    }, 1500);
    return () => clearTimeout(summaryTimerRef.current);
  }, [aiSummary]);

  const handleSelectEntry = (entryId: string | null) => {
    loadedEntryIdRef.current = null;
    createdEntryIdRef.current = null;
    isNewEntryRef.current = false;
    if (entryId) {
      setSearchParams({ entry: entryId });
    } else {
      setSearchParams({});
      if (todayEntry) { setTitle(todayEntry.title || ""); setContent(todayEntry.content); }
      else { setTitle(""); setContent(""); }
    }
    setSidebarOpen(false);
    setAiSummary("");
  };

  const handleDelete = async (entryId: string) => {
    await deleteEntry.mutateAsync(entryId);
    if (currentEntry?.id === entryId || createdEntryIdRef.current === entryId) {
      createdEntryIdRef.current = null;
      handleSelectEntry(null);
    }
  };

  const handleNewEntry = () => {
    loadedEntryIdRef.current = null;
    setDraftKey(key => key + 1);
    setSearchParams({});
    setTitle("");
    setContent("");
    lastSavedContentRef.current = "";
    lastSavedTitleRef.current = "";
    createdEntryIdRef.current = null;
    isNewEntryRef.current = true;
    setSaveStatus("idle");
    setAiSummary("");
    setSidebarOpen(false);
  };

  // AI Summary
  const handleGenerateSummary = async () => {
    if (!content.trim() || isSummarizing) return;
    setIsSummarizing(true);
    setAiSummary("");
    haptic("medium");
    let fullResponse = "";
    await streamChat({
      messages: [{ role: "user", content: `Summarize the following journal entry in 2-6 concise sentences. Focus on the key themes, emotions, and insights.\n\n${content}` }],
      onDelta: (chunk) => { fullResponse += chunk; setAiSummary(fullResponse); },
      onDone: () => { setIsSummarizing(false); haptic("success"); },
      onError: () => { setIsSummarizing(false); toast.error("Failed to generate summary"); },
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
      {sidebarOpen && <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40" onClick={() => setSidebarOpen(false)} />}
      <aside className={`fixed left-0 top-0 h-full w-72 bg-card border-r border-border z-50 transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex flex-col h-full p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-lg text-foreground">Entries</h2>
            <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-lg hover:bg-muted transition-colors">
              <Icon icon="ph:x" className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
          <button onClick={handleNewEntry} className="w-full flex items-center gap-3 p-3 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/15 transition-colors mb-4">
            <Icon icon="ph:plus" className="h-5 w-5 text-primary" />
            <span className="font-ui text-sm text-foreground">New Entry</span>
          </button>
          <div className="flex-1 overflow-y-auto space-y-1 scrollbar-hide">
            {entries.map((entry) => (
              <div key={entry.id}
                className={`group flex items-start justify-between p-3 rounded-lg transition-colors cursor-pointer ${currentEntry?.id === entry.id || createdEntryIdRef.current === entry.id ? "bg-primary/10 border border-primary/20" : "hover:bg-muted"}`}
                onClick={() => handleSelectEntry(entry.id)}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate font-sans">{entry.title || "Untitled"}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 font-ui">{format(new Date(entry.entry_date), "MMM d, yyyy")}</p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button onClick={(e) => e.stopPropagation()} className="p-1.5 rounded opacity-0 group-hover:opacity-100 hover:bg-destructive/10 transition-all">
                      <Icon icon="ph:trash" className="h-3.5 w-3.5 text-destructive" />
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Delete Entry</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(entry.id)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction></AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </div>
        </div>
      </aside>

      <PageContainer className="pb-8">
        <div ref={containerRef} className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button onClick={() => { haptic("selection"); setSidebarOpen(true); }} className="p-2 rounded-lg hover:bg-muted transition-colors">
                <Icon icon="ph:list" className="h-5 w-5 text-muted-foreground" />
              </button>
              <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-muted transition-colors">
                <Icon icon="ph:arrow-left" className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-ui text-muted-foreground">
                {saveStatus === "saving" && "Saving..."}
                {saveStatus === "saved" && "✓ Saved"}
              </span>
              {(currentEntry || createdEntryIdRef.current) && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"><Icon icon="ph:trash" className="h-5 w-5 text-destructive" /></button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Delete Entry</AlertDialogTitle><AlertDialogDescription>Are you sure? This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => { const id = currentEntry?.id || createdEntryIdRef.current; if (id) handleDelete(id); }} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction></AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>

          <JournalEditor key={`${selectedEntryId || "today"}-${draftKey}`} content={content} onChange={setContent}
            documentKey={`${selectedEntryId || "today"}-${draftKey}`}
            titleField={<input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title (optional)"
              className="w-full bg-transparent font-serif text-2xl text-foreground placeholder:text-muted-foreground/50 focus:outline-none" />} />

          <div className="flex items-center justify-between">
            <p className="text-xs font-ui text-muted-foreground">{content.split(/\s+/).filter(Boolean).length} words</p>
            <button onClick={handleGenerateSummary} disabled={!content.trim() || isSummarizing}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50 text-sm font-ui">
              <Icon icon="ph:sparkle-duotone" className="h-4 w-4" />
              {isSummarizing ? "Summarizing..." : "Generate Summary"}
            </button>
          </div>

          {aiSummary && (
            <div className="glass-card p-5 animate-fade-in">
              <div className="flex items-center gap-2 mb-3">
                <Icon icon="ph:sparkle-duotone" className="h-4 w-4 text-primary" />
                <span className="text-xs font-ui text-muted-foreground">AI Summary</span>
              </div>
              <textarea
                value={aiSummary}
                onChange={(e) => setAiSummary(e.target.value)}
                className="w-full bg-transparent text-sm text-foreground leading-relaxed resize-none focus:outline-none min-h-[60px]"
                rows={3}
              />
            </div>
          )}
        </div>
      </PageContainer>
    </>
  );
};

export default WritePage;
