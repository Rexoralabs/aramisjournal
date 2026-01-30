import { cn } from "@/lib/utils";
import { ChatMessage as ChatMessageType } from "@/hooks/useChatHistory";
import { useRef, useLayoutEffect } from "react";
import gsap from "gsap";

interface ChatMessageProps {
  message: ChatMessageType;
  isLatest?: boolean;
}

export function ChatMessage({ message, isLatest }: ChatMessageProps) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (isLatest && ref.current) {
      gsap.fromTo(
        ref.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }
      );
    }
  }, [isLatest]);

  return (
    <div
      ref={ref}
      className={cn(
        "flex",
        message.role === "user" ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          message.role === "user" ? "chat-bubble-user" : "chat-bubble-assistant"
        )}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>
      </div>
    </div>
  );
}
