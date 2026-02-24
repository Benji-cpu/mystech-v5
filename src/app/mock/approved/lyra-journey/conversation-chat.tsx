"use client";

import { cn } from "@/lib/utils";
import { LyraChatNarration } from "@/app/mock/lyra/v3/lyra-v3-narration";
import { AnchorStrip } from "./anchor-strip";
import type { Anchor } from "./lyra-v4-data";
import type { ConversationLine } from "./lyra-v4-data";

interface ConversationChatProps {
  messages: ConversationLine[];
  visibleCount: number;
  typingIndex: number;
  onMessageComplete: (index: number) => void;
  anchors: Anchor[];
  readinessPercent: number;
  highlightedAnchorId: string | null;
  onAnchorTap: (anchorId: string) => void;
  convergenceFooter?: React.ReactNode;
  className?: string;
}

export function ConversationChat({
  messages,
  visibleCount,
  typingIndex,
  onMessageComplete,
  anchors,
  readinessPercent,
  highlightedAnchorId,
  onAnchorTap,
  convergenceFooter,
  className,
}: ConversationChatProps) {
  return (
    <div className={cn("flex flex-col h-full min-h-0", className)}>
      {/* Anchor strip at top */}
      {anchors.length > 0 && (
        <div className="shrink-0 px-3 pt-1 pb-1">
          <AnchorStrip
            anchors={anchors}
            readinessPercent={readinessPercent}
            highlightedAnchorId={highlightedAnchorId}
            onAnchorTap={onAnchorTap}
          />
        </div>
      )}

      {/* Chat messages (scrollable) */}
      <LyraChatNarration
        messages={messages}
        visibleCount={visibleCount}
        typingIndex={typingIndex}
        onMessageComplete={onMessageComplete}
        className="flex-1 px-4 py-2"
        footer={convergenceFooter}
      />

      {/* Mock input bar */}
      <div className="shrink-0 px-4 pb-2 pt-1">
        <div className="flex items-center gap-2 h-10 px-4 rounded-full bg-white/5 border border-white/8">
          <span className="text-xs text-white/20 flex-1">
            Share your story...
          </span>
          <span className="text-white/15 text-sm">&#x2191;</span>
        </div>
      </div>
    </div>
  );
}
