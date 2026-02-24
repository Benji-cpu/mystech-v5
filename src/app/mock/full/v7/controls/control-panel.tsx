"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  type ExplorerState,
  type MirrorId,
  type TransitionId,
  type ContentId,
  type ControlTab,
  MIRRORS,
  TRANSITIONS,
  CONTENTS,
} from "../mirror-types";
import { MT } from "../mirror-theme";
import { MirrorSelector } from "./mirror-selector";
import { TransitionSelector } from "./transition-selector";
import { ContentSelector } from "./content-selector";

// ─── Tab Config ──────────────────────────────────────────────────────────────

const TABS: { id: ControlTab; label: string; count: number }[] = [
  { id: "mirror", label: "Mirror", count: MIRRORS.length },
  { id: "transition", label: "Effect", count: TRANSITIONS.length },
  { id: "content", label: "Content", count: CONTENTS.length },
];

// ─── Tab Bar ─────────────────────────────────────────────────────────────────

function TabBar({
  activeTab,
  onSetTab,
}: {
  activeTab: ControlTab;
  onSetTab: (tab: ControlTab) => void;
}) {
  return (
    <div
      className="flex items-stretch border-b shrink-0"
      style={{ borderColor: MT.border }}
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSetTab(tab.id)}
            className="relative flex-1 py-3 flex flex-col items-center gap-0.5 transition-colors"
            style={{ color: isActive ? MT.gold : MT.textMuted }}
          >
            <span className="text-[11px] font-semibold leading-none">
              {tab.label}
            </span>
            <span
              className="text-[9px] font-medium tabular-nums leading-none"
              style={{ color: isActive ? MT.goldDim : MT.textDim }}
            >
              {tab.count}
            </span>

            {/* Active underline */}
            {isActive && (
              <motion.div
                layoutId="tab-underline"
                className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full"
                style={{ background: MT.gold }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── Action Row ───────────────────────────────────────────────────────────────

function ActionRow({
  isTransitioning,
  onTrigger,
  onRandomAll,
}: {
  isTransitioning: boolean;
  onTrigger: () => void;
  onRandomAll: () => void;
}) {
  return (
    <div
      className="px-3 py-3 flex items-center gap-2 border-b shrink-0"
      style={{ borderColor: MT.border, background: MT.surface }}
    >
      {/* Trigger button */}
      <motion.button
        onClick={onTrigger}
        disabled={isTransitioning}
        whileTap={{ scale: 0.96 }}
        className="flex-1 py-2 rounded-lg text-xs font-semibold transition-colors"
        style={{
          background: isTransitioning
            ? "rgba(201,169,78,0.05)"
            : "rgba(201,169,78,0.12)",
          border: `1px solid ${
            isTransitioning ? "rgba(201,169,78,0.15)" : "rgba(201,169,78,0.35)"
          }`,
          color: isTransitioning ? "rgba(201,169,78,0.4)" : MT.gold,
          cursor: isTransitioning ? "default" : "pointer",
        }}
      >
        {isTransitioning ? "Transitioning..." : "Trigger"}
      </motion.button>

      {/* Random all */}
      <motion.button
        onClick={onRandomAll}
        whileTap={{ scale: 0.9 }}
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{
          background: "rgba(255,255,255,0.05)",
          border: `1px solid ${MT.border}`,
        }}
        title="Randomize all"
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke={MT.textMuted}
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
        </svg>
      </motion.button>
    </div>
  );
}

// ─── Active Selection Summary ─────────────────────────────────────────────────

function SelectionSummary({ state }: { state: ExplorerState }) {
  const mirrorMeta = MIRRORS.find((m) => m.id === state.activeMirror);
  const transitionMeta = TRANSITIONS.find(
    (t) => t.id === state.activeTransition
  );
  const contentMeta = CONTENTS.find((c) => c.id === state.activeContent);

  return (
    <div
      className="px-3 py-2.5 border-b shrink-0"
      style={{ borderColor: MT.border, background: MT.surface }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={`${state.activeMirror}-${state.activeTransition}-${state.activeContent}`}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="flex items-center gap-1.5 flex-wrap"
        >
          <SummaryChip label={mirrorMeta?.name ?? "—"} />
          <span style={{ color: MT.textDim, fontSize: 10 }}>+</span>
          <SummaryChip label={transitionMeta?.name ?? "—"} />
          <span style={{ color: MT.textDim, fontSize: 10 }}>+</span>
          <SummaryChip label={contentMeta?.name ?? "—"} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function SummaryChip({ label }: { label: string }) {
  return (
    <span
      className="text-[10px] px-1.5 py-0.5 rounded font-medium"
      style={{
        background: "rgba(201,169,78,0.08)",
        color: MT.gold,
        border: `1px solid rgba(201,169,78,0.2)`,
      }}
    >
      {label}
    </span>
  );
}

// ─── Control Panel ────────────────────────────────────────────────────────────

export interface ControlPanelProps {
  state: ExplorerState;
  onSelectMirror: (id: MirrorId) => void;
  onSelectTransition: (id: TransitionId) => void;
  onSelectContent: (id: ContentId) => void;
  onSetTab: (tab: ControlTab) => void;
  onTrigger: () => void;
  onRandomAll: () => void;
  className?: string;
}

export function ControlPanel({
  state,
  onSelectMirror,
  onSelectTransition,
  onSelectContent,
  onSetTab,
  onTrigger,
  onRandomAll,
  className,
}: ControlPanelProps) {
  return (
    <div
      className={cn("flex flex-col h-full", className)}
      style={{ background: MT.surface }}
    >
      {/* Sticky header: action row + tabs */}
      <div className="sticky top-0 z-10" style={{ background: MT.surface }}>
        <ActionRow
          isTransitioning={state.isTransitioning}
          onTrigger={onTrigger}
          onRandomAll={onRandomAll}
        />
        <SelectionSummary state={state} />
        <TabBar activeTab={state.activeControlTab} onSetTab={onSetTab} />
      </div>

      {/* Scrollable selector area */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <AnimatePresence mode="wait">
          {state.activeControlTab === "mirror" && (
            <motion.div
              key="mirror"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="p-3"
            >
              <MirrorSelector
                activeMirror={state.activeMirror}
                onSelect={onSelectMirror}
              />
            </motion.div>
          )}

          {state.activeControlTab === "transition" && (
            <motion.div
              key="transition"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="py-2"
            >
              <TransitionSelector
                activeTransition={state.activeTransition}
                onSelect={onSelectTransition}
              />
            </motion.div>
          )}

          {state.activeControlTab === "content" && (
            <motion.div
              key="content"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="py-2"
            >
              <ContentSelector
                activeContent={state.activeContent}
                onSelect={onSelectContent}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer attribution */}
      <div
        className="shrink-0 px-3 py-2.5 border-t text-center"
        style={{ borderColor: MT.border }}
      >
        <p className="text-[9px] uppercase tracking-widest font-medium" style={{ color: MT.textDim }}>
          Mirror Transition Explorer
        </p>
      </div>
    </div>
  );
}
