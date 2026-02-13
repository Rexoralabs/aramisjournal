import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { Icon } from "@iconify/react";
import gsap from "gsap";
import { useStreamChat } from "@/hooks/useStreamChat";
import { haptic } from "@/lib/haptics";
import { soundManager } from "@/lib/sounds";
import {
  useChatConversations, useChatMessages, useCreateConversation, useAddMessage, useUpdateConversationTitle,
} from "@/hooks/useChatHistory";
import type { JournalEntry } from "@/hooks/useJournal";

interface CellarAISidebarProps {
  isOpen: boolean;
  onClose: () => void;
  entries: JournalEntry[];
}

function buildEntriesContext(entries: JournalEntry[]): string {
  return entries.slice(0, 20).map(e =>
    `- "${e.title || "Untitled"}" (${e.entry_date}): ${e.content.slice(0, 200)}`
  ).join("\n");
}

export function CellarAISidebar({ isOpen, onClose, entries }: CellarAISidebarProps) {
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamContent, setStreamContent] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { streamChat } = useStreamChat();

  const { data: messages = [] } = useChatMessages(conversationId);
  const createConversation = useCreateConversation();
  const addMessage = useAddMessage();
  const updateTitle = useUpdateConversationTitle();

  useLayoutEffect(() => {
    if (!panelRef.current) return;
    if (isOpen) {
      gsap.fromTo(panelRef.current, { x: 400, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4, ease: "power3.out" });
    } else {
      gsap.to(panelRef.current, { x: 400, opacity: 0, duration: 0.3, ease: "power3.in" });
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamContent]);

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;
    haptic("medium");
    soundManager.play("send");

    let convId = conversationId;
    if (!convId) {
      const newConv = await createConversation.mutateAsync("Cellar Chat");
      convId = newConv.id;
      setConversationId(convId);
    }

    const userContent = input.trim();
    setInput("");
    await addMessage.mutateAsync({ conversationId: convId, role: "user", content: userContent });

    if (messages.length === 0) {
      const title = userContent.slice(0, 50) + (userContent.length > 50 ? "..." : "");
      await updateTitle.mutateAsync({ id: convId, title });
    }

    setIsStreaming(true);
    setStreamContent("");

    const chatMsgs = [
      ...messages.map(m => ({ role: m.role as "user" | "assistant", content: m.content })),
      { role: "user" as const, content: userContent },
    ];

    const context = buildEntriesContext(entries);
    let fullResponse = "";

    await streamChat({
      messages: chatMsgs,
      context,
      onDelta: (chunk) => { fullResponse += chunk; setStreamContent(fullResponse); },
      onDone: async () => {
        setIsStreaming(false);
        setStreamContent("");
        if (fullResponse && convId) {
          await addMessage.mutateAsync({ conversationId: convId, role: "assistant", content: fullResponse });
        }
        haptic("success");
        soundManager.play("receive");
      },
      onError: () => { setIsStreaming(false); setStreamContent(""); },
    });
  };

  if (!isOpen) return null;

  return (
    <div ref={panelRef} className="fixed top-0 right-0 bottom-0 w-full sm:w-96 z-50 bg-card border-l border-border flex flex-col shadow-2xl">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="font-serif text-lg text-foreground">Thought Explorer</h2>
        <button onClick={onClose} className="p-2 rounded-2xl hover:bg-muted transition-colors">
          <Icon icon="ph:x-circle" className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
        {messages.length === 0 && !streamContent && (
          <p className="text-sm text-muted-foreground text-center mt-8 font-ui">
            Ask me about your journal entries. I'll help you find connections and deeper meaning.
          </p>
        )}
        {messages.map((msg, i) => (
          <div key={msg.id || i} className={msg.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <div className={msg.role === "user" ? "chat-bubble-user" : "chat-bubble-assistant"}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {streamContent && (
          <div className="flex justify-start"><div className="chat-bubble-assistant"><p className="text-sm leading-relaxed whitespace-pre-wrap">{streamContent}</p></div></div>
        )}
        {isStreaming && !streamContent && (
          <div className="flex justify-start"><div className="chat-bubble-assistant"><div className="flex gap-1">
            <span className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div></div></div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Explore your thoughts..."
            className="flex-1 bg-muted rounded-2xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
          <button onClick={handleSend} disabled={!input.trim() || isStreaming}
            className="h-10 w-10 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50 hover:scale-105 active:scale-95 transition-transform">
            <Icon icon="ph:paper-plane-right-fill" className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
