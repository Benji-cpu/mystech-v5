"use client";

/**
 * The reading surface — one page, no navigation.
 *
 * Everything that used to be a step, a page, or a separate mock variant now
 * lives on this single surface as a fold that opens in place:
 *
 *   first run   the fold fills the screen and asks how you want to read.
 *               This replaces onboarding. It states plainly that it is a
 *               one-time setup and where to find it again.
 *   closed      the fold becomes one quiet line above the draw button.
 *               The surface is clean; nothing else competes.
 *   review      tapping that line (or the deck) unfolds the same panel
 *               over the same surface. Nothing unmounts, nothing navigates.
 *
 * The "what leads" preference re-arranges this surface live rather than
 * routing to a different one — so the setting previews itself as you pick
 * it, and there is only ever one page.
 */

import { useCallback, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

import {
  DeckCover,
  DeckStack,
  DepthStrip,
  DrawButton,
  DrawTransition,
  IntentionLine,
  RitualOverlay,
} from "@/app/mock/_shared/reading/parts";
import {
  AMBIENT_LINE,
  DEPTHS,
  MOCK_DECKS,
  SUGGESTIONS,
  type DepthKey,
} from "@/app/mock/_shared/reading/data";

const SPRING = { type: "spring" as const, stiffness: 260, damping: 30 };
const PREFS_KEY = "mystech_mock_reading_prefs_v3";

type Lead = "deck" | "question";
type Pace = "direct" | "settle";
type FoldMode = "closed" | "review" | "first-run";

interface Prefs {
  lead: Lead;
  deckId: string;
  depth: DepthKey;
  pace: Pace;
}

const DEFAULT_PREFS: Prefs = {
  lead: "deck",
  deckId: MOCK_DECKS[0].id,
  depth: "three_card",
  pace: "direct",
};

/** Runs only on the client — this component is imported with ssr: false. */
function loadPrefs(): Prefs | null {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    return raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : null;
  } catch {
    return null;
  }
}

function savePrefs(p: Prefs) {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(p));
  } catch {
    /* storage unavailable */
  }
}

