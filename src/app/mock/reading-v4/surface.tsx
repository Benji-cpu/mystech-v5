"use client";

/**
 * "In Hand" — the pre-reading with no setup in it.
 *
 * The premise this discards: that choosing a deck, a depth and a question
 * are three inputs that need three controls. They aren't inputs. They're a
 * person picking up a deck, dwelling on something, and pulling cards.
 *
 *   swipe    your decks are objects you push past one another
 *   hold     cards lift off the stack one at a time — 1, 3, 5, 10.
 *            Dwell time IS depth. A deeper reading costs you patience.
 *   release  they fly into the spread
 *
 * The question is not asked here at all. It is captured over the dead time
 * while the cards are already flying, so it can never gate the draw.
 *
 * A gesture-only interface excludes people, so "⋯" opens the same actions
 * as ordinary buttons. That panel is a peer, not a consolation.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { MoreHorizontal, Mic } from "lucide-react";

import { DeckCover } from "@/app/mock/_shared/reading/parts";
import { MOCK_DECKS, AMBIENT_LINE } from "@/app/mock/_shared/reading/data";

const HINT_KEY = "mystech_mock_inhand_hint_v1";

interface Tier {
  count: number;
  ms: number;
  label: string;
  pro?: boolean;
}

/** Dwell thresholds. Ten cards asks four seconds of your attention. */
const TIERS: readonly Tier[] = [
  { count: 1, ms: 500, label: "One card" },
  { count: 3, ms: 1400, label: "Three cards" },
  { count: 5, ms: 2500, label: "Five cards", pro: true },
  { count: 10, ms: 4000, label: "Ten cards — the long look", pro: true },
];

const SLOT_RATIO = 0.62; // deck occupies 62% of the viewport width

function tierFor(ms: number, maxCount: number) {
  let current = 0;
  for (const t of TIERS) if (ms >= t.ms && t.count <= maxCount) current = t.count;
  return current;
}

/** Progress 0..1 toward the next reachable tier, for the dwell ring. */
function progressFor(ms: number, maxCount: number) {
  const next = TIERS.find((t) => t.count <= maxCount && ms < t.ms);
  if (!next) return 1;
  const prev = [...TIERS].reverse().find((t) => ms >= t.ms);
  const from = prev ? prev.ms : 0;
  return Math.max(0, Math.min(1, (ms - from) / (next.ms - from)));
}

