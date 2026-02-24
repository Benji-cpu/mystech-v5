"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MIRROR_STYLES,
  TRANSITIONS,
  CONTENT_TYPES,
} from "./theme";

interface ControlPanelProps {
  selectedMirror: string;
  selectedTransition: string;
  selectedContent: string;
  onMirrorChange: (id: string) => void;
  onTransitionChange: (id: string) => void;
  onContentChange: (id: string) => void;
  onTrigger: () => void;
  onRandomize: () => void;
  isTransitioning: boolean;
  isMobile: boolean;
  onDesktopPanelToggle?: (open: boolean) => void;
}

type SelectorTab = "mirror" | "transition" | "content";

export function ControlPanel({
  selectedMirror,
  selectedTransition,
  selectedContent,
  onMirrorChange,
  onTransitionChange,
  onContentChange,
  onTrigger,
  onRandomize,
  isTransitioning,
  isMobile,
  onDesktopPanelToggle,
}: ControlPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<SelectorTab>("mirror");

  const getMirrorName = () => MIRROR_STYLES.find(s => s.id === selectedMirror)?.name || "Mirror";
  const getTransitionName = () => TRANSITIONS.find(t => t.id === selectedTransition)?.name || "Transition";
  const getContentName = () => CONTENT_TYPES.find(c => c.id === selectedContent)?.name || "Content";

  if (isMobile) {
    return (
      <MobilePanel
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedMirror={selectedMirror}
        selectedTransition={selectedTransition}
        selectedContent={selectedContent}
        onMirrorChange={onMirrorChange}
        onTransitionChange={onTransitionChange}
        onContentChange={onContentChange}
        onTrigger={onTrigger}
        onRandomize={onRandomize}
        isTransitioning={isTransitioning}
        getMirrorName={getMirrorName}
        getTransitionName={getTransitionName}
        getContentName={getContentName}
      />
    );
  }

  return (
    <DesktopPanel
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      selectedMirror={selectedMirror}
      selectedTransition={selectedTransition}
      selectedContent={selectedContent}
      onMirrorChange={onMirrorChange}
      onTransitionChange={onTransitionChange}
      onContentChange={onContentChange}
      onTrigger={onTrigger}
      onRandomize={onRandomize}
      isTransitioning={isTransitioning}
      getMirrorName={getMirrorName}
      getTransitionName={getTransitionName}
      getContentName={getContentName}
      onPanelToggle={onDesktopPanelToggle}
    />
  );
}

// ─── Mobile: In-flow bottom panel (NOT fixed overlay) ─────────────────────────

interface MobilePanelProps {
  isExpanded: boolean;
  setIsExpanded: (v: boolean) => void;
  activeTab: SelectorTab;
  setActiveTab: (t: SelectorTab) => void;
  selectedMirror: string;
  selectedTransition: string;
  selectedContent: string;
  onMirrorChange: (id: string) => void;
  onTransitionChange: (id: string) => void;
  onContentChange: (id: string) => void;
  onTrigger: () => void;
  onRandomize: () => void;
  isTransitioning: boolean;
  getMirrorName: () => string;
  getTransitionName: () => string;
  getContentName: () => string;
}