export default function ReadingSurface() {
  const [prefs, setPrefs] = useState<Prefs>(() => loadPrefs() ?? DEFAULT_PREFS);
  const [fold, setFold] = useState<FoldMode>(() =>
    loadPrefs() ? "closed" : "first-run"
  );
  const [question, setQuestion] = useState("");
  const [ritual, setRitual] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const [isPro, setIsPro] = useState(false);

  const deck = MOCK_DECKS.find((d) => d.id === prefs.deckId) ?? MOCK_DECKS[0];
  const depth = DEPTHS.find((d) => d.key === prefs.depth)!;
  const isOpen = fold !== "closed";
  const isFirstRun = fold === "first-run";
  const deckLeads = prefs.lead === "deck";

  // Every change writes through immediately — no save step, no effect.
  const update = useCallback((patch: Partial<Prefs>) => {
    setPrefs((prev) => {
      const next = { ...prev, ...patch };
      savePrefs(next);
      return next;
    });
  }, []);

  const beginDraw = useCallback(() => {
    setFold("closed"); // drawing from an open fold folds it away first
    if (prefs.pace === "settle") setRitual(true);
    else setDrawing(true);
  }, [prefs.pace]);

  const summary = useMemo(
    () => `${deck.title} · ${depth.count === 1 ? "one card" : `${wordFor(depth.count)} cards`}`,
    [deck.title, depth.count]
  );

  return (
    <div className="daylight fixed inset-0" style={{ background: "var(--paper)" }}>
      {/* Mobile-first, but desktop still has to be deliberate: without a
          column the intention field and draw button stretched the full
          1440px. The fold and every overlay live inside it. */}
      <div className="relative mx-auto flex h-full w-full max-w-[460px] flex-col overflow-hidden">
      {/* ── Ambient header ─────────────────────────────────────── */}
      <motion.header
        layout
        className="relative flex shrink-0 items-center gap-1 overflow-hidden px-4"
        animate={{
          height: isFirstRun ? 0 : 44,
          opacity: isFirstRun ? 0 : 1,
          paddingTop: isFirstRun ? 0 : 10,
        }}
        transition={SPRING}
      >
        <span className="eyebrow mx-auto whitespace-nowrap">{AMBIENT_LINE}</span>
      </motion.header>

      {/* ── Deck zone — shrinks when the question leads, or when the
             fold opens. Never unmounts. ─────────────────────────── */}
      {/* No caption under the stack — the summary line above the draw
          button already names the deck, and saying it twice was the kind
          of duplication that made the old screen feel like a form. */}
      <motion.div
        layout
        className="flex min-h-0 items-center justify-center overflow-hidden"
        animate={{
          // While the fold is open the deck holds a fixed, small berth in
          // both arrangements — it stays visible (nothing navigates away)
          // but yields the rest of the surface to the panel.
          flex: isFirstRun
            ? "0 0 0px"
            : isOpen
              ? "0 0 132px"
              : deckLeads
                ? "1 1 0%"
                : "0 0 116px",
          opacity: isFirstRun ? 0 : 1,
        }}
        transition={SPRING}
      >
        <motion.div layout animate={{ scale: isOpen ? 0.82 : 1 }} transition={SPRING}>
          <DeckStack
            decks={[deck]}
            width={deckLeads ? 148 : 74}
            breathing={!isOpen}
            onTap={() => setFold(isOpen ? "closed" : "review")}
          />
        </motion.div>
      </motion.div>

      {/* ── Question zone — grows into the page when it leads ───── */}
      <motion.div
        layout
        className="flex min-h-0 flex-col justify-center overflow-hidden px-6"
        animate={{
          flex: !isFirstRun && !deckLeads && !isOpen ? "1 1 0%" : "0 0 0px",
          opacity: !isFirstRun && !deckLeads && !isOpen ? 1 : 0,
        }}
        transition={SPRING}
      >
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value.slice(0, 200))}
          rows={2}
          placeholder="What are you sitting with?"
          className="display w-full resize-none bg-transparent text-center text-[26px] leading-[1.25] outline-none placeholder:opacity-40"
          style={{ color: "var(--ink)" }}
        />
        <AnimatePresence initial={false}>
          {!question && !isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-5 flex flex-col items-center gap-2.5 overflow-hidden"
            >
              {SUGGESTIONS.slice(0, 3).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setQuestion(s)}
                  className="whisper text-[15px]"
                  style={{ color: "var(--ink-mute)" }}
                >
                  {s}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── THE FOLD — the meta step. Same panel, three states. ─── */}
      <motion.div
        layout
        className="min-h-0 shrink-0 overflow-hidden"
        animate={{
          flex: isOpen ? "1 1 0%" : "0 0 0px",
          opacity: isOpen ? 1 : 0,
        }}
        transition={SPRING}
      >
        <div
          className="h-full overflow-y-auto px-5 pb-4"
          style={{
            borderTop: isFirstRun ? "none" : "1px solid var(--line)",
            paddingTop: isFirstRun ? 0 : 16,
          }}
        >
          {isFirstRun && (
            <div className="pb-5 pt-[calc(env(safe-area-inset-top)+28px)]">
              <p className="eyebrow">Before your first reading</p>
              <h1
                className="display mt-2 text-[27px] leading-[1.15]"
                style={{ color: "var(--ink)" }}
              >
                How do you want this to feel?
              </h1>
              <p
                className="mt-3 text-[13px] leading-relaxed"
                style={{ color: "var(--ink-soft)" }}
              >
                Four choices, once. After this the cards are one tap away — and
                everything here stays editable from the line above the draw
                button, without leaving the page.
              </p>
            </div>
          )}

          <Group
            label="What leads"
            why={isFirstRun ? "The deck, if you like to sit with the object first. The question, if you tend to arrive with something already on your mind." : undefined}
          >
            <div className="grid grid-cols-2 gap-2.5">
              <LeadTile
                lead="deck"
                active={deckLeads}
                onPick={() => update({ lead: "deck" })}
              />
              <LeadTile
                lead="question"
                active={!deckLeads}
                onPick={() => update({ lead: "question" })}
              />
            </div>
          </Group>

          <Group label="Your deck" why={isFirstRun ? "The one you'll reach for most. Swapping later is a tap." : undefined}>
            <div
              className="flex gap-2.5 overflow-x-auto pb-1"
              style={{ scrollbarWidth: "none", scrollPaddingLeft: 0 }}
            >
              {MOCK_DECKS.map((d) => {
                const active = d.id === prefs.deckId;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => update({ deckId: d.id })}
                    className="relative shrink-0"
                    style={{ width: 62 }}
                  >
                    <DeckCover
                      deck={d}
                      className="h-[93px] w-[62px]"
                      style={{
                        outline: active ? "2px solid var(--accent-gold)" : "1px solid var(--line)",
                        outlineOffset: 2,
                        opacity: active ? 1 : 0.62,
                      }}
                    />
                    {active && (
                      <span
                        className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full"
                        style={{ background: "var(--accent-gold)" }}
                      >
                        <Check className="h-2.5 w-2.5" style={{ color: "var(--paper)" }} strokeWidth={3} />
                      </span>
                    )}
                    <p
                      className="mt-1.5 line-clamp-2 text-[10px] leading-tight"
                      style={{ color: active ? "var(--ink)" : "var(--ink-mute)" }}
                    >
                      {d.title}
                    </p>
                  </button>
                );
              })}
            </div>
          </Group>

          <Group label="How deep" why={isFirstRun ? "Your usual spread. The draw button always shows it." : undefined}>
            <DepthStrip
              value={prefs.depth}
              onChange={(d) => update({ depth: d })}
              isPro={isPro}
              onLocked={() => setIsPro(true)}
            />
            <p className="mt-1.5 text-center text-[11px]" style={{ color: "var(--ink-faint)" }}>
              {depth.blurb}
            </p>
          </Group>

          <Group label="Pace" why={isFirstRun ? "Settling adds three slow breaths before the cards are drawn." : undefined}>
            <div className="grid grid-cols-2 gap-2.5">
              {(
                [
                  { key: "direct", label: "Straight to the cards" },
                  { key: "settle", label: "Settle first" },
                ] as const
              ).map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => update({ pace: p.key })}
                  className="h-11 rounded-lg px-2 text-[12px]"
                  style={{
                    background: prefs.pace === p.key ? "var(--paper-warm)" : "transparent",
                    border: `1px solid ${prefs.pace === p.key ? "var(--accent-gold)" : "var(--line)"}`,
                    color: prefs.pace === p.key ? "var(--ink)" : "var(--ink-mute)",
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </Group>

          {/* Only first run needs its own commit button. In review the
              summary line is the toggle and the draw button is still
              live below — a second "Done" only competed with them. */}
          {isFirstRun && (
            <button
              type="button"
              onClick={() => setFold("closed")}
              className="mt-5 flex h-12 w-full items-center justify-center rounded-full text-[14px] font-medium"
              style={{ background: "var(--ink)", color: "var(--paper)" }}
            >
              Save and read
            </button>
          )}

          {isFirstRun && (
            <p
              className="mt-3 text-center text-[11px] leading-relaxed"
              style={{ color: "var(--ink-faint)" }}
            >
              You&apos;ll only see this once.
            </p>
          )}

          {/* Prototype scaffolding — parked in the fold so the reading
              surface itself stays free of anything that isn't the app. */}
          <div
            className="mt-6 flex items-center justify-center gap-2 border-t pt-3 pb-2"
            style={{ borderColor: "var(--line-soft)" }}
          >
            <span className="text-[10px] uppercase tracking-wider" style={{ color: "var(--ink-faint)" }}>
              prototype
            </span>
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
            <button
              type="button"
              onClick={() => {
                try {
                  localStorage.removeItem(PREFS_KEY);
                } catch {
                  /* storage unavailable */
                }
                setPrefs(DEFAULT_PREFS);
                setQuestion("");
                setFold("first-run");
              }}
              className="rounded-full px-2 py-1 text-[10px] uppercase tracking-wider"
              style={{ color: "var(--ink-faint)", border: "1px solid var(--line)" }}
            >
              replay first run
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── Thumb block — summary line, intention, action ───────── */}
      <motion.div
        layout
        className="shrink-0 overflow-hidden px-4"
        animate={{
          height: isFirstRun ? 0 : "auto",
          opacity: isFirstRun ? 0 : 1,
        }}
        transition={SPRING}
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 14px)" }}
      >
        {/* The collapsed fold: one quiet line that says what's set */}
        <button
          type="button"
          onClick={() => setFold(isOpen ? "closed" : "review")}
          className="flex w-full items-center justify-center gap-1.5 py-2.5 text-[12px]"
          style={{ borderTop: "1px solid var(--line)", color: "var(--ink-mute)" }}
        >
          <span className="truncate">{summary}</span>
          <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={SPRING}>
            <ChevronUp className="h-3.5 w-3.5" />
          </motion.span>
        </button>

        {/* Intention line — only when the deck leads; the question
            zone above owns it otherwise */}
        <motion.div
          layout
          className="overflow-hidden"
          animate={{
            height: deckLeads && !isOpen ? "auto" : 0,
            opacity: deckLeads && !isOpen ? 1 : 0,
          }}
          transition={SPRING}
        >
          <div className="pb-3">
            <IntentionLine value={question} onChange={setQuestion} />
            <AnimatePresence initial={false}>
              {!question && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div
                    className="flex gap-2 overflow-x-auto pt-2.5"
                    style={{ scrollbarWidth: "none" }}
                  >
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setQuestion(s)}
                        className="shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-[12px]"
                        style={{ border: "1px solid var(--line)", color: "var(--ink-mute)" }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <DrawButton
          depth={depth}
          onDraw={beginDraw}
          onHoldComplete={() => setRitual(true)}
          hint={
            isOpen
              ? null
              : prefs.pace === "settle"
                ? "Three breaths, then the cards"
                : "Hold to settle first"
          }
        />
      </motion.div>

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
        deck={deck}
        count={depth.count}
        onReset={() => {
          setDrawing(false);
          setQuestion("");
        }}
      />
      </div>
    </div>
  );
}

