import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { Icon } from "@iconify/react";
import { getDayOfYear } from "date-fns";
import gsap from "gsap";
import { useQueryClient } from "@tanstack/react-query";
import { GreetingHeader } from "@/components/chat/GreetingHeader";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { useUserProfile } from "@/hooks/useProfile";
import { useTheme } from "@/hooks/useTheme";
import { useStreamChat } from "@/hooks/useStreamChat";
import { useJournalEntries } from "@/hooks/useJournal";
import { haptic } from "@/lib/haptics";
import { soundManager } from "@/lib/sounds";
import {
  useChatConversations, useChatMessages, useCreateConversation, useAddMessage, useUpdateConversationTitle,
} from "@/hooks/useChatHistory";

function buildJournalContext(entries: any[]): string {
  if (!entries.length) return "";
  return entries.slice(0, 20).map(e =>
    `- "${e.title || "Untitled"}" (${e.entry_date}): ${e.content.slice(0, 100)}`
  ).join("\n");
}

type LocalMsg = { id: string; role: "user" | "assistant"; content: string };

const HomePage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [pending, setPending] = useState<LocalMsg[]>([]);
  const [streamingContent, setStreamingContent] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const qc = useQueryClient();

  const { data: profile } = useUserProfile();
  const { theme, setTheme } = useTheme();
  const { streamChat } = useStreamChat();
  const { data: conversations = [] } = useChatConversations();
  const { data: messages = [] } = useChatMessages(currentConversationId);
  const { data: journalEntries = [] } = useJournalEntries();
  const createConversation = useCreateConversation();
  const addMessage = useAddMessage();
  const updateTitle = useUpdateConversationTitle();

  const displayName = profile?.display_name || "Writer";
  const dayOfYear = getDayOfYear(new Date());

  // Merge saved + pending without duplicates
  const savedIds = new Set(messages.map(m => m.content + m.role));
  const visiblePending = pending.filter(p => !savedIds.has(p.content + p.role));
  const allMessages: LocalMsg[] = [...messages as LocalMsg[], ...visiblePending];
  const showGreeting = allMessages.length === 0 && !isTyping;

  useLayoutEffect(() => {
    if (!pageRef.current) return;
    gsap.fromTo(pageRef.current, { opacity: 0, filter: "blur(8px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.6, ease: "expo.out" });
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: streamingContent ? "auto" : "smooth" });
  }, [allMessages.length, streamingContent]);

  const handleNewConversation = () => {
    setCurrentConversationId(null);
    setPending([]);
    setSidebarOpen(false);
  };

  const handleSendMessage = async (content: string) => {
    haptic('medium');
    soundManager.play('send');
    const history = allMessages.map(m => ({ role: m.role, content: m.content }));
    setPending(p => [...p, { id: `local-${Date.now()}`, role: "user", content }]);
    setIsTyping(true);
    setStreamingContent("");

    let conversationId = currentConversationId;
    try {
      if (!conversationId) {
        const newConv = await createConversation.mutateAsync(undefined);
        conversationId = newConv.id;
        setCurrentConversationId(conversationId);
        updateTitle.mutate({ id: conversationId, title: content.slice(0, 50) + (content.length > 50 ? "..." : "") });
      }
      addMessage.mutate({ conversationId, role: "user", content });
    } catch {
      setIsTyping(false);
      return;
    }

    let fullResponse = "";
    const convId = conversationId;
    await streamChat({
      messages: [...history, { role: "user" as const, content }],
      context: buildJournalContext(journalEntries) || undefined,
      onDelta: (chunk) => { fullResponse += chunk; setStreamingContent(fullResponse); },
      onDone: async () => {
        haptic('success');
        soundManager.play('receive');
        if (fullResponse) {
          setPending(p => [...p, { id: `local-a-${Date.now()}`, role: "assistant", content: fullResponse }]);
        }
        setStreamingContent("");
        setIsTyping(false);
        if (fullResponse && convId) {
          await addMessage.mutateAsync({ conversationId: convId, role: "assistant", content: fullResponse });
          qc.invalidateQueries({ queryKey: ["chat-messages", convId] });
        }
      },
      onError: () => { setIsTyping(false); setStreamingContent(""); },
    });
  };

  const selectConversation = (id: string) => { setPending([]); setCurrentConversationId(id); };

  return (
    <>
      <ChatSidebar conversations={conversations} currentConversationId={currentConversationId}
        onSelectConversation={selectConversation} onNewConversation={handleNewConversation}
        isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main ref={pageRef} className="h-screen flex flex-col pl-20 pr-4 grain-gradient" style={{ opacity: 0 }}>
        <header className="flex items-center justify-between py-4 max-w-5xl w-full mx-auto">
          <button aria-label="Open conversations" onClick={() => { haptic('selection'); soundManager.play('swoosh'); setSidebarOpen(true); }}
            className="p-2 rounded-xl hover:bg-muted transition-colors">
            <Icon icon="ph:list" className="h-5 w-5 text-muted-foreground" />
          </button>
          <span className="text-lg font-serif text-foreground">
            {dayOfYear} <span className="italic text-muted-foreground">of</span> 365
          </span>
          <button aria-label="Toggle theme" onClick={() => { haptic('selection'); setTheme(theme === "dark" ? "light" : "dark"); }}
            className="p-2 rounded-xl hover:bg-muted transition-colors">
            <Icon icon={theme === "dark" ? "ph:sun-duotone" : "ph:moon-duotone"} className="h-5 w-5 text-muted-foreground" />
          </button>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-hide">
          {showGreeting ? (
            <div className="h-full flex items-center justify-center pb-16">
              <GreetingHeader displayName={displayName} />
            </div>
          ) : (
            <div className="max-w-3xl mx-auto w-full py-6 space-y-6">
              {allMessages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} animate={msg.id.startsWith("local-") && msg.role === "user"} />
              ))}
              {streamingContent && (
                <ChatMessage message={{ id: "stream", role: "assistant", content: streamingContent }} streaming />
              )}
              {isTyping && !streamingContent && (
                <div className="flex gap-1.5 py-2">
                  {[0, 150, 300].map(d => (
                    <span key={d} className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-pulse" style={{ animationDelay: `${d}ms` }} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="pb-6 pt-2 max-w-3xl w-full mx-auto">
          <ChatInput onSend={handleSendMessage} disabled={isTyping} placeholder="Share your thoughts..." />
          <p className="text-center text-[11px] font-ui text-muted-foreground/70 mt-2">Aramis reflects on your journal to respond. Enter to send, Shift+Enter for a new line.</p>
        </div>
      </main>
    </>
  );
};

export default HomePage;
