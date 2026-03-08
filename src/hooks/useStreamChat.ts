import { useCallback, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type Message = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
const MAX_MESSAGE_LENGTH = 10000;

interface StreamChatOptions {
  messages: Message[];
  context?: string;
  onDelta: (delta: string) => void;
  onDone: () => void;
  onError?: (error: Error) => void;
}

export function useStreamChat() {
  const abortControllerRef = useRef<AbortController | null>(null);

  const streamChat = useCallback(async ({ messages, context, onDelta, onDone, onError }: StreamChatOptions) => {
    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();

    try {
      // Get the user's session token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error("Please sign in to use AI features.");
        throw new Error("Not authenticated");
      }

      // Validate messages client-side
      for (const msg of messages) {
        if (msg.content.length > MAX_MESSAGE_LENGTH) {
          toast.error("Message is too long.");
          throw new Error("Message too long");
        }
      }

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ messages, ...(context ? { context } : {}) }),
        signal: abortControllerRef.current.signal,
      });

      if (resp.status === 401) {
        toast.error("Session expired. Please sign in again.");
        throw new Error("Unauthorized");
      }

      if (resp.status === 429) {
        toast.error("Rate limit exceeded. Please wait a moment before trying again.");
        throw new Error("Rate limit exceeded");
      }

      if (resp.status === 402) {
        toast.error("AI credits depleted. Please add funds to continue.");
        throw new Error("Payment required");
      }

      if (!resp.ok || !resp.body) {
        throw new Error("Failed to start stream");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        // Process line-by-line as data arrives
        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) onDelta(content);
          } catch {
            // Incomplete JSON split across chunks
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) onDelta(content);
          } catch { /* ignore */ }
        }
      }

      onDone();
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        return;
      }
      console.error("Stream chat error:", error);
      onError?.(error as Error);
      onDone();
    }
  }, []);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  return { streamChat, cancel };
}
