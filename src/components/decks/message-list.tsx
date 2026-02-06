"use client";

import { useRef, useEffect } from "react";
import { MessageBubble } from "./message-bubble";
import type { UIMessage } from "@ai-sdk/react";

interface MessageListProps {
  messages: UIMessage[];
  isLoading?: boolean;
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
      {messages.map((message, index) => {
        // Extract text content from message parts
        const textContent = message.parts
          ?.filter((p): p is { type: "text"; text: string } => p.type === "text")
          .map((p) => p.text)
          .join("\n") || "";

        if (!textContent) return null;

        const isStreaming =
          isLoading &&
          index === messages.length - 1 &&
          message.role === "assistant";

        return (
          <MessageBubble
            key={message.id}
            role={message.role as "user" | "assistant"}
            content={textContent}
            isStreaming={isStreaming}
          />
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
