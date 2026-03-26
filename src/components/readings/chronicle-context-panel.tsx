"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

interface ChronicleContextPanelProps {
  conversation: Array<{ role: "user" | "assistant"; content: string }>;
  question: string;
  notes: string;
  onNotesChange: (notes: string) => void;
  className?: string;
}

const MAX_NOTES = 300;

export function ChronicleContextPanel({
  conversation,
  question,
  notes,
  onNotesChange,
  className,
}: ChronicleContextPanelProps) {
  const [threadOpen, setThreadOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);

  // Filter to meaningful dialogue — skip empty or very short messages
  const dialogue = conversation.filter((m) => m.content.trim().length > 20);
  const hasThread = dialogue.length >= 2;

  const threadSummary =
    dialogue.length > 0
      ? dialogue.length === 1
        ? `1 exchange`
        : `${dialogue.length} exchanges shared`
      : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={cn("rounded-xl overflow-hidden", className)}
    >
      {/* ── Conversation thread (only when we have data) ── */}
      {hasThread && (
        <div className="mb-2 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden">
          <button
            onClick={() => setThreadOpen((prev) => !prev)}
            className="w-full flex items-center gap-2.5 px-4 py-3 text-left hover:bg-white/5 transition-colors"
            aria-expanded={threadOpen}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#c9a94e] shrink-0" />
            <span className="flex-1 text-xs text-[#c9a94e] font-medium tracking-wide">
              From your Chronicle
            </span>
            {!threadOpen && threadSummary && (
              <span className="text-[10px] text-white/40 mr-1">{threadSummary}</span>
            )}
            <motion.div
              animate={{ rotate: threadOpen ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
              <ChevronDown className="w-3.5 h-3.5 text-white/40" />
            </motion.div>
          </button>

          <AnimatePresence>
            {threadOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="overflow-hidden"
              >
                <div className="px-3 pb-3 max-h-48 overflow-y-auto space-y-2">
                  {dialogue.map((msg, i) => (
                    <div
                      key={i}
                      className={cn(
                        "px-3 py-2 rounded-lg text-xs leading-relaxed",
                        msg.role === "user"
                          ? "bg-white/8 text-white/80 ml-4"
                          : "bg-[#c9a94e]/8 text-white/60 mr-4"
                      )}
                    >
                      <span
                        className={cn(
                          "block text-[9px] uppercase tracking-wider mb-1 font-medium",
                          msg.role === "user" ? "text-white/30" : "text-[#c9a94e]/50"
                        )}
                      >
                        {msg.role === "user" ? "You" : "Lyra"}
                      </span>
                      {msg.content}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ── Question (always visible) ── */}
      <div className="px-4 py-3 rounded-xl bg-white/5 border border-[#c9a94e]/30 mb-2">
        <p className="text-[10px] text-[#c9a94e]/60 uppercase tracking-wider mb-1.5">
          Your Question
        </p>
        <p className="text-sm text-white/80 italic leading-relaxed">
          &ldquo;{question}&rdquo;
        </p>
      </div>

      {/* ── Add more context ── */}
      <div className="rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden">
        <button
          onClick={() => setNotesOpen((prev) => !prev)}
          className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-white/5 transition-colors"
          aria-expanded={notesOpen}
        >
          <span className="flex-1 text-xs text-white/50">
            + Anything else to share?
          </span>
          <motion.div
            animate={{ rotate: notesOpen ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            <ChevronDown className="w-3.5 h-3.5 text-white/30" />
          </motion.div>
        </button>

        <AnimatePresence>
          {notesOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="overflow-hidden"
            >
              <div className="px-3 pb-3">
                <Textarea
                  value={notes}
                  onChange={(e) => {
                    if (e.target.value.length <= MAX_NOTES) {
                      onNotesChange(e.target.value);
                    }
                  }}
                  placeholder="A bit more background, a feeling, a hunch..."
                  className="bg-white/5 border-white/10 text-white/80 placeholder:text-white/30 text-xs resize-none min-h-[80px] focus-visible:ring-[#c9a94e]/30"
                  rows={3}
                />
                {notes.length > 0 && (
                  <p className="text-[10px] text-white/30 text-right mt-1">
                    {notes.length}/{MAX_NOTES}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
