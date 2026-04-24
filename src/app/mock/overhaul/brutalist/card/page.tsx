"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { SAMPLE } from "../../_shared/sample-data";
import { BottomNav } from "../home/page";

const spring = { type: "spring" as const, stiffness: 260, damping: 28 };

export default function BrutalistCardDetail() {
  const card = SAMPLE.cardDetail;

  return (
    <div className="relative min-h-[100dvh] pb-24">
      <header className="flex items-center justify-between px-5 pt-5">
        <Link href="/mock/overhaul" className="mono text-xs font-bold uppercase tracking-widest">← DECK</Link>
        <span className="mono text-[10px] uppercase tracking-widest">{card.position.toUpperCase()}</span>
      </header>
      <div className="divider mx-5 mt-4" />

      <main className="px-5 pt-8">
        {/* Meta row above card */}
        <div className="mono mb-4 flex items-baseline justify-between text-[10px] uppercase tracking-widest">
          <span>{card.deckName.toUpperCase()}</span>
          <span style={{ color: "var(--mid)" }}>{card.drawnDate.toUpperCase()}</span>
        </div>

        {/* Card art — stark black block, yellow symbol */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={spring}
          className="mx-auto aspect-[2/3] w-full max-w-sm border-2"
          style={{ background: "var(--black)", borderColor: "var(--black)" }}
        >
          <div className="flex h-full flex-col items-center justify-center p-6">
            <span className="display text-9xl" style={{ color: "var(--yellow)" }}>◯</span>
            <p className="mono mt-4 text-center text-xs font-bold uppercase tracking-[0.3em]" style={{ color: "var(--bone)" }}>
              {card.position.toUpperCase()}
            </p>
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.08 }}
          className="mt-8"
        >
          <p className="eyebrow">{card.deckName.toUpperCase()}</p>
          <h1 className="display mt-3 text-[clamp(2.5rem,11vw,5rem)]">
            {card.title.toUpperCase()}.
          </h1>
          <p className="mono mt-4 text-sm uppercase tracking-widest" style={{ color: "var(--mid)" }}>
            {card.subtitle.toUpperCase()}
          </p>
        </motion.div>

        {/* Meaning — bordered block */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.14 }}
          className="mt-8 border-t-2 pt-6"
          style={{ borderColor: "var(--black)" }}
        >
          <p className="eyebrow">/ MEANING</p>
          <p className="mt-4 text-base leading-relaxed">
            {card.meaning}
          </p>
        </motion.div>

        {/* Keywords — chunky blocks */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.2 }}
          className="mt-8 flex flex-wrap gap-2"
        >
          {card.keywords.map((k, i) => (
            <span
              key={k}
              className="mono px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest"
              style={{
                background: i === 0 ? "var(--yellow)" : "var(--black)",
                color: i === 0 ? "var(--black)" : "var(--bone)",
              }}
            >
              / {k.toUpperCase()}
            </span>
          ))}
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.26 }}
          className="mt-10 grid grid-cols-3 gap-0"
        >
          {[
            { label: "REFINE", num: "01", filled: true },
            { label: "SAVE", num: "02", filled: false },
            { label: "SHARE", num: "03", filled: false },
          ].map((a, i) => (
            <button
              key={a.label}
              className="border-2 py-5"
              style={{
                borderColor: "var(--black)",
                background: a.filled ? "var(--black)" : "transparent",
                color: a.filled ? "var(--yellow)" : "var(--black)",
                borderRightWidth: i < 2 ? 0 : 2,
              }}
            >
              <p className="mono text-[9px] font-bold uppercase tracking-widest" style={{ color: a.filled ? "var(--bone)" : "var(--mid)" }}>
                / {a.num}
              </p>
              <p className="display-tight mt-1 text-lg">{a.label}</p>
            </button>
          ))}
        </motion.div>
      </main>

      <BottomNav active="decks" />
    </div>
  );
}
