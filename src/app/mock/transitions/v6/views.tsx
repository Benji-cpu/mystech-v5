"use client";

import { motion } from "framer-motion";
import type { ViewId } from "./types";

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 8, filter: "blur(2px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { type: "spring" as const, stiffness: 300, damping: 30 },
  },
};

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 ${className}`}
    >
      {children}
    </div>
  );
}

function GoldBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
      {children}
    </span>
  );
}

// ─── Dashboard View ──────────────────────────────────────────────

function DashboardView({ animate }: { animate: boolean }) {
  return (
    <motion.div
      className="flex flex-col gap-3 p-4 h-full"
      variants={container}
      initial="hidden"
      animate={animate ? "visible" : "hidden"}
    >
      <motion.h2 variants={item} className="text-lg font-semibold text-white/90">
        Welcome back, Seeker
      </motion.h2>

      <motion.div variants={item} className="grid grid-cols-3 gap-2">
        <Card>
          <div className="text-2xl font-bold text-amber-300">7</div>
          <div className="text-[10px] text-white/50">Decks</div>
        </Card>
        <Card>
          <div className="text-2xl font-bold text-purple-300">23</div>
          <div className="text-[10px] text-white/50">Readings</div>
        </Card>
        <Card>
          <div className="text-2xl font-bold text-blue-300">142</div>
          <div className="text-[10px] text-white/50">Cards</div>
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <Card>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-white/70">Recent Activity</span>
            <GoldBadge>Pro</GoldBadge>
          </div>
          <div className="space-y-2">
            {[
              { action: "Drew 3-card spread", deck: "Shadow Work", time: "2h ago" },
              { action: "Created new deck", deck: "Cosmic Journey", time: "1d ago" },
              { action: "Shared reading", deck: "Inner Light", time: "3d ago" },
            ].map((a) => (
              <div key={a.time} className="flex items-center gap-2 text-xs">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400/60" />
                <span className="text-white/60">{a.action}</span>
                <span className="text-amber-300/60 ml-auto">{a.time}</span>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-2 gap-2">
        <Card className="flex items-center gap-2 cursor-pointer hover:bg-white/10 transition-colors">
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-300">
            +
          </div>
          <span className="text-xs text-white/70">New Deck</span>
        </Card>
        <Card className="flex items-center gap-2 cursor-pointer hover:bg-white/10 transition-colors">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-300">
            *
          </div>
          <span className="text-xs text-white/70">New Reading</span>
        </Card>
      </motion.div>
    </motion.div>
  );
}

// ─── Deck Grid View ──────────────────────────────────────────────

const MOCK_DECKS = [
  { name: "Shadow Work", cards: 22, color: "from-purple-900/40 to-indigo-900/40" },
  { name: "Cosmic Journey", cards: 15, color: "from-blue-900/40 to-cyan-900/40" },
  { name: "Inner Light", cards: 30, color: "from-amber-900/40 to-orange-900/40" },
  { name: "Wild Spirit", cards: 18, color: "from-green-900/40 to-emerald-900/40" },
  { name: "Dream Weaver", cards: 24, color: "from-pink-900/40 to-rose-900/40" },
  { name: "Star Maps", cards: 12, color: "from-violet-900/40 to-purple-900/40" },
];

function DeckGridView({ animate }: { animate: boolean }) {
  return (
    <motion.div
      className="flex flex-col gap-3 p-4 h-full"
      variants={container}
      initial="hidden"
      animate={animate ? "visible" : "hidden"}
    >
      <motion.div variants={item} className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white/90">Your Decks</h2>
        <GoldBadge>7 / unlimited</GoldBadge>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-2 gap-2">
        {MOCK_DECKS.map((deck) => (
          <Card key={deck.name} className="cursor-pointer hover:bg-white/10 transition-colors">
            <div
              className={`w-full aspect-[2/3] rounded-lg bg-gradient-to-br ${deck.color} mb-2 flex items-center justify-center`}
            >
              <span className="text-3xl opacity-30">*</span>
            </div>
            <div className="text-xs font-medium text-white/80 truncate">{deck.name}</div>
            <div className="text-[10px] text-white/40">{deck.cards} cards</div>
          </Card>
        ))}
      </motion.div>
    </motion.div>
  );
}

// ─── Reading Setup View ──────────────────────────────────────────

const SPREADS = [
  { name: "Single Card", count: 1, desc: "Quick insight" },
  { name: "Past-Present-Future", count: 3, desc: "Timeline clarity" },
  { name: "Five Card Cross", count: 5, desc: "Deep exploration" },
  { name: "Celtic Cross", count: 10, desc: "Full reading" },
];

function ReadingSetupView({ animate }: { animate: boolean }) {
  return (
    <motion.div
      className="flex flex-col gap-3 p-4 h-full"
      variants={container}
      initial="hidden"
      animate={animate ? "visible" : "hidden"}
    >
      <motion.h2 variants={item} className="text-lg font-semibold text-white/90">
        Begin a Reading
      </motion.h2>

      <motion.div variants={item}>
        <div className="text-xs text-white/50 mb-2">Choose your spread</div>
        <div className="grid grid-cols-2 gap-2">
          {SPREADS.map((s, i) => (
            <Card
              key={s.name}
              className={`cursor-pointer transition-colors ${i === 1 ? "ring-1 ring-amber-500/50 bg-white/10" : "hover:bg-white/10"}`}
            >
              <div className="text-lg font-bold text-amber-300 mb-0.5">{s.count}</div>
              <div className="text-xs font-medium text-white/80">{s.name}</div>
              <div className="text-[10px] text-white/40">{s.desc}</div>
            </Card>
          ))}
        </div>
      </motion.div>

      <motion.div variants={item}>
        <div className="text-xs text-white/50 mb-2">Select deck</div>
        <Card className="flex items-center gap-3">
          <div className="w-10 h-14 rounded-lg bg-gradient-to-br from-purple-900/40 to-indigo-900/40 flex items-center justify-center shrink-0">
            <span className="text-lg opacity-30">*</span>
          </div>
          <div>
            <div className="text-sm text-white/80">Shadow Work</div>
            <div className="text-[10px] text-white/40">22 cards</div>
          </div>
          <div className="ml-auto text-white/30 text-xs">Change</div>
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <Card className="flex items-center justify-center py-3 cursor-pointer bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 transition-colors">
          <span className="text-sm font-medium text-amber-300">
            Begin Drawing
          </span>
        </Card>
      </motion.div>
    </motion.div>
  );
}

// ─── Card Detail View ────────────────────────────────────────────

function CardDetailView({ animate }: { animate: boolean }) {
  return (
    <motion.div
      className="flex flex-col gap-3 p-4 h-full"
      variants={container}
      initial="hidden"
      animate={animate ? "visible" : "hidden"}
    >
      <motion.div variants={item} className="flex items-center gap-2">
        <span className="text-white/30 text-xs">Position 2 of 3</span>
        <GoldBadge>Present</GoldBadge>
      </motion.div>

      <motion.div variants={item} className="flex justify-center">
        <div className="w-40 aspect-[2/3] rounded-xl bg-gradient-to-br from-purple-800/60 to-indigo-900/60 border border-white/10 shadow-lg shadow-purple-900/30 flex flex-col items-center justify-center gap-2">
          <div className="text-4xl opacity-40">*</div>
          <div className="text-xs text-white/60 font-medium">The Threshold</div>
        </div>
      </motion.div>

      <motion.div variants={item}>
        <Card>
          <h3 className="text-sm font-semibold text-amber-300 mb-1">The Threshold</h3>
          <p className="text-xs text-white/60 leading-relaxed">
            You stand at a doorway between what was and what could be.
            This card speaks to the liminal space you inhabit — not yet arrived, but no
            longer where you began. Trust the uncertainty.
          </p>
        </Card>
      </motion.div>

      <motion.div variants={item} className="flex gap-2">
        <Card className="flex-1 text-center cursor-pointer hover:bg-white/10 transition-colors py-2">
          <span className="text-xs text-white/50">Previous</span>
        </Card>
        <Card className="flex-1 text-center cursor-pointer bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 transition-colors py-2">
          <span className="text-xs text-amber-300">Next Card</span>
        </Card>
      </motion.div>
    </motion.div>
  );
}

// ─── Interpretation View ─────────────────────────────────────────

function InterpretationView({ animate }: { animate: boolean }) {
  return (
    <motion.div
      className="flex flex-col gap-3 p-4 h-full"
      variants={container}
      initial="hidden"
      animate={animate ? "visible" : "hidden"}
    >
      <motion.div variants={item} className="flex items-center gap-2">
        <h2 className="text-lg font-semibold text-white/90">Your Reading</h2>
        <GoldBadge>3-Card Spread</GoldBadge>
      </motion.div>

      <motion.div variants={item} className="flex justify-center gap-2">
        {["The Mirror", "The Threshold", "The Beacon"].map((name, i) => (
          <div
            key={name}
            className="w-14 aspect-[2/3] rounded-lg bg-gradient-to-br from-purple-800/40 to-indigo-900/40 border border-white/10 flex items-center justify-center"
          >
            <span className="text-[10px] text-white/40 text-center leading-tight px-0.5">
              {name}
            </span>
          </div>
        ))}
      </motion.div>

      <motion.div variants={item}>
        <Card>
          <h3 className="text-sm font-semibold text-amber-300 mb-2">
            The Oracle Speaks
          </h3>
          <div className="space-y-2 text-xs text-white/60 leading-relaxed">
            <p>
              Your three cards weave a narrative of profound transformation.
              The Mirror in your past position reveals a period of deep self-reflection
              — you have been learning to see yourself truly.
            </p>
            <p>
              The Threshold in the present confirms you are at a pivotal
              crossing point. The old patterns no longer serve, yet the new path
              has not fully revealed itself. This is exactly where you need to be.
            </p>
            <p>
              The Beacon in your future position is deeply encouraging — it
              speaks of clarity emerging from confusion, a guiding light that
              will become impossible to ignore. Trust the process.
            </p>
          </div>
        </Card>
      </motion.div>

      <motion.div variants={item} className="flex gap-2">
        <Card className="flex-1 text-center cursor-pointer hover:bg-white/10 transition-colors py-2">
          <span className="text-xs text-white/50">Share</span>
        </Card>
        <Card className="flex-1 text-center cursor-pointer hover:bg-white/10 transition-colors py-2">
          <span className="text-xs text-white/50">Save</span>
        </Card>
      </motion.div>
    </motion.div>
  );
}

// ─── View Registry ───────────────────────────────────────────────

const VIEW_COMPONENTS: Record<ViewId, React.ComponentType<{ animate: boolean }>> = {
  dashboard: DashboardView,
  "deck-grid": DeckGridView,
  "reading-setup": ReadingSetupView,
  "card-detail": CardDetailView,
  interpretation: InterpretationView,
};

export function ViewContent({
  viewId,
  animate,
}: {
  viewId: ViewId;
  animate: boolean;
}) {
  const Component = VIEW_COMPONENTS[viewId];
  return <Component animate={animate} />;
}
