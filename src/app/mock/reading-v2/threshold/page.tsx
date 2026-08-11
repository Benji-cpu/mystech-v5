"use client";

/**
 * Variant A — "The Threshold"
 *
 * The deck is the hero. It is physically present from the first frame and
 * is the same object that fans into the spread, so Begin is a passage
 * rather than a cut. Deck and depth are rendered as state you can tap,
 * never as questions you must answer. One viewport, no scroll, every
 * control in the bottom third.
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft } from "lucide-react";

import {
  DeckSheet,
  DeckStack,
  DepthStrip,
  DrawButton,
  DrawTransition,
  IntentionLine,
  RitualOverlay,
} from "../_shared/parts";
import { AMBIENT_LINE, DEPTHS, MOCK_DECKS, SUGGESTIONS, type DepthKey } from "../_shared/data";

export default function ThresholdPage() {
  const [selectedIds, setSelectedIds] = useState<string[]>(["chronicle"]);
  const [depthKey, setDepthKey] = useState<DepthKey>("three_card");
  const [question, setQuestion] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [ritual, setRitual] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const [isPro, setIsPro] = useState(false);

  const decks = useMemo(
    () => MOCK_DECKS.filter((d) => selectedIds.includes(d.id)),
    [selectedIds]
  );
  const depth = DEPTHS.find((d) => d.key === depthKey)!;
  const lead = decks[0] ?? MOCK_DECKS[0];

  const deckLabel =
    decks.length === 1
      ? lead.title
      : `${lead.title} + ${decks.length - 1} more`;
  const totalCards = decks.reduce((n, d) => n + d.cardCount, 0);

  const reset = () => {
    setDrawing(false);
    setRitual(false);
    setQuestion("");
  };

  return (
    <div
      className="daylight fixed inset-0 flex flex-col overflow-hidden"
      style={{ background: "var(--paper)" }}
    >
      {/* ── Ambient header — context, not chrome ───────────────── */}
      <header className="relative flex shrink-0 items-center gap-1 px-4 pt-[calc(env(safe-area-inset-top)+10px)] pb-2">
        <Link href="/mock/reading-v2" aria-label="Back" className="-ml-2 p-2">
          <ChevronLeft className="h-5 w-5" style={{ color: "var(--ink-faint)" }} />
        </Link>
        {/* Prototype-only plan switch, parked left of the dev badge */}
        <button
          type="button"
          onClick={() => setIsPro((p) => !p)}
          className="rounded-full px-2 py-1 text-[10px] uppercase tracking-wider"
          style={{
            color: isPro ? "var(--accent-gold)" : "var(--ink-faint)",
            border: "1px solid var(--line)",
          }}
        >
          {isPro ? "pro" : "free"}
        </button>
        <span className="eyebrow pointer-events-none absolute left-1/2 -translate-x-1/2 whitespace-nowrap">
          {AMBIENT_LINE}
        </span>
      </header>

      {/* ── The deck — dominant, breathing, tappable ────────────── */}
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-5 px-6">
        <DeckStack decks={decks} width={148} onTap={() => setSheetOpen(true)} />

        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="max-w-full text-center"
        >
          <p
            className="display truncate text-[19px] leading-tight"
            style={{ color: "var(--ink)" }}
          >
            {deckLabel}
          </p>
          <p className="mt-1 text-[12px]" style={{ color: "var(--ink-faint)" }}>
            {totalCards} cards · tap to change
          </p>
        </button>
      </div>

      {/* ── Thumb zone — intention, depth, action ───────────────── */}
      <div className="shrink-0 px-4 pb-[calc(env(safe-area-inset-bottom)+14px)]">
        <IntentionLine value={question} onChange={setQuestion} />

        {/* Starter intentions — context-derived in the real build */}
        <AnimatePresence initial={false}>
          {!question && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div
                className="flex gap-2 overflow-x-auto pb-1 pt-2.5"
                style={{ scrollbarWidth: "none" }}
              >
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setQuestion(s)}
                    className="shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-[12px]"
                    style={{
                      border: "1px solid var(--line)",
                      color: "var(--ink-mute)",
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-3">
          <DepthStrip
            value={depthKey}
            onChange={setDepthKey}
            isPro={isPro}
            onLocked={() => setIsPro(true)}
          />
          <p
            className="mt-1.5 text-center text-[11px]"
            style={{ color: "var(--ink-faint)" }}
          >
            {depth.blurb}
          </p>
        </div>

        <DrawButton
          depth={depth}
          onDraw={() => setDrawing(true)}
          onHoldComplete={() => setRitual(true)}
          className="mt-3"
        />
      </div>

      <DeckSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        selectedIds={selectedIds}
        onSelect={(id) => {
          setSelectedIds([id]);
          setSheetOpen(false);
        }}
        onToggleBlend={(id) =>
          setSelectedIds((prev) =>
            prev.includes(id)
              ? prev.length > 1
                ? prev.filter((x) => x !== id)
                : prev
              : [...prev, id]
          )
        }
      />

      <RitualOverlay
        open={ritual}
        onDone={() => {
          setRitual(false);
          setDrawing(true);
        }}
        onCancel={() => setRitual(false)}
      />

      <DrawTransition
        open={drawing}
        deck={lead}
        count={depth.count}
        onReset={reset}
      />
    </div>
  );
}
