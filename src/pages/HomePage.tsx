import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { Menu, Flame } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { GreetingHeader } from "@/components/chat/GreetingHeader";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { useUserProfile } from "@/hooks/useProfile";
import { useUserStreak } from "@/hooks/useStreaks";
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: profile } = useUserProfile();
  const { data: streakData } = useUserStreak();
  const { data: conversations = [] } = useChatConversations();
  const { data: messages = [] } = useChatMessages(currentConversationId);
  const createConversation = useCreateConversation();
  const addMessage = useAddMessage();
  const updateTitle = useUpdateConversationTitle();

  const displayName = profile?.display_name || "Writer";
  const currentStreak = streakData?.current_streak || 0;
  const today = new Date();

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleNewConversation = () => {
    setCurrentConversationId(null);
    setSidebarOpen(false);
  };

  const handleSendMessage = async (content: string) => {
    let conversationId = currentConversationId;

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

    // Simulate AI response (placeholder for actual AI integration)
    setIsTyping(true);
    setTimeout(async () => {
      const responses = [
        "That's a beautiful thought. What else is on your mind today?",
        "I appreciate you sharing that. How does this make you feel?",
        "Thank you for opening up. Would you like to explore this further?",
        "That's insightful. What led you to this realization?",
        "I'm here to listen. Tell me more about what you're experiencing.",
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      await addMessage.mutateAsync({
        conversationId: conversationId!,
        role: "assistant",
        content: randomResponse,
      });
      setIsTyping(false);
    }, 1500);
  };

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
        <div className="flex items-center justify-between py-2">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <Menu className="h-5 w-5 text-muted-foreground" />
          </button>

          <div className="flex items-center gap-4">
            <span className="text-sm font-ui text-muted-foreground">
              {format(today, "EEEE, MMM d")}
            </span>
            {currentStreak > 0 && (
              <div className="flex items-center gap-1 text-primary">
                <Flame className="h-4 w-4" />
                <span className="text-sm font-ui font-medium">{currentStreak}</span>
              </div>
            )}
          </div>
        </div>

        {/* Greeting (only show when no conversation selected or empty) */}
        {(!currentConversationId || messages.length === 0) && (
          <GreetingHeader displayName={displayName} />
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 scrollbar-hide">
          {messages.map((msg, idx) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              isLatest={idx === messages.length - 1}
            />
          ))}

          {isTyping && (
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

        {/* Input */}
        <div className="pb-4">
          <ChatInput
            onSend={handleSendMessage}
            disabled={isTyping}
            placeholder="Share your thoughts..."
          />
        </div>
      </PageContainer>
    </>
  );
};

export default HomePage;
