"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, Share2, Sparkles } from "lucide-react";
import { SAMPLE } from "../../_shared/sample-data";
import { BottomNav } from "../home/page";

const spring = { type: "spring" as const, stiffness: 140, damping: 24 };

export default function AnalogCardDetail() {
  const card = SAMPLE.cardDetail;

  return (
    <div className="relative min-h-[100dvh] pb-28">
      <header className="flex items-center justify-between px-6 pt-6 sm:px-10">
        <Link href="/mock/overhaul" className="inline-flex items-center gap-2 text-sm" style={{ color: "var(--rust)" }}>
          <ArrowLeft size={16} /> to deck
        </Link>
        <span className="whisper text-xs" style={{ color: "var(--ink-faint)" }}>
          {card.position}
        </span>
      </header>

      <main className="mx-auto max-w-xl px-6 pt-4 sm:px-10">
        {/* Card — slightly rotated */}
        <motion.div
          initial={{ opacity: 0, y: 20, rotate: -3, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, rotate: -1.2, scale: 1 }}
          transition={{ ...spring, stiffness: 110 }}
          className="mx-auto mt-6 w-full max-w-xs"
          style={{ transformOrigin: "center" }}
        >
          <div
            className="relative aspect-[2/3] rounded-sm border-2"
            style={{
              background: "var(--moss-deep)",
              color: "var(--parchment)",
              borderColor: "var(--ink-brown)",
              boxShadow: "6px 6px 0 var(--ink-brown)",
            }}
          >
            <div className="flex h-full flex-col items-center justify-center p-6">
              <span className="display text-9xl">◯</span>
              <p className="whisper mt-4 text-center text-sm" style={{ opacity: 0.85 }}>
                {card.position}
              </p>
            </div>

            {/* Hand-drawn border ornament */}
            <div className="absolute left-3 top-3 opacity-60">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M2 2 L22 2 L22 22" stroke="var(--parchment)" strokeWidth="1" fill="none" />
                <path d="M4 4 L20 4" stroke="var(--parchment)" strokeWidth="0.5" fill="none" />
              </svg>
            </div>
            <div className="absolute bottom-3 right-3 rotate-180 opacity-60">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M2 2 L22 2 L22 22" stroke="var(--parchment)" strokeWidth="1" fill="none" />
                <path d="M4 4 L20 4" stroke="var(--parchment)" strokeWidth="0.5" fill="none" />
              </svg>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.15 }}
          className="mt-10 text-center"
        >
          <p className="eyebrow">{card.deckName}</p>
          <h1 className="display mt-3 text-[clamp(2rem,8vw,3.25rem)]">
            {card.title.split(" ").map((w, i, arr) => (
              <span key={i}>
                {i === arr.length - 1 ? (
                  <span className="display-italic" style={{ color: "var(--rust)" }}>{w}</span>
                ) : (
                  w
                )}
                {i < arr.length - 1 && " "}
              </span>
            ))}
          </h1>
          <p className="whisper mt-3 text-lg" style={{ color: "var(--ink-soft)" }}>
            {card.subtitle}
          </p>
        </motion.div>

        <div className="mt-6 flex justify-center">
          <svg width="50" height="12" viewBox="0 0 50 12" fill="none">
            <path d="M2 6 Q 12 2, 25 6 T 48 6" stroke="var(--rust)" strokeWidth="1" strokeLinecap="round" fill="none" />
          </svg>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.25 }}
          className="mt-8 paper rounded-sm p-6"
          style={{ boxShadow: "0 2px 8px rgba(46,35,24,0.08)" }}
        >
          <p className="eyebrow">The meaning</p>
          <p className="whisper mt-3 text-base leading-relaxed drop-cap" style={{ color: "var(--ink-brown)" }}>
            {card.meaning}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.35 }}
          className="mt-6 flex flex-wrap justify-center gap-3"
        >
          {card.keywords.map((k, i) => (
            <span
              key={k}
              className="display-italic text-sm"
              style={{ color: i % 2 === 0 ? "var(--rust)" : "var(--moss)" }}
            >
              ~ {k} ~
            </span>
          ))}
        </motion.div>

        {/* Details — handwritten label style */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.45 }}
          className="mt-10 rounded-sm border-2 px-5 py-4"
          style={{ borderColor: "var(--line)", background: "rgba(244,235,212,0.5)" }}
        >
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="whisper" style={{ color: "var(--ink-faint)" }}>last drawn</dt>
              <dd>{card.drawnDate}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="whisper" style={{ color: "var(--ink-faint)" }}>deck</dt>
              <dd>{card.deckName}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="whisper" style={{ color: "var(--ink-faint)" }}>position</dt>
              <dd>{card.position}</dd>
            </div>
          </dl>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.55 }}
          className="mt-10 grid grid-cols-3 gap-3"
        >
          {[
            { icon: Sparkles, label: "refine", primary: true },
            { icon: Heart, label: "favorite" },
            { icon: Share2, label: "share" },
          ].map((a) => (
            <button
              key={a.label}
              className="flex flex-col items-center gap-2 rounded-sm border-2 py-4"
              style={{
                borderColor: "var(--ink-brown)",
                background: a.primary ? "var(--rust)" : "var(--parchment-card)",
                color: a.primary ? "var(--parchment)" : "var(--ink-soft)",
                boxShadow: "2px 2px 0 var(--ink-brown)",
              }}
            >
              <a.icon size={18} strokeWidth={1.5} />
              <span className="display-italic text-sm">{a.label}</span>
            </button>
          ))}
        </motion.div>
      </main>

      <BottomNav active="decks" />
    </div>
  );
}
