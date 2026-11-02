import { cn } from "@/lib/utils";
import { renderMarkdown } from "@/lib/markdown";
import { useRef, useLayoutEffect } from "react";
import gsap from "gsap";

interface ChatMessageProps {
  message: { id: string; role: "user" | "assistant" | string; content: string };
  animate?: boolean;
  streaming?: boolean;
}

export function ChatMessage({ message, animate, streaming }: ChatMessageProps) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (animate && ref.current) {
      gsap.fromTo(ref.current, { opacity: 0, y: 12, filter: "blur(6px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.45, ease: "expo.out" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isUser = message.role === "user";
  return (
    <div ref={ref} className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      {isUser ? (
        <div className="chat-bubble-user max-w-[75%]">
          <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>
      ) : (
        <div className="max-w-full w-full text-foreground">
          <div
            className={cn("markdown-content text-[15px] leading-7", streaming && "streaming-caret")}
            dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }}
          />
        </div>
      )}
    </div>
  );
}
