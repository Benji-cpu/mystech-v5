"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, Share2, Sparkles } from "lucide-react";
import { SAMPLE } from "../../_shared/sample-data";
import { BottomNav } from "../home/page";

const spring = { type: "spring" as const, stiffness: 160, damping: 22 };

export default function EditorialCardDetail() {
  const card = SAMPLE.cardDetail;

  return (
    <div className="relative min-h-[100dvh] pb-28">
      <header className="sticky top-0 z-10 flex items-center justify-between px-6 pt-6 sm:px-10">
        <Link href="/mock/overhaul" className="inline-flex items-center gap-2 text-sm" style={{ color: "var(--ink-mute)" }}>
          <ArrowLeft size={16} /> Back to deck
        </Link>
        <span className="eyebrow">{card.position}</span>
      </header>

      <main className="mx-auto max-w-xl px-6 pt-6 sm:px-10">
        {/* Card art */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ ...spring, stiffness: 120 }}
          className="mx-auto mt-4 w-full max-w-xs"
        >
          <div
            className="relative aspect-[2/3] overflow-hidden rounded-md border"
            style={{
              background: "linear-gradient(160deg, #2A2130 0%, #0D0A10 100%)",
              borderColor: "rgba(168,134,63,0.3)",
              boxShadow: "0 20px 60px rgba(26,22,20,0.25)",
            }}
          >
            <div className="flex h-full flex-col items-center justify-center p-6">
              <span className="display text-8xl" style={{ color: "rgba(255,255,255,0.85)" }}>◯</span>
              <p className="mt-4 text-center text-xs uppercase tracking-widest" style={{ color: "rgba(232,223,208,0.6)" }}>
                {card.deckName}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.1 }}
          className="mt-8"
        >
          <p className="eyebrow">{card.deckName}</p>
          <h1 className="display mt-3 text-[clamp(2rem,7vw,3rem)] leading-[1]">{card.title}</h1>
          <p className="whisper mt-3 text-lg" style={{ color: "var(--ink-soft)" }}>
            {card.subtitle}
          </p>
        </motion.div>

        {/* Meaning */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.18 }}
          className="mt-10 border-t pt-6 hair"
        >
          <p className="eyebrow">The meaning</p>
          <p className="mt-3 text-base leading-relaxed" style={{ color: "var(--ink-soft)" }}>
            {card.meaning}
          </p>
        </motion.div>

        {/* Keywords */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.26 }}
          className="mt-8 flex flex-wrap gap-2"
        >
          {card.keywords.map((k) => (
            <span
              key={k}
              className="rounded-full border px-3 py-1 text-xs hair"
              style={{ color: "var(--ink-mute)" }}
            >
              {k}
            </span>
          ))}
        </motion.div>

        {/* Metadata */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.34 }}
          className="mt-10 border-t pt-6 hair text-sm"
        >
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt style={{ color: "var(--ink-mute)" }}>Last drawn</dt>
              <dd>{card.drawnDate}</dd>
            </div>
            <div className="flex justify-between">
              <dt style={{ color: "var(--ink-mute)" }}>Deck</dt>
              <dd>{card.deckName}</dd>
            </div>
            <div className="flex justify-between">
              <dt style={{ color: "var(--ink-mute)" }}>Position</dt>
              <dd>{card.position}</dd>
            </div>
          </dl>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.42 }}
          className="mt-12 grid grid-cols-3 gap-3"
        >
          {[
            { icon: Sparkles, label: "Refine art" },
            { icon: Heart, label: "Favorite" },
            { icon: Share2, label: "Share" },
          ].map((a) => (
            <button
              key={a.label}
              className="flex flex-col items-center gap-2 rounded-2xl border py-4 hair hover:border-[var(--ink-soft)]"
              style={{ background: "var(--paper-card)" }}
            >
              <a.icon size={18} strokeWidth={1.5} />
              <span className="text-xs">{a.label}</span>
            </button>
          ))}
        </motion.div>
      </main>

      <BottomNav active="decks" />
    </div>
  );
}
