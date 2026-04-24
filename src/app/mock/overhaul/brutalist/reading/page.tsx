"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { SAMPLE } from "../../_shared/sample-data";
import { BottomNav } from "../home/page";

const spring = { type: "spring" as const, stiffness: 260, damping: 28 };

const CARD_BG: Record<string, string> = {
  rust: "#8A3A20",
  deep: "#0A0A0A",
  pale: "#D4CBB5",
};

export default function BrutalistReading() {
  return (
    <div className="relative min-h-[100dvh] pb-24">
      <header className="flex items-center justify-between px-5 pt-5">
        <Link href="/mock/overhaul" className="mono text-xs font-bold uppercase tracking-widest">← BACK</Link>
        <span className="mono text-[10px] uppercase tracking-widest">A READING / 03</span>
      </header>
      <div className="divider mx-5 mt-4" />

      <main className="px-5 pt-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={spring}>
          <p className="eyebrow">{SAMPLE.reading.deckName.toUpperCase()}</p>
          <h1 className="display mt-6 text-[clamp(3rem,12vw,6rem)]">
            {SAMPLE.reading.spread.split("·").map((s, i) => (
              <div key={i}>
                {s.trim().toUpperCase()}
                {i < 2 && <span style={{ color: "var(--yellow)" }}> ·</span>}
              </div>
            ))}
          </h1>
        </motion.div>

        {/* Cards — stark rectangles */}
        <div className="mt-10 grid grid-cols-3 gap-2">
          {SAMPLE.reading.cards.map((card, i) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: 0.1 + i * 0.1 }}
              className="flex flex-col"
            >
              <div
                className="aspect-[2/3] border-2"
                style={{
                  background: CARD_BG[card.hue] ?? "var(--black)",
                  borderColor: "var(--black)",
                  color: card.hue === "pale" ? "var(--black)" : "var(--bone)",
                }}
              >
                <div className="flex h-full flex-col items-center justify-center p-3">
                  <span className="display text-6xl">{card.symbol}</span>
                </div>
              </div>
              <div
                className="px-2 py-2 text-center"
                style={{ background: "var(--black)", color: "var(--yellow)" }}
              >
                <p className="mono text-[9px] font-bold uppercase tracking-widest">0{i + 1}</p>
                <p className="mono mt-1 text-[9px] uppercase tracking-widest" style={{ color: "var(--bone)" }}>
                  {card.position.toUpperCase()}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Per-card sections */}
        <section className="mt-14 space-y-0">
          {SAMPLE.reading.cards.map((card, i) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: 0.5 + i * 0.1 }}
              className="border-b-2 py-6"
              style={{ borderColor: "var(--black)", borderTopWidth: i === 0 ? 2 : 0 }}
            >
              <div className="flex items-baseline gap-3">
                <span className="display text-2xl" style={{ color: "var(--yellow)" }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="mono text-[10px] font-bold uppercase tracking-widest">
                  / {card.position.toUpperCase()}
                </p>
              </div>
              <h3 className="display-tight mt-3 text-3xl">{card.title.toUpperCase()}</h3>
              <p className="mt-3 text-base leading-relaxed" style={{ color: "var(--mid)" }}>
                {card.excerpt}
              </p>
            </motion.div>
          ))}
        </section>

        {/* Interpretation — black block */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.9 }}
          className="mt-10 p-6"
          style={{ background: "var(--black)", color: "var(--bone)" }}
        >
          <p className="eyebrow" style={{ color: "var(--yellow)" }}>THE WEAVE</p>
          <p className="mt-4 text-base leading-relaxed">
            {SAMPLE.reading.interpretation}
          </p>
        </motion.section>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ ...spring, delay: 1.1 }}
          className="mt-8 grid grid-cols-2 gap-0"
        >
          <button
            className="p-4 text-left"
            style={{ background: "var(--yellow)", color: "var(--black)" }}
          >
            <p className="mono text-[10px] font-bold uppercase tracking-widest">01 / SAVE</p>
            <p className="display-tight mt-1 text-xl">TO CHRONICLE →</p>
          </button>
          <button
            className="border-2 p-4 text-left"
            style={{ borderColor: "var(--black)" }}
          >
            <p className="mono text-[10px] font-bold uppercase tracking-widest">02 / SHARE</p>
            <p className="display-tight mt-1 text-xl">A LINK →</p>
          </button>
        </motion.div>
      </main>

      <BottomNav active="home" />
    </div>
  );
}
