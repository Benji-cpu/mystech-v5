"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Check, Lock, Mic, Plus, X } from "lucide-react";
import { DEPTHS, MOCK_DECKS, type Depth, type DepthKey, type MockDeck } from "./data";

const SPRING = { type: "spring" as const, stiffness: 320, damping: 32 };

/* ────────────────────────────────────────────────────────────────
 * Deck cover — stand-in for the real cover image
 * ──────────────────────────────────────────────────────────────── */

export function DeckCover({
  deck,
  className,
  style,
}: {
  deck: MockDeck;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={cn("relative overflow-hidden rounded-[10px]", className)}
      style={{
        background: `linear-gradient(150deg, ${deck.hueA}, ${deck.hueB})`,
        boxShadow: "0 8px 28px -10px rgba(0,0,0,0.55)",
        ...style,
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="select-none"
          style={{ color: "rgba(242,234,217,0.34)", fontSize: "1.9em", lineHeight: 1 }}
        >
          {deck.glyph}
        </span>
      </div>
      {/* hairline inset — the editorial "printed edge" */}
      <div
        className="pointer-events-none absolute inset-[6px] rounded-[6px]"
        style={{ border: "1px solid rgba(242,234,217,0.16)" }}
      />
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
 * Deck stack — the physical object. Tapping it opens the switcher.
 * Depth of the stack reflects the card count you're about to draw.
 * ──────────────────────────────────────────────────────────────── */

export function DeckStack({
  decks,
  width,
  onTap,
  breathing = true,
}: {
  decks: MockDeck[];
  width: number;
  onTap?: () => void;
  breathing?: boolean;
}) {
  const reduced = useReducedMotion();
  const height = width * 1.5;
  const lead = decks[0];

  return (
    <motion.button
      type="button"
      onClick={onTap}
      aria-label="Change deck"
      className="relative block"
      style={{ width, height }}
      whileTap={{ scale: 0.97 }}
      animate={breathing && !reduced ? { y: [0, -5, 0] } : {}}
      transition={
        breathing && !reduced
          ? { duration: 5.5, repeat: Infinity, ease: "easeInOut" }
          : SPRING
      }
    >
      {/* Under-cards — the stack has heft */}
      {[2, 1].map((i) => (
        <div
          key={i}
          className="absolute inset-0"
          style={{
            transform: `translate(${i * 5}px, ${i * 5}px) rotate(${i * 1.6}deg)`,
            opacity: 0.42 - i * 0.12,
          }}
        >
          <DeckCover
            deck={decks[Math.min(i, decks.length - 1)] ?? lead}
            className="h-full w-full"
          />
        </div>
      ))}

      {/* Lead card */}
      <motion.div layoutId="deck-stack-lead" className="absolute inset-0">
        <DeckCover deck={lead} className="h-full w-full" />
      </motion.div>

      {/* Blend badge when more than one deck is in play */}
      {decks.length > 1 && (
        <div
          className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-[11px] font-medium"
          style={{
            background: "var(--accent-gold)",
            color: "var(--paper)",
          }}
        >
          {decks.length}
        </div>
      )}
    </motion.button>
  );
}

/* ────────────────────────────────────────────────────────────────
 * Depth strip — spread selection collapsed into one 44px row.
 * Four glyph clusters, one tap, no accordion, no scroll.
 * ──────────────────────────────────────────────────────────────── */

export function DepthStrip({
  value,
  onChange,
  isPro,
  onLocked,
  className,
}: {
  value: DepthKey;
  onChange: (d: DepthKey) => void;
  isPro: boolean;
  onLocked?: () => void;
  className?: string;
}) {
  return (
    <div className={cn("flex items-stretch gap-1.5", className)}>
      {DEPTHS.map((d) => {
        const locked = !!d.pro && !isPro;
        const active = d.key === value;
        return (
          <button
            key={d.key}
            type="button"
            onClick={() => (locked ? onLocked?.() : onChange(d.key))}
            aria-label={d.action}
            aria-pressed={active}
            className="relative flex h-11 flex-1 items-center justify-center rounded-lg transition-colors"
            style={{
              background: active ? "var(--paper-warm)" : "transparent",
              border: `1px solid ${active ? "var(--accent-gold)" : "var(--line)"}`,
              opacity: locked ? 0.42 : 1,
            }}
          >
            <DepthGlyphs count={d.count} active={active} />
            {locked && (
              <Lock
                className="absolute right-1 top-1 h-2.5 w-2.5"
                style={{ color: "var(--ink-mute)" }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

function DepthGlyphs({ count, active }: { count: number; active: boolean }) {
  // 10 renders as a cross silhouette rather than ten slivers
  if (count === 10) {
    return (
      <div className="grid grid-cols-3 gap-[2px]">
        {[0, 1, 0, 1, 1, 1, 0, 1, 0].map((on, i) => (
          <span
            key={i}
            className="block h-[5px] w-[3.5px] rounded-[1px]"
            style={{
              background: on
                ? active
                  ? "var(--accent-gold)"
                  : "var(--ink-mute)"
                : "transparent",
            }}
          />
        ))}
      </div>
    );
  }
  return (
    <div className="flex items-center gap-[3px]">
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className="block rounded-[1.5px]"
          style={{
            width: count === 1 ? 9 : 6,
            height: count === 1 ? 14 : 10,
            background: active ? "var(--accent-gold)" : "var(--ink-mute)",
          }}
        />
      ))}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
 * Deck sheet — horizontal snap carousel over the bottom half.
 * Native scroll-snap: one flick, thumb-height, no page scroll.
 * ──────────────────────────────────────────────────────────────── */

export function DeckSheet({
  open,
  ...rest
}: {
  open: boolean;
  onClose: () => void;
  selectedIds: string[];
  onSelect: (id: string) => void;
  onToggleBlend: (id: string) => void;
}) {
  // Body lives in an inner component so blend mode resets by unmounting
  // rather than by a setState-in-effect.
  return <AnimatePresence>{open && <DeckSheetBody {...rest} />}</AnimatePresence>;
}

function DeckSheetBody({
  onClose,
  selectedIds,
  onSelect,
  onToggleBlend,
}: {
  onClose: () => void;
  selectedIds: string[];
  onSelect: (id: string) => void;
  onToggleBlend: (id: string) => void;
}) {
  const [blendMode, setBlendMode] = useState(false);

  return (
        <>
          <motion.div
            className="absolute inset-0 z-40"
            style={{ background: "rgba(10,8,6,0.55)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="absolute inset-x-0 bottom-0 z-50 rounded-t-3xl pb-6 pt-3"
            style={{
              background: "var(--paper)",
              borderTop: "1px solid var(--line)",
              boxShadow: "0 -20px 50px -20px rgba(0,0,0,0.6)",
            }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={SPRING}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.4 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 90) onClose();
            }}
          >
            <div
              className="mx-auto mb-3 h-1 w-9 rounded-full"
              style={{ background: "var(--line)" }}
            />

            <div className="mb-3 flex items-center justify-between px-5">
              <span className="eyebrow">
                {blendMode ? "Add to the draw" : "Read from"}
              </span>
              <button
                type="button"
                onClick={() => setBlendMode((b) => !b)}
                className="flex items-center gap-1 text-[12px]"
                style={{ color: blendMode ? "var(--accent-gold)" : "var(--ink-mute)" }}
              >
                <Plus className="h-3 w-3" />
                {blendMode ? "Done blending" : "Blend decks"}
              </button>
            </div>

            <div
              className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2"
              // scroll-padding, or snap-mandatory pins the first cover flush
              // to the viewport edge and eats the container padding
              style={{ scrollbarWidth: "none", scrollPaddingLeft: 20 }}
            >
              {MOCK_DECKS.map((deck) => {
                const isSelected = selectedIds.includes(deck.id);
                const isLead = selectedIds[0] === deck.id;
                return (
                  <button
                    key={deck.id}
                    type="button"
                    onClick={() => (blendMode ? onToggleBlend(deck.id) : onSelect(deck.id))}
                    className="relative shrink-0 snap-start text-left"
                    style={{ width: 108 }}
                  >
                    <div className="relative">
                      <DeckCover
                        deck={deck}
                        className="h-[162px] w-[108px]"
                        style={{
                          outline: isSelected
                            ? "2px solid var(--accent-gold)"
                            : "1px solid var(--line)",
                          outlineOffset: 2,
                          opacity: isSelected || !blendMode ? 1 : 0.55,
                        }}
                      />
                      {isSelected && (
                        <div
                          className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full"
                          style={{ background: "var(--accent-gold)" }}
                        >
                          <Check className="h-3 w-3" style={{ color: "var(--paper)" }} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                    <p
                      className="mt-2 line-clamp-2 text-[12px] leading-tight"
                      style={{ color: isLead ? "var(--ink)" : "var(--ink-soft)" }}
                    >
                      {deck.title}
                    </p>
                    <p className="text-[11px]" style={{ color: "var(--ink-faint)" }}>
                      {deck.cardCount} cards
                    </p>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </>
  );
}

/* ────────────────────────────────────────────────────────────────
 * Primary action — tap to draw, hold to settle first.
 * Depth lives on the button, so there is no separate spread step.
 * ──────────────────────────────────────────────────────────────── */

export function DrawButton({
  depth,
  onDraw,
  onHoldComplete,
  className,
  label,
  showGlyphs = true,
  outline = false,
  hint = "Hold to settle first",
}: {
  depth: Depth;
  onDraw: () => void;
  onHoldComplete: () => void;
  className?: string;
  /** Overrides the depth-derived label */
  label?: string;
  showGlyphs?: boolean;
  /** Quiet treatment — used when nothing has been asked yet */
  outline?: boolean;
  /** Line under the button; pass null to omit */
  hint?: string | null;
}) {
  const [holding, setHolding] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fired = useRef(false);

  const start = () => {
    fired.current = false;
    setHolding(true);
    timer.current = setTimeout(() => {
      fired.current = true;
      setHolding(false);
      onHoldComplete();
    }, 650);
  };

  const end = () => {
    if (timer.current) clearTimeout(timer.current);
    setHolding(false);
    if (!fired.current) onDraw();
  };

  const cancel = () => {
    if (timer.current) clearTimeout(timer.current);
    setHolding(false);
    fired.current = true;
  };

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  return (
    <div className={cn("relative", className)}>
      <motion.button
        type="button"
        onPointerDown={start}
        onPointerUp={end}
        onPointerLeave={cancel}
        onPointerCancel={cancel}
        className="relative flex h-14 w-full items-center justify-center gap-2.5 overflow-hidden rounded-full text-[15px] font-medium transition-colors"
        style={{
          background: outline ? "transparent" : "var(--ink)",
          color: outline ? "var(--ink-mute)" : "var(--paper)",
          border: `1px solid ${outline ? "var(--line)" : "var(--ink)"}`,
        }}
        whileTap={{ scale: 0.985 }}
      >
        {/* Hold-to-settle fill */}
        <motion.span
          className="absolute inset-y-0 left-0"
          style={{ background: "var(--accent-gold)", opacity: 0.9 }}
          initial={{ width: 0 }}
          animate={{ width: holding ? "100%" : 0 }}
          transition={{ duration: holding ? 0.65 : 0.2, ease: "linear" }}
        />
        <span className="relative flex items-center gap-2.5">
          {label ?? depth.action}
          {showGlyphs && (
            <span className="flex items-center gap-[3px]">
              {Array.from({ length: Math.min(depth.count, 5) }).map((_, i) => (
                <span
                  key={i}
                  className="block h-3.5 w-2 rounded-[1.5px]"
                  style={{ background: "var(--paper)", opacity: 0.55 }}
                />
              ))}
              {depth.count > 5 && (
                <span className="ml-1 text-[12px] opacity-60">+5</span>
              )}
            </span>
          )}
        </span>
      </motion.button>
      {hint && (
        <p className="mt-2 text-center text-[11px]" style={{ color: "var(--ink-faint)" }}>
          {hint}
        </p>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
 * Ritual overlay — the "on request" slow path. Same button,
 * different pressure. Three breaths, then it draws itself.
 * ──────────────────────────────────────────────────────────────── */

const BEATS = ["Breathe in", "Let it go", "Once more", "Now — ask"];

export function RitualOverlay({
  open,
  ...rest
}: {
  open: boolean;
  onDone: () => void;
  onCancel: () => void;
}) {
  // Inner component so the breath counter resets by unmounting.
  return <AnimatePresence>{open && <RitualBody {...rest} />}</AnimatePresence>;
}

function RitualBody({
  onDone,
  onCancel,
}: {
  onDone: () => void;
  onCancel: () => void;
}) {
  const [beat, setBeat] = useState(0);

  useEffect(() => {
    if (beat >= BEATS.length) {
      const t = setTimeout(onDone, 600);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setBeat((b) => b + 1), 2600);
    return () => clearTimeout(t);
  }, [beat, onDone]);

  return (
        <motion.div
          className="absolute inset-0 z-[60] flex flex-col items-center justify-center"
          style={{ background: "var(--paper)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            onClick={onCancel}
            className="absolute right-4 top-4 p-2"
            aria-label="Skip settling"
          >
            <X className="h-5 w-5" style={{ color: "var(--ink-faint)" }} />
          </button>

          <motion.div
            className="rounded-full"
            style={{ border: "1px solid var(--accent-gold)" }}
            animate={{
              width: beat % 2 === 0 ? 168 : 92,
              height: beat % 2 === 0 ? 168 : 92,
              opacity: beat % 2 === 0 ? 0.9 : 0.45,
            }}
            transition={{ duration: 2.4, ease: "easeInOut" }}
          />
          <AnimatePresence mode="wait">
            <motion.p
              key={beat}
              className="whisper absolute bottom-[32%] text-[17px]"
              style={{ color: "var(--ink-soft)" }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              {BEATS[Math.min(beat, BEATS.length - 1)]}
            </motion.p>
          </AnimatePresence>
        </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────────
 * Intention line — one row, expands on focus, never blocks.
 * ──────────────────────────────────────────────────────────────── */

export function IntentionLine({
  value,
  onChange,
  placeholder = "What are you sitting with?",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div
      className="flex items-center gap-2 rounded-xl px-3.5"
      style={{
        background: "var(--paper-card)",
        border: "1px solid var(--line)",
        minHeight: 48,
      }}
    >
      <input
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, 200))}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent py-3 text-[14px] outline-none"
        style={{ color: "var(--ink)" }}
      />
      <button type="button" aria-label="Speak your intention" className="shrink-0 p-1">
        <Mic className="h-4 w-4" style={{ color: "var(--ink-faint)" }} />
      </button>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
 * Draw transition — the stack becomes the spread. No hard cut.
 * ──────────────────────────────────────────────────────────────── */

export function DrawTransition({
  open,
  deck,
  count,
  onReset,
}: {
  open: boolean;
  deck: MockDeck;
  count: number;
  onReset: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="absolute inset-0 z-[70] flex flex-col items-center justify-center gap-8"
          style={{ background: "var(--paper)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="flex items-end justify-center gap-2">
            {Array.from({ length: Math.min(count, 5) }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ x: 0, y: 0, rotate: 0, opacity: 0 }}
                animate={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
                transition={{ delay: i * 0.12, ...SPRING }}
              >
                <DeckCover deck={deck} className="h-[126px] w-[84px]" />
              </motion.div>
            ))}
          </div>
          <div className="text-center">
            <p className="whisper text-[15px]" style={{ color: "var(--ink-mute)" }}>
              The cards are settling…
            </p>
            <p className="eyebrow mt-6">Existing ceremony takes over here</p>
            <button
              type="button"
              onClick={onReset}
              className="mt-4 rounded-full px-4 py-2 text-[12px]"
              style={{ border: "1px solid var(--line)", color: "var(--ink-soft)" }}
            >
              Back to the start
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