function MobilePanel({
  isExpanded,
  setIsExpanded,
  activeTab,
  setActiveTab,
  selectedMirror,
  selectedTransition,
  selectedContent,
  onMirrorChange,
  onTransitionChange,
  onContentChange,
  onTrigger,
  onRandomize,
  isTransitioning,
  getMirrorName,
  getTransitionName,
  getContentName,
}: MobilePanelProps) {
  const startYRef = useRef(0);

  const handleDragStart = useCallback((e: React.TouchEvent) => {
    startYRef.current = e.touches[0].clientY;
  }, []);

  const handleDragEnd = useCallback((e: React.TouchEvent) => {
    const dy = e.changedTouches[0].clientY - startYRef.current;
    if (dy > 50) setIsExpanded(false);
    else if (dy < -50) setIsExpanded(true);
  }, [setIsExpanded]);

  return (
    <motion.div
      className="bg-white/[0.03] backdrop-blur-xl border-t border-white/10"
      animate={{ height: isExpanded ? "50dvh" : "auto" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      onTouchStart={handleDragStart}
      onTouchEnd={handleDragEnd}
    >
      {/* Handle bar */}
      <div
        className="flex justify-center pt-2 pb-1 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="w-10 h-1 rounded-full bg-white/20" />
      </div>

      {/* Summary chips + trigger */}
      <div className="px-3 pb-2 flex items-center gap-2">
        <div className="flex-1 flex gap-1.5 overflow-x-auto no-scrollbar">
          <SummaryChip label={getMirrorName()} active={activeTab === "mirror"} onClick={() => { setIsExpanded(true); setActiveTab("mirror"); }} />
          <SummaryChip label={getTransitionName()} active={activeTab === "transition"} onClick={() => { setIsExpanded(true); setActiveTab("transition"); }} />
          <SummaryChip label={getContentName()} active={activeTab === "content"} onClick={() => { setIsExpanded(true); setActiveTab("content"); }} />
        </div>
        <RandomizeButton onClick={onRandomize} disabled={isTransitioning} small />
        <TriggerButton onClick={onTrigger} disabled={isTransitioning} small />
      </div>

      {/* Expanded: tab content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-3 pb-3 overflow-hidden"
          >
            {/* Tab bar */}
            <div className="flex gap-1.5 mb-2">
              {(["mirror", "transition", "content"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-colors ${
                    activeTab === tab
                      ? "bg-[#c9a94e]/20 text-[#c9a94e] border border-[#c9a94e]/40"
                      : "bg-white/5 text-white/40 border border-white/[0.06]"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Chip grid */}
            <div className="max-h-[28dvh] overflow-y-auto no-scrollbar">
              {activeTab === "mirror" && (
                <ChipGrid items={MIRROR_STYLES} selected={selectedMirror} onChange={onMirrorChange} />
              )}
              {activeTab === "transition" && (
                <ChipGrid items={TRANSITIONS} selected={selectedTransition} onChange={onTransitionChange} />
              )}
              {activeTab === "content" && (
                <ChipGrid items={CONTENT_TYPES} selected={selectedContent} onChange={onContentChange} />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Desktop Side Panel ───────────────────────────────────────────────────────

interface DesktopPanelProps {
  activeTab: SelectorTab;
  setActiveTab: (t: SelectorTab) => void;
  selectedMirror: string;
  selectedTransition: string;
  selectedContent: string;
  onMirrorChange: (id: string) => void;
  onTransitionChange: (id: string) => void;
  onContentChange: (id: string) => void;
  onTrigger: () => void;
  onRandomize: () => void;
  isTransitioning: boolean;
  getMirrorName: () => string;
  getTransitionName: () => string;
  getContentName: () => string;
  onPanelToggle?: (open: boolean) => void;
}

function DesktopPanel({
  activeTab,
  setActiveTab,
  selectedMirror,
  selectedTransition,
  selectedContent,
  onMirrorChange,
  onTransitionChange,
  onContentChange,
  onTrigger,
  onRandomize,
  isTransitioning,
  getMirrorName,
  getTransitionName,
  getContentName,
  onPanelToggle,
}: DesktopPanelProps) {
  const [collapsed, setCollapsed] = useState(false);

  const handleToggle = useCallback(() => {
    const next = !collapsed;
    setCollapsed(next);
    onPanelToggle?.(!next); // open = !collapsed
  }, [collapsed, onPanelToggle]);

  // Report initial state
  useEffect(() => {
    onPanelToggle?.(true);
  }, [onPanelToggle]);

  return (
    <motion.div
      className="fixed right-0 top-0 bottom-0 z-50 flex items-stretch"
      animate={{ x: collapsed ? 280 : 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Toggle button */}
      <button
        className="self-center -ml-8 w-8 h-16 bg-white/[0.06] backdrop-blur-xl border border-white/10 border-r-0 rounded-l-lg flex items-center justify-center text-white/40 hover:text-white/70 transition-colors"
        onClick={handleToggle}
        title={collapsed ? "Show panel" : "Hide panel"}
      >
        {collapsed ? "\u25C0" : "\u25B6"}
      </button>

      {/* Panel */}
      <div className="w-[280px] bg-black/40 backdrop-blur-2xl border-l border-white/10 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-4 pt-4 pb-3">
          <h2 className="text-white/70 text-sm font-semibold">Scrying Mirror</h2>
          <p className="text-white/25 text-[11px] mt-0.5">Mirror Transition Explorer</p>
        </div>

        {/* Tabs */}
        <div className="px-4 flex gap-1.5 mb-3">
          {(["mirror", "transition", "content"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-2 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                activeTab === tab
                  ? "bg-[#c9a94e]/20 text-[#c9a94e] border border-[#c9a94e]/40"
                  : "bg-white/[0.04] text-white/35 border border-white/[0.06] hover:border-white/10"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Current selection */}
        <div className="px-4 mb-3 flex gap-3 flex-wrap">
          <SelectionBadge label="Mirror" value={getMirrorName()} />
          <SelectionBadge label="Effect" value={getTransitionName()} />
          <SelectionBadge label="Content" value={getContentName()} />
        </div>

        {/* Scrollable chip area */}
        <div className="flex-1 overflow-y-auto px-4 pb-3 no-scrollbar">
          {activeTab === "mirror" && (
            <ChipGrid items={MIRROR_STYLES} selected={selectedMirror} onChange={onMirrorChange} />
          )}
          {activeTab === "transition" && (
            <ChipGrid items={TRANSITIONS} selected={selectedTransition} onChange={onTransitionChange} />
          )}
          {activeTab === "content" && (
            <ChipGrid items={CONTENT_TYPES} selected={selectedContent} onChange={onContentChange} />
          )}
        </div>

        {/* Trigger + Randomize buttons */}
        <div className="px-4 pb-4 pt-2 border-t border-white/[0.06] flex flex-col gap-2">
          <TriggerButton onClick={onTrigger} disabled={isTransitioning} />
          <RandomizeButton onClick={onRandomize} disabled={isTransitioning} />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Shared Components ────────────────────────────────────────────────────────

function ChipGrid<T extends { id: string; name: string }>({
  items,
  selected,
  onChange,
}: {
  items: T[];
  selected: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map(item => (
        <button
          key={item.id}
          onClick={() => onChange(item.id)}
          className={`min-h-[44px] px-3 py-2 rounded-xl text-[11px] font-medium transition-all ${
            selected === item.id
              ? "bg-[#c9a94e]/15 text-[#c9a94e] border border-[#c9a94e]/40 shadow-[0_0_12px_rgba(201,169,78,0.15)]"
              : "bg-white/[0.04] text-white/40 border border-white/[0.06] hover:border-white/15 hover:text-white/60"
          }`}
        >
          {item.name}
        </button>
      ))}
    </div>
  );
}

function SummaryChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-medium border transition-colors ${
        active
          ? "bg-[#c9a94e]/15 text-[#c9a94e]/80 border-[#c9a94e]/30"
          : "bg-white/[0.04] text-white/50 border-white/[0.06] hover:border-white/15"
      }`}
    >
      {label}
    </button>
  );
}

function SelectionBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-[11px]">
      <span className="text-white/25">{label}: </span>
      <span className="text-[#c9a94e]/70">{value}</span>
    </div>
  );
}

function RandomizeButton({ onClick, disabled, small }: { onClick: () => void; disabled: boolean; small?: boolean }) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.03 }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      className={`${
        small ? "px-3 py-2" : "w-full py-2.5"
      } rounded-xl font-medium text-sm transition-all ${
        disabled
          ? "bg-white/[0.03] text-white/10 cursor-not-allowed"
          : "bg-white/[0.06] text-white/60 border border-white/10 hover:border-[#c9a94e]/30 hover:text-[#c9a94e]/80"
      }`}
      title="Randomize All"
    >
      {small ? "\u{1F3B2}" : "\u{1F3B2}  Randomize All"}
    </motion.button>
  );
}

function TriggerButton({ onClick, disabled, small }: { onClick: () => void; disabled: boolean; small?: boolean }) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.03 }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      className={`${
        small ? "px-4 py-2" : "w-full py-3"
      } rounded-xl font-semibold text-sm transition-all ${
        disabled
          ? "bg-white/[0.04] text-white/15 cursor-not-allowed"
          : "bg-gradient-to-r from-[#c9a94e] to-[#b8942d] text-black hover:shadow-[0_0_24px_rgba(201,169,78,0.3)]"
      }`}
    >
      {disabled ? (
        <span className="flex items-center justify-center gap-2">
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="inline-block"
          >
            \u25E0
          </motion.span>
          {small ? "" : "Transitioning..."}
        </span>
      ) : (
        <span>{small ? "\u25B6" : "\u25B6  Play Transition"}</span>
      )}
    </motion.button>
  );
}
