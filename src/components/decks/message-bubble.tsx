"use client";

import { cn } from "@/lib/utils";
import { Sparkles, User } from "lucide-react";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

export function MessageBubble({ role, content, isStreaming }: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <div
      className={cn(
        "flex gap-3 p-4 rounded-lg",
        isUser ? "bg-[#c9a94e]/10" : "bg-muted/50"
      )}
    >
      <div
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
          isUser ? "bg-[#c9a94e]/20" : "bg-purple-500/20"
        )}
      >
        {isUser ? (
          <User className="w-4 h-4 text-[#c9a94e]" />
        ) : (
          <Sparkles className="w-4 h-4 text-purple-400" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground mb-1">
          {isUser ? "You" : "Mystic Guide"}
        </p>
        <div className="prose prose-invert prose-sm max-w-none">
          <p className="whitespace-pre-wrap break-words">
            {content}
            {isStreaming && (
              <span className="inline-block w-2 h-4 bg-purple-400 animate-pulse ml-0.5" />
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
