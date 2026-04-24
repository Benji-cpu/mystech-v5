"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { SAMPLE } from "../../_shared/sample-data";
import { BottomNav } from "../home/page";

const spring = { type: "spring" as const, stiffness: 110, damping: 22 };

const CARD_BG: Record<string, string> = {
  rust: "linear-gradient(160deg, #5A2A1A 0%, #150808 100%)",
  deep: "linear-gradient(160deg, #2A2130 0%, #0A0714 100%)",
  pale: "linear-gradient(160deg, #746A50 0%, #2A2420 100%)",
};

export default function CinematicReading() {
  return (
    <div className="relative min-h-[100dvh] pb-28">
      <header className="sticky top-0 z-10 flex items-center justify-between px-6 pt-6 sm:px-10">
        <Link href="/mock/overhaul" className="inline-flex items-center gap-2 text-sm" style={{ color: "var(--ink-mute)" }}>
          <ArrowLeft size={16} /> Back
        </Link>
        <span className="eyebrow">A reading</span>
        <span className="w-12" />
      </header>

      <main className="relative mx-auto max-w-xl px-6 pt-8 sm:px-10">
        {/* Ambient halo */}
        <div
          className="breathe pointer-events-none absolute left-1/2 top-40 -z-10 h-96 w-96 -translate-x-1/2 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(212,177,88,0.2), transparent 70%)" }}
        />

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={spring}>
          <p className="eyebrow">{SAMPLE.reading.deckName}</p>
          <h1 className="display mt-4 text-[clamp(2rem,7vw,3rem)] leading-[1]">
            {SAMPLE.reading.spread}
          </h1>
        </motion.div>

        {/* Cards */}
        <div className="mt-10 grid grid-cols-3 gap-3">
          {SAMPLE.reading.cards.map((card, i) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 30, rotateY: 180, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, rotateY: 0, scale: 1 }}
              transition={{ ...spring, stiffness: 140, delay: 0.2 + i * 0.28 }}
              className="flex flex-col items-center"
            >
              <div
                className="relative aspect-[2/3] w-full overflow-hidden rounded-lg float"
                style={{
                  background: CARD_BG[card.hue] ?? CARD_BG.deep,
                  border: "1px solid rgba(212,177,88,0.4)",
                  boxShadow: "0 0 30px rgba(212,177,88,0.25), 0 8px 24px rgba(0,0,0,0.5)",
                  animationDelay: `${i * 0.6}s`,
                }}
              >
                <div className="flex h-full flex-col items-center justify-center p-3">
                  <span className="display text-5xl" style={{ color: "var(--gold)" }}>
                    {card.symbol}
                  </span>
                </div>
                {/* Glint */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-30"
                  style={{
                    background: "linear-gradient(135deg, rgba(212,177,88,0.4) 0%, transparent 40%)",
                  }}
                />
              </div>
              <p className="eyebrow mt-3" style={{ fontSize: "9px" }}>{card.position}</p>
              <p className="display mt-1 text-center text-xs leading-tight">{card.title}</p>
            </motion.div>
          ))}
        </div>

        {/* Per-card excerpts */}
        <section className="mt-14 space-y-6">
          {SAMPLE.reading.cards.map((card, i) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: 1.2 + i * 0.2 }}
              className="rounded-xl p-5 surface"
            >
              <div className="flex items-baseline justify-between">
                <p className="eyebrow">{card.position}</p>
                <span className="eyebrow" style={{ color: "var(--ink-mute)" }}>0{i + 1}</span>
              </div>
              <h3 className="display mt-2 text-xl">{card.title}</h3>
              <p className="whisper mt-2 text-base leading-relaxed" style={{ color: "var(--ink-soft)" }}>
                {card.excerpt}
              </p>
            </motion.div>
          ))}
        </section>

        {/* Interpretation — glowing surface */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 1.9 }}
          className="relative mt-14 overflow-hidden rounded-2xl p-7 surface"
          style={{ borderColor: "var(--line-strong)" }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              background: "radial-gradient(ellipse at top left, rgba(212,177,88,0.2), transparent 60%)",
            }}
          />
          <p className="eyebrow relative">The weave</p>
          <p className="whisper relative mt-4 text-lg leading-relaxed" style={{ color: "var(--ink)" }}>
            {SAMPLE.reading.interpretation}
          </p>
        </motion.section>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ ...spring, delay: 2.2 }}
          className="mt-10 flex gap-3"
        >
          <button
            className="flex-1 rounded-full px-5 py-3 text-sm font-medium"
            style={{
              background: "linear-gradient(135deg, #D4B158 0%, #8F7635 100%)",
              color: "#07050E",
              boxShadow: "0 0 20px rgba(212,177,88,0.3)",
            }}
          >
            Save to chronicle
          </button>
          <button
            className="rounded-full border px-5 py-3 text-sm"
            style={{ borderColor: "var(--line-strong)", color: "var(--ink-soft)" }}
          >
            Share
          </button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ ...spring, delay: 2.4 }}
          className="whisper mt-16 text-center text-sm"
          style={{ color: "var(--ink-mute)" }}
        >
          ✦ Let it sit with you ✦
        </motion.p>
      </main>

      <BottomNav active="home" />
    </div>
  );
}
