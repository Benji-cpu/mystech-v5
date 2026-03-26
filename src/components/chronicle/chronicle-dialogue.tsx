'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LyraSigil } from '@/components/guide/lyra-sigil';
import type { ChronicleMessage } from './use-chronicle-state';

interface ChronicleDialogueProps {
  messages: ChronicleMessage[];
  isStreaming?: boolean;
  miniReading?: string | null;
  showMiniReading?: boolean;
  className?: string;
}

// ── Inline markdown (bold only) ──────────────────────────────────────────

function renderMarkdown(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    const bold = part.match(/^\*\*([^*]+)\*\*$/);
    if (bold) return <strong key={i} className="font-semibold">{bold[1]}</strong>;
    return part;
  });
}

// ── Collapsible threshold ────────────────────────────────────────────────

const COLLAPSE_THRESHOLD = 300;
const PREVIEW_LENGTH = 250;

// ── Message bubble ────────────────────────────────────────────────────────

interface MessageBubbleProps {
  message: ChronicleMessage;
  isLast: boolean;
  isStreaming: boolean;
}

function MessageBubble({ message, isLast, isStreaming }: MessageBubbleProps) {
  const isAssistant = message.role === 'assistant';
  const showCursor = isAssistant && isLast && isStreaming;
  const isLong = !isAssistant && message.content.length > COLLAPSE_THRESHOLD;
  const [expanded, setExpanded] = useState(false);

  const displayContent = isLong && !expanded
    ? message.content.slice(0, PREVIEW_LENGTH) + '...'
    : message.content;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={cn(
        'flex gap-3 max-w-[88%]',
        isAssistant ? 'self-start items-start' : 'self-end flex-row-reverse'
      )}
    >
      {/* Lyra avatar — only for assistant messages */}
      {isAssistant && (
        <div className="shrink-0 mt-1.5 w-8 h-8 flex items-center justify-center">
          <LyraSigil
            size="sm"
            state={isLast && isStreaming ? 'speaking' : 'dormant'}
          />
        </div>
      )}

      {/* Bubble */}
      <div
        className={cn(
          'rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
          isAssistant
            ? 'bg-purple-950/60 border border-purple-500/15 text-white/85 rounded-tl-sm'
            : 'bg-[#c9a94e]/12 border border-[#c9a94e]/20 text-white/90 rounded-tr-sm'
        )}
      >
        <span className="whitespace-pre-wrap">{renderMarkdown(displayContent)}</span>
        {showCursor && (
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.7, repeat: Infinity }}
            className="inline-block w-0.5 h-3.5 bg-[#c9a94e] ml-0.5 align-text-bottom"
          />
        )}
        {isLong && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="block mt-1.5 text-xs text-[#c9a94e]/60 hover:text-[#c9a94e]/90 transition-colors"
          >
            {expanded ? 'Show less' : 'Read more'}
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ── Mini-reading section ──────────────────────────────────────────────────

interface MiniReadingProps {
  text: string;
  isStreaming: boolean;
}

function MiniReading({ text, isStreaming }: MiniReadingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="mt-2 rounded-2xl bg-gradient-to-b from-purple-950/40 to-indigo-950/40 border border-[#c9a94e]/15 p-4"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1 h-4 rounded-full bg-gradient-to-b from-[#c9a94e] to-[#c9a94e]/30" />
        <span className="text-[10px] uppercase tracking-[0.2em] text-[#c9a94e]/70 font-medium">
          Your Reading
        </span>
      </div>

      {/* Text */}
      <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">
        {renderMarkdown(text)}
        {isStreaming && (
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.7, repeat: Infinity }}
            className="inline-block w-0.5 h-3.5 bg-[#c9a94e] ml-0.5 align-text-bottom"
          />
        )}
      </p>
    </motion.div>
  );
}

// ── Main component ────────────────────────────────────────────────────────

export function ChronicleDialogue({
  messages,
  isStreaming = false,
  miniReading,
  showMiniReading = false,
  className,
}: ChronicleDialogueProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages, miniReading]);

  if (messages.length === 0 && !showMiniReading) {
    return <div className={cn('flex flex-col gap-3 py-2', className)} />;
  }

  return (
    <div className={cn('flex flex-col gap-3 py-2', className)}>
      <AnimatePresence initial={false}>
        {messages.map((msg, i) => (
          <MessageBubble
            key={i}
            message={msg}
            isLast={i === messages.length - 1}
            isStreaming={isStreaming}
          />
        ))}
      </AnimatePresence>

      {/* Mini-reading */}
      {showMiniReading && miniReading !== null && miniReading !== undefined && (
        <MiniReading text={miniReading} isStreaming={isStreaming} />
      )}

      <div ref={bottomRef} className="h-1" />
    </div>
  );
}
