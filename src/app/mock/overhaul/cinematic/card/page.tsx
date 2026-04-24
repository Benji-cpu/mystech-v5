"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, Share2, Sparkles } from "lucide-react";
import { SAMPLE } from "../../_shared/sample-data";
import { BottomNav } from "../home/page";

const spring = { type: "spring" as const, stiffness: 140, damping: 22 };

export default function CinematicCardDetail() {
  const card = SAMPLE.cardDetail;

  return (
    <div className="relative min-h-[100dvh] pb-28">
      <header className="sticky top-0 z-10 flex items-center justify-between px-6 pt-6 sm:px-10">
        <Link href="/mock/overhaul" className="inline-flex items-center gap-2 text-sm" style={{ color: "var(--ink-mute)" }}>
          <ArrowLeft size={16} /> Deck
        </Link>
        <span className="eyebrow">{card.position}</span>
      </header>

      <main className="relative mx-auto max-w-xl px-6 pt-4 sm:px-10">
        {/* Ambient halo */}
        <div
          className="breathe pointer-events-none absolute left-1/2 top-16 -z-10 h-96 w-96 -translate-x-1/2 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(212,177,88,0.25), transparent 65%)" }}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ ...spring, stiffness: 100, delay: 0.1 }}
          className="mx-auto mt-6 w-full max-w-xs float"
        >
          <div
            className="relative aspect-[2/3] overflow-hidden rounded-lg"
            style={{
              background: "linear-gradient(160deg, #2A2130 0%, #0A0714 100%)",
              border: "1px solid rgba(212,177,88,0.5)",
              boxShadow: "0 0 48px rgba(212,177,88,0.3), 0 20px 60px rgba(0,0,0,0.6)",
            }}
          >
            <div className="flex h-full flex-col items-center justify-center p-6">
              <span className="display text-8xl" style={{ color: "var(--gold)" }}>◯</span>
              <p className="mt-4 text-center text-xs uppercase tracking-[0.25em]" style={{ color: "var(--ink-soft)" }}>
                {card.deckName}
              </p>
            </div>
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background: "linear-gradient(135deg, rgba(212,177,88,0.25) 0%, transparent 50%)",
              }}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.3 }}
          className="mt-10 text-center"
        >
          <p className="eyebrow">{card.deckName}</p>
          <h1 className="display mt-3 text-[clamp(2rem,7vw,3rem)] leading-[1]">{card.title}</h1>
          <p className="whisper mt-3 text-lg" style={{ color: "var(--ink-soft)" }}>
            {card.subtitle}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.42 }}
          className="mt-10 rounded-2xl p-6 surface"
        >
          <p className="eyebrow">The meaning</p>
          <p className="whisper mt-3 text-base leading-relaxed" style={{ color: "var(--ink)" }}>
            {card.meaning}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.5 }}
          className="mt-6 flex flex-wrap gap-2"
        >
          {card.keywords.map((k) => (
            <span
              key={k}
              className="rounded-full border px-3 py-1 text-xs"
              style={{
                borderColor: "var(--line-strong)",
                color: "var(--gold)",
                background: "rgba(212,177,88,0.05)",
              }}
            >
              ✦ {k}
            </span>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.58 }}
          className="mt-10 grid grid-cols-3 gap-3"
        >
          {[
            { icon: Sparkles, label: "Refine", gold: true },
            { icon: Heart, label: "Favorite" },
            { icon: Share2, label: "Share" },
          ].map((a) => (
            <button
              key={a.label}
              className="flex flex-col items-center gap-2 rounded-xl border py-4"
              style={{
                background: a.gold ? "rgba(212,177,88,0.08)" : "var(--surface)",
                borderColor: a.gold ? "var(--gold-soft)" : "var(--line-strong)",
                backdropFilter: "blur(12px)",
                color: a.gold ? "var(--gold)" : "var(--ink-soft)",
              }}
            >
              <a.icon size={18} strokeWidth={1.5} />
              <span className="text-xs">{a.label}</span>
            </button>
          ))}
        </motion.div>

        <motion.dl
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ ...spring, delay: 0.66 }}
          className="mt-10 space-y-3 text-sm"
        >
          <div className="flex justify-between border-b pb-2" style={{ borderColor: "var(--line)" }}>
            <dt style={{ color: "var(--ink-mute)" }}>Last drawn</dt>
            <dd>{card.drawnDate}</dd>
          </div>
          <div className="flex justify-between border-b pb-2" style={{ borderColor: "var(--line)" }}>
            <dt style={{ color: "var(--ink-mute)" }}>Position</dt>
            <dd>{card.position}</dd>
          </div>
        </motion.dl>
      </main>

      <BottomNav active="decks" />
    </div>
  );
}
