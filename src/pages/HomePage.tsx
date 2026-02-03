import { useState, useEffect, useRef } from "react";
import { Menu, Moon, Sun } from "lucide-react";
import { getDayOfYear } from "date-fns";
import { PageContainer } from "@/components/layout/PageContainer";
import { GreetingHeader } from "@/components/chat/GreetingHeader";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { useUserProfile } from "@/hooks/useProfile";
import { useUserStreak } from "@/hooks/useStreaks";
import { useTheme } from "@/hooks/useTheme";
import { useStreamChat } from "@/hooks/useStreamChat";
import { haptic } from "@/lib/haptics";
import { soundManager } from "@/lib/sounds";
import {
  useChatConversations,
  useChatMessages,
  useCreateConversation,
  useAddMessage,
  useUpdateConversationTitle,
} from "@/hooks/useChatHistory";

const HomePage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: profile } = useUserProfile();
  const { data: streakData } = useUserStreak();
  const { theme, setTheme } = useTheme();
  const { streamChat } = useStreamChat();
  const { data: conversations = [] } = useChatConversations();
  const { data: messages = [] } = useChatMessages(currentConversationId);
  const createConversation = useCreateConversation();
  const addMessage = useAddMessage();
  const updateTitle = useUpdateConversationTitle();

  const displayName = profile?.display_name || "Writer";
  const dayOfYear = getDayOfYear(new Date());

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  const handleNewConversation = () => {
    setCurrentConversationId(null);
    setSidebarOpen(false);
  };

  const handleSendMessage = async (content: string) => {
    let conversationId = currentConversationId;
    
    haptic('medium');
    soundManager.play('send');

    // Create new conversation if none exists
    if (!conversationId) {
      const newConv = await createConversation.mutateAsync(undefined);
      conversationId = newConv.id;
      setCurrentConversationId(conversationId);
    }

    // Add user message
    await addMessage.mutateAsync({
      conversationId,
      role: "user",
      content,
    });

    // Update conversation title from first message if untitled
    const currentConv = conversations.find(c => c.id === conversationId);
    if (!currentConv?.title && content.length > 0) {
      const title = content.slice(0, 50) + (content.length > 50 ? "..." : "");
      await updateTitle.mutateAsync({ id: conversationId, title });
    }

    // Stream AI response
    setIsTyping(true);
    setStreamingContent("");

    const chatMessages = [...messages, { role: "user" as const, content }].map(m => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    let fullResponse = "";

    await streamChat({
      messages: chatMessages,
      onDelta: (chunk) => {
        fullResponse += chunk;
        setStreamingContent(fullResponse);
      },
      onDone: async () => {
        setIsTyping(false);
        setStreamingContent("");
        
        haptic('success');
        soundManager.play('receive');
        
        if (fullResponse && conversationId) {
          await addMessage.mutateAsync({
            conversationId,
            role: "assistant",
            content: fullResponse,
          });
        }
      },
      onError: () => {
        setIsTyping(false);
        setStreamingContent("");
      },
    });
  };

  const showGreeting = !currentConversationId || messages.length === 0;

  return (
    <>
      <ChatSidebar
        conversations={conversations}
        currentConversationId={currentConversationId}
        onSelectConversation={setCurrentConversationId}
        onNewConversation={handleNewConversation}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <PageContainer className="flex flex-col h-[calc(100vh-80px)]">
        {/* Header */}
        <div className="flex items-center justify-between py-3">
          <button
            onClick={() => {
              haptic('selection');
              soundManager.play('swoosh');
              setSidebarOpen(true);
            }}
            className="p-2 rounded-lg hover:bg-muted transition-colors touch-target"
          >
            <Menu className="h-5 w-5 text-muted-foreground" />
          </button>

          <div className="text-center">
            <span className="text-base sm:text-lg font-serif text-foreground">
              {dayOfYear} <span className="italic text-muted-foreground">of</span> 365
            </span>
          </div>

          <button
            onClick={() => {
              haptic('selection');
              setTheme(theme === "dark" ? "light" : "dark");
            }}
            className="p-2 rounded-lg hover:bg-muted transition-colors touch-target"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5 text-muted-foreground" />
            ) : (
              <Moon className="h-5 w-5 text-muted-foreground" />
            )}
          </button>
        </div>

        {/* Content area */}
        {showGreeting ? (
          <>
            {/* Greeting (centered when no messages) */}
            <GreetingHeader displayName={displayName} />
            
            {/* Centered Input */}
            <div className="pb-8">
              <ChatInput
                onSend={handleSendMessage}
                disabled={isTyping}
                placeholder="Share your thoughts..."
                centered
              />
            </div>
          </>
        ) : (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 scrollbar-hide">
              {messages.map((msg, idx) => (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  isLatest={idx === messages.length - 1 && !streamingContent}
                />
              ))}

              {/* Streaming message */}
              {streamingContent && (
                <div className="flex justify-start">
                  <div className="chat-bubble-assistant">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {streamingContent}
                    </p>
                  </div>
                </div>
              )}

              {/* Typing indicator (before first token) */}
              {isTyping && !streamingContent && (
                <div className="flex justify-start">
                  <div className="chat-bubble-assistant">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input at bottom */}
            <div className="pb-4">
              <ChatInput
                onSend={handleSendMessage}
                disabled={isTyping}
                placeholder="Share your thoughts..."
              />
            </div>
          </>
        )}
      </PageContainer>
    </>
  );
};

export default HomePage;
