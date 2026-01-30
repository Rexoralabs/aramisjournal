import { useState, useRef, useLayoutEffect } from "react";
import { Send } from "lucide-react";
import gsap from "gsap";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, disabled, placeholder }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, delay: 0.3, ease: "power2.out" }
      );
    }
  }, []);

  const handleSubmit = () => {
    if (!message.trim() || disabled) return;
    onSend(message.trim());
    setMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Auto-resize textarea
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + "px";
    }
  };

  return (
    <div ref={containerRef} className="glass-card p-3">
      <div className="flex items-end gap-3">
        <textarea
          ref={inputRef}
          value={message}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || "What's on your mind?"}
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none min-h-[24px] max-h-[120px]"
        />
        <button
          onClick={handleSubmit}
          disabled={!message.trim() || disabled}
          className="p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
