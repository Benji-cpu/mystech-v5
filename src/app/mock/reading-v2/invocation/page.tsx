"use client";

/**
 * Variant B — "Invocation"
 *
 * Same principles, opposite emphasis: the only thing on screen is what
 * you are here to ask. The deck sits behind the words as a ghost, and
 * deck + depth collapse into a single hairline of tappable text at the
 * foot of the page. Maximum quiet, minimum controls.
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Lock } from "lucide-react";

import {
  DeckCover,
  DeckSheet,
  DrawButton,
  DrawTransition,
  RitualOverlay,
} from "@/app/mock/_shared/reading/parts";
import { AMBIENT_LINE, DEPTHS, MOCK_DECKS, SUGGESTIONS, type DepthKey } from "@/app/mock/_shared/reading/data";

const SPRING = { type: "spring" as const, stiffness: 320, damping: 32 };

export default function InvocationPage() {
  const [selectedIds, setSelectedIds] = useState<string[]>(["chronicle"]);
  const [depthKey, setDepthKey] = useState<DepthKey>("three_card");
  const [question, setQuestion] = useState("");
  const [deckSheet, setDeckSheet] = useState(false);
  const [depthSheet, setDepthSheet] = useState(false);
  const [ritual, setRitual] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const [isPro, setIsPro] = useState(false);

  const decks = useMemo(
    () => MOCK_DECKS.filter((d) => selectedIds.includes(d.id)),
    [selectedIds]
  );
  const depth = DEPTHS.find((d) => d.key === depthKey)!;
  const lead = decks[0] ?? MOCK_DECKS[0];
  const hasQuestion = question.trim().length > 0;

  const deckLabel =
    decks.length === 1 ? lead.title : `${decks.length} decks`;

  return (
    <div
      className="daylight fixed inset-0 flex flex-col overflow-hidden"
      style={{ background: "var(--paper)" }}
    >
      {/* ── Ghost deck — rests half-sunk at the foot of the page.
             Present enough to rise into the draw, quiet enough to
             leave the question the whole upper page. ────────────── */}
      <motion.div
        className="pointer-events-none absolute bottom-[128px] left-1/2 -translate-x-1/2"
        animate={{ opacity: hasQuestion ? 0.14 : 0.1, y: [0, -6, 0] }}
        transition={{ y: { duration: 6, repeat: Infinity, ease: "easeInOut" } }}
      >
        <DeckCover deck={lead} className="h-[228px] w-[152px]" />
      </motion.div>

      <header className="relative z-10 flex shrink-0 items-center gap-1 px-4 pt-[calc(env(safe-area-inset-top)+10px)] pb-2">
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

      {/* ── The ask — the whole screen is this ─────────────────── */}
      <div className="relative z-10 flex min-h-0 flex-1 flex-col justify-center px-6 pb-[26%]">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value.slice(0, 200))}
          rows={2}
          placeholder="What are you sitting with?"
          className="display w-full resize-none bg-transparent text-center text-[27px] leading-[1.25] outline-none placeholder:opacity-40"
          style={{ color: "var(--ink)" }}
        />

        <AnimatePresence initial={false}>
          {!hasQuestion && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 flex flex-col items-center gap-3 overflow-hidden"
            >
              {SUGGESTIONS.slice(0, 3).map((s, i) => (
                <motion.button
                  key={s}
                  type="button"
                  onClick={() => setQuestion(s)}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.08, ...SPRING }}
                  className="whisper text-[15px]"
                  style={{ color: "var(--ink-mute)" }}
                >
                  {s}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── One hairline of tappable text, then the action ──────── */}
      <div className="relative z-10 shrink-0 px-6 pb-[calc(env(safe-area-inset-bottom)+16px)]">
        <div
          className="mb-4 flex items-center justify-center gap-2 border-t pt-3 text-[12px]"
          style={{ borderColor: "var(--line)", color: "var(--ink-mute)" }}
        >
          <button
            type="button"
            onClick={() => setDeckSheet(true)}
            className="max-w-[52%] truncate underline decoration-dotted underline-offset-4"
          >
            {deckLabel}
          </button>
          <span style={{ color: "var(--ink-faint)" }}>·</span>
          <button
            type="button"
            onClick={() => setDepthSheet(true)}
            className="underline decoration-dotted underline-offset-4"
          >
            {depth.count === 1 ? "one card" : `${wordFor(depth.count)} cards`}
          </button>
        </div>

        <DrawButton
          depth={depth}
          label={hasQuestion ? undefined : "Draw without asking"}
          showGlyphs={hasQuestion}
          outline={!hasQuestion}
          onDraw={() => setDrawing(true)}
          onHoldComplete={() => setRitual(true)}
        />
      </div>

      {/* ── Depth sheet — four quiet lines ──────────────────────── */}
      <AnimatePresence>
        {depthSheet && (
          <>
            <motion.div
              className="absolute inset-0 z-40"
              style={{ background: "rgba(10,8,6,0.55)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDepthSheet(false)}
            />
            <motion.div
              className="absolute inset-x-0 bottom-0 z-50 rounded-t-3xl px-5 pb-7 pt-3"
              style={{ background: "var(--paper)", borderTop: "1px solid var(--line)" }}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={SPRING}
            >
              <div
                className="mx-auto mb-4 h-1 w-9 rounded-full"
                style={{ background: "var(--line)" }}
              />
              {DEPTHS.map((d) => {
                const locked = !!d.pro && !isPro;
                const active = d.key === depthKey;
                return (
                  <button
                    key={d.key}
                    type="button"
                    onClick={() => {
                      if (locked) {
                        setIsPro(true);
                        return;
                      }
                      setDepthKey(d.key);
                      setDepthSheet(false);
                    }}
                    className="flex w-full items-center justify-between border-b py-3.5 text-left last:border-b-0"
                    style={{ borderColor: "var(--line-soft)", opacity: locked ? 0.45 : 1 }}
                  >
                    <span>
                      <span
                        className="display block text-[16px]"
                        style={{ color: active ? "var(--accent-gold)" : "var(--ink)" }}
                      >
                        {d.count === 1 ? "One card" : `${cap(wordFor(d.count))} cards`}
                      </span>
                      <span className="text-[12px]" style={{ color: "var(--ink-mute)" }}>
                        {d.blurb}
                      </span>
                    </span>
                    {locked && <Lock className="h-3.5 w-3.5" style={{ color: "var(--ink-mute)" }} />}
                  </button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <DeckSheet
        open={deckSheet}
        onClose={() => setDeckSheet(false)}
        selectedIds={selectedIds}
        onSelect={(id) => {
          setSelectedIds([id]);
          setDeckSheet(false);
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
        onReset={() => {
          setDrawing(false);
          setQuestion("");
        }}
      />
    </div>
  );
}

function wordFor(n: number) {
  return { 1: "one", 3: "three", 5: "five", 10: "ten" }[n] ?? String(n);
}
function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
