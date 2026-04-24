"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { SAMPLE } from "../../_shared/sample-data";
import { BottomNav } from "../home/page";

const spring = { type: "spring" as const, stiffness: 120, damping: 20 };

const CARD_BG: Record<string, string> = {
  rust: "linear-gradient(160deg, #A34B2A 0%, #2E1814 100%)",
  deep: "linear-gradient(160deg, #2A2130 0%, #0D0A10 100%)",
  pale: "linear-gradient(160deg, #EFE7D6 0%, #A8927A 100%)",
};

export default function EditorialReading() {
  return (
    <div className="relative min-h-[100dvh] pb-28">
      <header className="sticky top-0 z-10 flex items-center justify-between px-6 pt-6 sm:px-10">
        <Link href="/mock/overhaul" className="inline-flex items-center gap-2 text-sm" style={{ color: "var(--ink-mute)" }}>
          <ArrowLeft size={16} /> Back
        </Link>
        <Link href="/mock/overhaul" className="display text-base">MysTech</Link>
        <span className="w-12" />
      </header>

      <main className="mx-auto max-w-xl px-6 pt-8 sm:px-10">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={spring}>
          <p className="eyebrow">A reading · {SAMPLE.reading.deckName}</p>
          <h1 className="display mt-4 text-[clamp(2rem,7vw,3rem)] leading-[0.98]">
            {SAMPLE.reading.spread}
          </h1>
        </motion.div>

        {/* Three cards revealed */}
        <div className="mt-10 grid grid-cols-3 gap-3">
          {SAMPLE.reading.cards.map((card, i) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20, rotateY: 180 }}
              animate={{ opacity: 1, y: 0, rotateY: 0 }}
              transition={{ ...spring, delay: 0.15 + i * 0.2, stiffness: 180 }}
              className="flex flex-col items-center"
            >
              <div
                className="aspect-[2/3] w-full overflow-hidden rounded border"
                style={{
                  background: CARD_BG[card.hue] ?? CARD_BG.deep,
                  borderColor: "rgba(168,134,63,0.35)",
                  boxShadow: "0 6px 28px rgba(26,22,20,0.12)",
                }}
              >
                <div className="flex h-full flex-col items-center justify-center p-3">
                  <span className="display text-4xl" style={{ color: "rgba(255,255,255,0.85)" }}>
                    {card.symbol}
                  </span>
                </div>
              </div>
              <p className="eyebrow mt-3" style={{ fontSize: "10px" }}>{card.position}</p>
              <p className="display mt-1 text-center text-xs leading-tight">{card.title}</p>
            </motion.div>
          ))}
        </div>

        {/* Per-card excerpts */}
        <section className="mt-12 space-y-6">
          {SAMPLE.reading.cards.map((card, i) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: 0.7 + i * 0.15 }}
              className="border-t pt-5 hair"
            >
              <div className="flex items-baseline justify-between">
                <p className="eyebrow">{card.position}</p>
                <span className="eyebrow" style={{ color: "var(--ink-faint)" }}>0{i + 1}</span>
              </div>
              <h3 className="display mt-2 text-xl">{card.title}</h3>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
                {card.excerpt}
              </p>
            </motion.div>
          ))}
        </section>

        {/* Interpretation */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 1.3 }}
          className="mt-14"
        >
          <p className="eyebrow">The weave</p>
          <p className="whisper mt-4 text-lg leading-relaxed" style={{ color: "var(--ink)" }}>
            {SAMPLE.reading.interpretation}
          </p>
        </motion.section>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ ...spring, delay: 1.6 }}
          className="mt-10 flex gap-3"
        >
          <button
            className="flex-1 rounded-full px-5 py-3 text-sm font-medium"
            style={{ background: "var(--ink)", color: "var(--paper)" }}
          >
            Save to chronicle
          </button>
          <button
            className="rounded-full border px-5 py-3 text-sm hair"
            style={{ color: "var(--ink)" }}
          >
            Share
          </button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ ...spring, delay: 1.8 }}
          className="whisper mt-16 text-center text-sm"
          style={{ color: "var(--ink-faint)" }}
        >
          Let it sit with you.
        </motion.p>
      </main>

      <BottomNav active="home" />
    </div>
  );
}