/* ── Fold group ────────────────────────────────────────────────── */

function Group({
  label,
  why,
  children,
}: {
  label: string;
  why?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5">
      <p className="eyebrow mb-2">{label}</p>
      {why && (
        <p className="mb-2.5 text-[12px] leading-relaxed" style={{ color: "var(--ink-mute)" }}>
          {why}
        </p>
      )}
      {children}
    </div>
  );
}

/* ── Lead tile — a wireframe of the arrangement it selects ─────── */

function LeadTile({
  lead,
  active,
  onPick,
}: {
  lead: Lead;
  active: boolean;
  onPick: () => void;
}) {
  const deckFirst = lead === "deck";
  const accent = active ? "var(--accent-gold)" : "var(--ink-faint)";
  return (
    <button
      type="button"
      onClick={onPick}
      className={cn("rounded-xl p-3 text-left transition-colors")}
      style={{
        background: active ? "var(--paper-warm)" : "transparent",
        border: `1px solid ${active ? "var(--accent-gold)" : "var(--line)"}`,
      }}
    >
      <div className="mb-2 flex h-[56px] flex-col items-center justify-center gap-1.5">
        {deckFirst ? (
          <>
            <span
              className="block h-[30px] w-[20px] rounded-[3px]"
              style={{ background: accent, opacity: active ? 0.9 : 0.5 }}
            />
            <span className="block h-[3px] w-[42px] rounded-full" style={{ background: "var(--line)" }} />
          </>
        ) : (
          <>
            <span className="block h-[3px] w-[46px] rounded-full" style={{ background: accent, opacity: active ? 0.9 : 0.5 }} />
            <span className="block h-[3px] w-[32px] rounded-full" style={{ background: accent, opacity: active ? 0.7 : 0.4 }} />
            <span
              className="mt-1 block h-[16px] w-[11px] rounded-[2px]"
              style={{ background: "var(--line)" }}
            />
          </>
        )}
      </div>
      <p className="text-[13px] font-medium" style={{ color: active ? "var(--ink)" : "var(--ink-soft)" }}>
        {deckFirst ? "Deck first" : "Question first"}
      </p>
    </button>
  );
}

function wordFor(n: number) {
  return { 1: "one", 3: "three", 5: "five", 10: "ten" }[n] ?? String(n);
}
