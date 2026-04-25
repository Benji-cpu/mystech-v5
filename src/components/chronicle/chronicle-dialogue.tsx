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

function renderMarkdown(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    const bold = part.match(/^\*\*([^*]+)\*\*$/);
    if (bold) return <strong key={i} className="font-semibold">{bold[1]}</strong>;
    return part;
  });
}

const COLLAPSE_THRESHOLD = 300;
const PREVIEW_LENGTH = 250;

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
      {isAssistant && (
        <div className="shrink-0 mt-1.5 w-8 h-8 flex items-center justify-center">
          <LyraSigil
            size="sm"
            state={isLast && isStreaming ? 'speaking' : 'dormant'}
          />
        </div>
      )}

      <div
        className={cn(
          'rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed border',
          'chronicle-bubble',
          isAssistant ? 'chronicle-bubble-assistant rounded-tl-sm' : 'chronicle-bubble-user rounded-tr-sm'
        )}
      >
        <span className="whitespace-pre-wrap">{renderMarkdown(displayContent)}</span>
        {showCursor && (
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.7, repeat: Infinity }}
            className="chronicle-cursor inline-block w-0.5 h-3.5 ml-0.5 align-text-bottom"
          />
        )}
        {isLong && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="chronicle-expand block mt-1.5 text-xs transition-colors"
          >
            {expanded ? 'Show less' : 'Read more'}
          </button>
        )}
      </div>
    </motion.div>
  );
}

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
      className="chronicle-reading mt-2 rounded-2xl border p-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="chronicle-reading-bar w-1 h-4 rounded-full" />
        <span className="chronicle-reading-eyebrow text-[10px] uppercase tracking-[0.2em] font-medium">
          Your Reading
        </span>
      </div>

      <p className="chronicle-reading-body text-sm leading-relaxed whitespace-pre-wrap">
        {renderMarkdown(text)}
        {isStreaming && (
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.7, repeat: Infinity }}
            className="chronicle-cursor inline-block w-0.5 h-3.5 ml-0.5 align-text-bottom"
          />
        )}
      </p>
    </motion.div>
  );
}

export function ChronicleDialogue({
  messages,
  isStreaming = false,
  miniReading,
  showMiniReading = false,
  className,
}: ChronicleDialogueProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

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

      {showMiniReading && miniReading !== null && miniReading !== undefined && (
        <MiniReading text={miniReading} isStreaming={isStreaming} />
      )}

      <div ref={bottomRef} className="h-1" />
    </div>
  );
}