export default function InHandSurface() {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [holding, setHolding] = useState(false);
  const [heldMs, setHeldMs] = useState(0);
  const [drawn, setDrawn] = useState<number | null>(null);
  const [question, setQuestion] = useState("");
  const [panel, setPanel] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [showHint, setShowHint] = useState(() => {
    try {
      return !localStorage.getItem(HINT_KEY);
    } catch {
      return true;
    }
  });

  const trackRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef(0);
  const originRef = useRef({ x: 0, y: 0 });
  const cancelledRef = useRef(false);

  const maxCount = isPro ? 10 : 3;
  const deck = MOCK_DECKS[index] ?? MOCK_DECKS[0];
  const step = tierFor(heldMs, maxCount);
  const ring = holding ? progressFor(heldMs, maxCount) : 0;

  const stopLoop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  useEffect(() => stopLoop, [stopLoop]);

  const dismissHint = useCallback(() => {
    try {
      localStorage.setItem(HINT_KEY, "1");
    } catch {
      /* storage unavailable */
    }
    setShowHint(false);
  }, []);

  // ── The gesture ────────────────────────────────────────────────

  const endHold = useCallback(() => {
    stopLoop();
    const elapsed = performance.now() - startRef.current;
    setHolding(false);
    setHeldMs(0);
    setBlocked(false);
    if (cancelledRef.current) return;
    const count = tierFor(elapsed, maxCount);
    // Releasing before the first tier does nothing — a brush against the
    // screen must never spend a credit.
    if (count > 0) {
      dismissHint();
      setDrawn(count);
    }
  }, [maxCount, stopLoop, dismissHint]);

  const beginHold = useCallback(
    (e: React.PointerEvent) => {
      if (drawn !== null) return;
      cancelledRef.current = false;
      originRef.current = { x: e.clientX, y: e.clientY };
      startRef.current = performance.now();
      setHolding(true);

      const tick = () => {
        const ms = performance.now() - startRef.current;
        setHeldMs(ms);
        // Free plan: the stack visibly refuses to give up more.
        setBlocked(!isPro && ms >= TIERS[2].ms);
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);

      window.addEventListener("pointerup", endHold, { once: true });
      window.addEventListener("pointercancel", endHold, { once: true });
    },
    [drawn, isPro, endHold]
  );

  // Sliding the finger means you meant to browse decks, not to draw.
  const maybeCancel = useCallback(
    (e: React.PointerEvent) => {
      if (!holding) return;
      const dx = Math.abs(e.clientX - originRef.current.x);
      const dy = Math.abs(e.clientY - originRef.current.y);
      if (dx > 12 || dy > 24) {
        cancelledRef.current = true;
        stopLoop();
        setHolding(false);
        setHeldMs(0);
        setBlocked(false);
      }
    },
    [holding, stopLoop]
  );

  // ── Which deck is centred ──────────────────────────────────────

  const onScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const slot = el.clientWidth * SLOT_RATIO;
    const next = Math.round(el.scrollLeft / slot);
    setIndex((prev) => (next !== prev && next >= 0 && next < MOCK_DECKS.length ? next : prev));
  }, []);

  const reset = () => {
    setDrawn(null);
    setQuestion("");
  };

  const whisper = holding
    ? step === 0
      ? "…"
      : blocked
        ? "Five cards needs Pro"
        : (TIERS.find((t) => t.count === step)?.label ?? "")
    : showHint
      ? "Press and hold the deck"
      : "Hold to draw · longer for more";

  return (
    <div className="dark fixed inset-0" style={{ background: "var(--paper)" }}>
      {/* Warm floor light behind the deck — full bleed */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 55% at 50% 42%, rgba(201,169,78,0.13), transparent 70%)",
        }}
      />

      {/* The deck is sized as a share of THIS column, not the viewport.
          Unconstrained, a 1440px-wide desktop produced an 893px card
          1340px tall — taller than the window, so the page rendered
          empty. Everything below lives in the column, including the
          absolutely-positioned overlays. */}
      <div className="relative mx-auto flex h-full w-full max-w-[460px] flex-col overflow-hidden">

      {/* ── Thin chrome ────────────────────────────────────────── */}
      <header className="relative z-20 flex shrink-0 items-center justify-between px-4 pt-[calc(env(safe-area-inset-top)+12px)]">
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
        <span className="eyebrow">{AMBIENT_LINE}</span>
        <button
          type="button"
          onClick={() => setPanel(true)}
          aria-label="Draw using buttons instead"
          className="p-2"
        >
          <MoreHorizontal className="h-5 w-5" style={{ color: "var(--ink-mute)" }} />
        </button>
      </header>

      {/* ── The deck, in hand ──────────────────────────────────── */}
      <div className="relative z-10 flex min-h-0 flex-1 flex-col justify-center">
        <div className="relative">
        <div
          ref={trackRef}
          onScroll={onScroll}
          className="flex snap-x snap-mandatory overflow-x-auto overflow-y-hidden"
          style={{
            scrollbarWidth: "none",
            // holding must not be interpreted as a scroll gesture
            touchAction: holding ? "none" : "pan-x",
            // Neighbouring decks fade out rather than being sliced off at
            // the column edge, which read as a rendering artifact.
            WebkitMaskImage:
              "linear-gradient(to right, transparent 0, #000 9%, #000 91%, transparent 100%)",
            maskImage:
              "linear-gradient(to right, transparent 0, #000 9%, #000 91%, transparent 100%)",
          }}
        >
          {/* Spacers, not container padding — snap-center measures against
              the scrollport, so padding leaves the first deck off-centre. */}
          <div className="shrink-0" style={{ width: `${((1 - SLOT_RATIO) / 2) * 100}%` }} />
          {MOCK_DECKS.map((d, i) => {
            const active = i === index;
            return (
              <div
                key={d.id}
                className="relative shrink-0 snap-center"
                style={{ width: `${SLOT_RATIO * 100}%` }}
              >
                <motion.div
                  className="relative mx-1.5"
                  animate={{
                    scale: active ? (holding ? 0.965 : 1) : 0.84,
                    opacity: active ? 1 : 0.4,
                  }}
                  transition={{ type: "spring", stiffness: 260, damping: 28 }}
                >
                  {/* The stack itself */}
                  <div
                    onPointerDown={active ? beginHold : undefined}
                    onPointerMove={active ? maybeCancel : undefined}
                    className="relative touch-none select-none"
                    style={{ cursor: active ? "pointer" : "default" }}
                    role={active ? "button" : undefined}
                    aria-label={active ? `Hold to draw from ${d.title}` : undefined}
                  >
                    {[2, 1].map((o) => (
                      <div
                        key={o}
                        className="absolute inset-0"
                        style={{
                          transform: `translate(${o * 4}px, ${o * 4}px) rotate(${o * 1.2}deg)`,
                          opacity: 0.4 - o * 0.12,
                        }}
                      >
                        <DeckCover deck={d} className="aspect-[2/3] w-full" />
                      </div>
                    ))}
                    <motion.div
                      animate={
                        blocked && active && !reduced
                          ? { x: [0, -3, 3, -2, 0] }
                          : { x: 0 }
                      }
                      transition={{ duration: 0.32 }}
                    >
                      <DeckCover deck={d} className="aspect-[2/3] w-full" />
                    </motion.div>

                    {/* Dwell ring — progress toward the next tier */}
                    {active && holding && (
                      <svg
                        className="pointer-events-none absolute inset-0 h-full w-full"
                        viewBox="0 0 100 150"
                        preserveAspectRatio="none"
                      >
                        <rect
                          x="1"
                          y="1"
                          width="98"
                          height="148"
                          rx="6"
                          fill="none"
                          // Refusal reads as the fill running out of energy,
                          // not as an error state.
                          stroke={blocked ? "var(--gold-dim)" : "var(--accent-gold)"}
                          strokeWidth="2"
                          pathLength={1}
                          strokeDasharray={1}
                          strokeDashoffset={1 - ring}
                          vectorEffect="non-scaling-stroke"
                        />
                      </svg>
                    )}
                  </div>
                </motion.div>
              </div>
            );
          })}
          <div className="shrink-0" style={{ width: `${((1 - SLOT_RATIO) / 2) * 100}%` }} />
        </div>

        {/* Cards lifting off the stack — the depth readout.
            Rendered OUTSIDE the scroll container: overflow-x on that
            element clips the y axis too, which ate them. This overlay
            mirrors the card's box exactly so the geometry still lines up. */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="relative aspect-[2/3]" style={{ width: `${SLOT_RATIO * 100}%` }}>
            <AnimatePresence>
              {Array.from({ length: Math.min(step, 5) }).map((_, k) => (
                <motion.div
                  key={k}
                  className="absolute left-1/2 top-0"
                  initial={{ y: 8, opacity: 0, rotate: 0, x: "-50%" }}
                  animate={{
                    y: -26 - k * 17,
                    opacity: 1,
                    rotate: (k - 2) * 5,
                    x: `calc(-50% + ${(k - 2) * 15}px)`,
                  }}
                  exit={{ y: 8, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 220, damping: 20 }}
                >
                  <DeckCover deck={deck} className="h-[72px] w-[48px]" />
                </motion.div>
              ))}
            </AnimatePresence>

            {step === 10 && (
              <p
                className="absolute left-1/2 -top-[128px] -translate-x-1/2 whitespace-nowrap text-[11px]"
                style={{ color: "var(--accent-gold)" }}
              >
                + five more
              </p>
            )}

            {/* First-run teaching pulse, on the object itself */}
            {showHint && !holding && drawn === null && !reduced && (
              <motion.div
                className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{ border: "1px solid var(--accent-gold)" }}
                animate={{ scale: [1, 1.6, 1], opacity: [0.55, 0, 0.55] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
          </div>
        </div>
        </div>

        {/* Deck identity — quiet, below the object */}
        <div className="mt-5 px-6 text-center">
          <p className="display text-[17px] leading-tight" style={{ color: "var(--ink)" }}>
            {deck.title}
          </p>
          <p className="mt-0.5 text-[11px]" style={{ color: "var(--ink-faint)" }}>
            {deck.cardCount} cards · swipe for others
          </p>
        </div>
      </div>

      {/* ── The single line of feedback ─────────────────────────── */}
      <div className="relative z-10 shrink-0 pb-[calc(env(safe-area-inset-bottom)+22px)] pt-4">
        <AnimatePresence mode="wait">
          <motion.p
            key={whisper}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="whisper text-center text-[15px]"
            style={{ color: holding && step > 0 ? "var(--accent-gold)" : "var(--ink-mute)" }}
          >
            {whisper}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* ── The draw — question captured over the dead time ─────── */}
      <AnimatePresence>
        {drawn !== null && (
          <motion.div
            className="absolute inset-0 z-40 flex flex-col"
            style={{ background: "var(--paper)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-4">
              {/* Cards flex to the count — five fixed-width cards did not
                  fit 390px and bled off both edges. */}
              <div className="flex w-full items-end justify-center gap-2">
                {Array.from({ length: Math.min(drawn, 5) }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="min-w-0 flex-1"
                    style={{ maxWidth: 88 }}
                    initial={{ y: -120, opacity: 0, rotate: (i - 2) * 8 }}
                    animate={{ y: 0, opacity: 1, rotate: 0 }}
                    transition={{ delay: i * 0.09, type: "spring", stiffness: 200, damping: 22 }}
                  >
                    <DeckCover deck={deck} className="aspect-[2/3] w-full" />
                  </motion.div>
                ))}
              </div>
              {drawn > 5 && (
                <p className="mt-4 text-[11px]" style={{ color: "var(--ink-faint)" }}>
                  + {drawn - 5} more in the spread
                </p>
              )}
            </div>

            {/* This is the only place a question is ever asked, and the
                cards are already down by the time it appears. */}
            <motion.div
              className="shrink-0 px-5 pb-[calc(env(safe-area-inset-bottom)+20px)]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, type: "spring", stiffness: 200, damping: 26 }}
            >
              <p className="eyebrow mb-2 text-center">While they settle</p>
              <div
                className="flex items-center gap-2 rounded-xl px-3.5"
                style={{ background: "var(--paper-card)", border: "1px solid var(--line)", minHeight: 48 }}
              >
                <input
                  value={question}
                  onChange={(e) => setQuestion(e.target.value.slice(0, 200))}
                  placeholder="What is this about? — optional"
                  className="min-w-0 flex-1 bg-transparent py-3 text-[14px] outline-none"
                  style={{ color: "var(--ink)" }}
                />
                <Mic className="h-4 w-4 shrink-0" style={{ color: "var(--ink-faint)" }} />
              </div>
              <p className="mt-4 text-center text-[11px]" style={{ color: "var(--ink-faint)" }}>
                {drawn} {drawn === 1 ? "card" : "cards"} from {deck.title} · the ceremony takes over here
              </p>
              <button
                type="button"
                onClick={reset}
                className="mx-auto mt-3 block rounded-full px-4 py-2 text-[12px]"
                style={{ border: "1px solid var(--line)", color: "var(--ink-soft)" }}
              >
                Back to the deck
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Buttons, for anyone who can't or won't hold ─────────── */}
      <AnimatePresence>
        {panel && (
          <>
            <motion.div
              className="absolute inset-0 z-40"
              style={{ background: "rgba(0,0,0,0.6)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPanel(false)}
            />
            <motion.div
              className="absolute inset-x-0 bottom-0 z-50 rounded-t-3xl px-5 pb-7 pt-4"
              style={{ background: "var(--paper-warm)", borderTop: "1px solid var(--line)" }}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
            >
              <p className="eyebrow mb-3">Draw with buttons</p>
              <div
                className="mb-4 flex gap-2 overflow-x-auto pb-1"
                style={{ scrollbarWidth: "none" }}
              >
                {MOCK_DECKS.map((d, i) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => {
                      setIndex(i);
                      const el = trackRef.current;
                      if (el) el.scrollTo({ left: i * el.clientWidth * SLOT_RATIO });
                    }}
                    className="shrink-0"
                    style={{ width: 54 }}
                  >
                    <DeckCover
                      deck={d}
                      className="h-[81px] w-[54px]"
                      style={{
                        outline: i === index ? "2px solid var(--accent-gold)" : "1px solid var(--line)",
                        outlineOffset: 2,
                        opacity: i === index ? 1 : 0.6,
                      }}
                    />
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-4 gap-2">
                {TIERS.map((t) => {
                  const locked = !!t.pro && !isPro;
                  return (
                    <button
                      key={t.count}
                      type="button"
                      disabled={locked}
                      onClick={() => {
                        setPanel(false);
                        dismissHint();
                        setDrawn(t.count);
                      }}
                      className="h-12 rounded-lg text-[13px]"
                      style={{
                        border: "1px solid var(--line)",
                        color: locked ? "var(--ink-faint)" : "var(--ink)",
                        opacity: locked ? 0.45 : 1,
                      }}
                    >
                      {t.count}
                    </button>
                  );
                })}
              </div>
              <p className="mt-3 text-center text-[11px]" style={{ color: "var(--ink-faint)" }}>
                Same draw, no holding required.
              </p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}
