"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { SAMPLE } from "../../_shared/sample-data";
import { BottomNav } from "../home/page";

const spring = { type: "spring" as const, stiffness: 140, damping: 24 };

const CARD_COLOR: Record<string, { bg: string; fg: string }> = {
  rust: { bg: "var(--rust)", fg: "var(--parchment)" },
  deep: { bg: "var(--moss-deep)", fg: "var(--parchment)" },
  pale: { bg: "var(--parchment-warm)", fg: "var(--ink-brown)" },
};

export default function AnalogReading() {
  return (
    <div className="relative min-h-[100dvh] pb-28">
      <header className="flex items-center justify-between px-6 pt-6 sm:px-10">
        <Link href="/mock/overhaul" className="inline-flex items-center gap-2 text-sm" style={{ color: "var(--rust)" }}>
          <ArrowLeft size={16} /> back
        </Link>
        <Link href="/mock/overhaul" className="display-italic text-base" style={{ color: "var(--rust)" }}>
          MysTech
        </Link>
        <span className="w-12" />
      </header>

      <main className="mx-auto max-w-xl px-6 pt-8 sm:px-10">
        <div className="flex justify-center">
          <svg width="80" height="16" viewBox="0 0 80 16" fill="none">
            <path d="M2 8 Q 20 2, 40 8 T 78 8" stroke="var(--rust)" strokeWidth="1" strokeLinecap="round" fill="none" />
            <circle cx="40" cy="8" r="2" fill="var(--rust)" />
          </svg>
        </div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="mt-6 text-center">
          <p className="eyebrow">A reading</p>
          <h1 className="display mt-3 text-[clamp(2.25rem,8vw,3.25rem)]">
            {SAMPLE.reading.spread.split("·").map((p, i, arr) => (
              <span key={i}>
                <span>{p.trim()}</span>
                {i < arr.length - 1 && <span className="display-italic" style={{ color: "var(--rust)" }}> · </span>}
              </span>
            ))}
          </h1>
          <p className="whisper mt-3 text-sm" style={{ color: "var(--ink-faint)" }}>
            drawn from {SAMPLE.reading.deckName}
          </p>
        </motion.div>

        <div className="mt-10 grid grid-cols-3 gap-3">
          {SAMPLE.reading.cards.map((card, i) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 24, rotate: -8 }}
              animate={{ opacity: 1, y: 0, rotate: [-2, 1, -1][i] ?? 0 }}
              transition={{ ...spring, delay: 0.15 + i * 0.18 }}
              className="flex flex-col items-center"
            >
              <div
                className="aspect-[2/3] w-full rounded-sm border-2"
                style={{
                  background: CARD_COLOR[card.hue]?.bg ?? "var(--ink-brown)",
                  color: CARD_COLOR[card.hue]?.fg ?? "var(--parchment)",
                  borderColor: "var(--ink-brown)",
                  boxShadow: "3px 3px 0 var(--ink-brown)",
                }}
              >
                <div className="flex h-full flex-col items-center justify-center p-2">
                  <span className="display text-5xl">{card.symbol}</span>
                  <p className="whisper mt-2 text-center text-[10px] leading-tight" style={{ opacity: 0.85 }}>
                    {card.title}
                  </p>
                </div>
              </div>
              <p className="display-italic mt-3 text-sm" style={{ color: "var(--rust)" }}>
                {card.position.toLowerCase()}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Per-card journal entries */}
        <section className="mt-14 space-y-10">
          {SAMPLE.reading.cards.map((card, i) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: 0.8 + i * 0.15 }}
              className="relative paper rounded-sm p-6"
              style={{ boxShadow: "0 2px 8px rgba(46,35,24,0.08)" }}
            >
              <div className="absolute -top-2 left-5">
                <span className="stamp">{card.position}</span>
              </div>
              <h3 className="display mt-3 text-2xl">{card.title}</h3>
              <p className="whisper mt-3 text-base leading-relaxed" style={{ color: "var(--ink-soft)" }}>
                {card.excerpt}
              </p>
            </motion.div>
          ))}
        </section>

        {/* Interpretation — letterpress block */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 1.4 }}
          className="mt-14 paper rounded-sm p-7"
          style={{ boxShadow: "0 3px 10px rgba(46,35,24,0.1)" }}
        >
          <div className="flex items-center justify-center">
            <svg width="40" height="10" viewBox="0 0 40 10" fill="none">
              <path d="M2 5 Q 10 1, 20 5 T 38 5" stroke="var(--rust)" strokeWidth="1" strokeLinecap="round" fill="none" />
            </svg>
          </div>
          <p className="eyebrow mt-4 text-center">The weave</p>
          <p className="whisper mt-4 text-base leading-relaxed drop-cap" style={{ color: "var(--ink-brown)" }}>
            {SAMPLE.reading.interpretation}
          </p>
        </motion.section>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ ...spring, delay: 1.7 }}
          className="mt-10 grid grid-cols-2 gap-3"
        >
          <button
            className="rounded-sm border-2 px-5 py-3 text-base font-medium"
            style={{
              borderColor: "var(--ink-brown)",
              background: "var(--rust)",
              color: "var(--parchment)",
              boxShadow: "3px 3px 0 var(--ink-brown)",
            }}
          >
            <span className="display-italic">Save</span>
          </button>
          <button
            className="rounded-sm border-2 px-5 py-3 text-base font-medium"
            style={{ borderColor: "var(--ink-brown)", color: "var(--ink-brown)" }}
          >
            <span className="display-italic">Share</span>
          </button>
        </motion.div>
      </main>

      <BottomNav active="home" />
    </div>
  );
}
