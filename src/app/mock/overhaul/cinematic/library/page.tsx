"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { SAMPLE } from "../../_shared/sample-data";
import { BottomNav } from "../home/page";

const tabs = ["My decks", "Living", "Adopted"];

const DECK_BG: Record<string, string> = {
  indigo: "linear-gradient(160deg, #2A2130 0%, #0A0714 100%)",
  rose: "linear-gradient(160deg, #6B2A3A 0%, #2A0A14 100%)",
  moss: "linear-gradient(160deg, #2A3A28 0%, #0A1408 100%)",
  rust: "linear-gradient(160deg, #5A2A1A 0%, #150808 100%)",
  pale: "linear-gradient(160deg, #8A7558 0%, #2A2420 100%)",
  deep: "linear-gradient(160deg, #1C2230 0%, #040614 100%)",
};

export default function CinematicLibrary() {
  const [tab, setTab] = useState(0);

  return (
    <div className="relative min-h-[100dvh] pb-28">
      <header className="flex items-center justify-between px-6 pt-6 sm:px-10">
        <Link href="/mock/overhaul" className="display text-base" style={{ letterSpacing: "0.04em" }}>MysTech</Link>
        <button className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-[rgba(237,228,208,0.08)]">
          <Search size={18} strokeWidth={1.5} style={{ color: "var(--ink-soft)" }} />
        </button>
      </header>

      <main className="relative mx-auto max-w-xl px-6 pt-8 sm:px-10">
        <div
          className="breathe pointer-events-none absolute left-1/2 top-8 -z-10 h-64 w-64 -translate-x-1/2 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(78,47,122,0.3), transparent 70%)" }}
        />

        <div>
          <p className="eyebrow">Library</p>
          <h1 className="display mt-3 text-[clamp(2.25rem,8vw,3.5rem)] leading-[1]">
            Your decks
          </h1>
          <p className="whisper mt-3 text-base" style={{ color: "var(--ink-soft)" }}>
            Six decks. Each one a small argument with yourself.
          </p>
        </div>

        {/* Tabs */}
        <div className="mt-8 flex gap-1 rounded-full p-1 surface" style={{ width: "fit-content" }}>
          {tabs.map((t, i) => (
            <button
              key={t}
              onClick={() => setTab(i)}
              className="relative rounded-full px-4 py-2 text-xs transition-colors"
              style={{
                color: tab === i ? "#07050E" : "var(--ink-soft)",
                background: tab === i
                  ? "linear-gradient(135deg, #D4B158 0%, #8F7635 100%)"
                  : "transparent",
                fontWeight: tab === i ? 600 : 400,
              }}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8">
          {SAMPLE.decks.map((d, i) => (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 180, damping: 22, delay: i * 0.05 }}
            >
              <Link href="#" className="group block">
                <div
                  className="relative aspect-[2/3] overflow-hidden rounded-lg float"
                  style={{
                    background: DECK_BG[d.hue] ?? DECK_BG.indigo,
                    border: "1px solid rgba(212,177,88,0.2)",
                    boxShadow: "0 0 24px rgba(212,177,88,0.1), 0 12px 32px rgba(0,0,0,0.5)",
                    animationDelay: `${i * 0.3}s`,
                  }}
                >
                  {d.tag && (
                    <span
                      className="absolute left-3 top-3 rounded-full border px-2 py-0.5 text-[9px]"
                      style={{
                        borderColor: d.tag === "Draft" ? "var(--line-strong)" : "var(--gold-soft)",
                        color: d.tag === "Draft" ? "var(--ink-soft)" : "var(--gold)",
                        background: "rgba(7,5,14,0.6)",
                      }}
                    >
                      {d.tag === "Chronicle" ? "✦ Chronicle" : d.tag}
                    </span>
                  )}
                  <div
                    className="pointer-events-none absolute inset-0 opacity-30"
                    style={{
                      background: "linear-gradient(135deg, rgba(212,177,88,0.2) 0%, transparent 50%)",
                    }}
                  />
                  <div className="absolute bottom-0 flex h-full w-full items-center justify-center">
                    <span className="display text-4xl opacity-20" style={{ color: "var(--gold)" }}>
                      ✦
                    </span>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="display text-base leading-tight">{d.title}</p>
                  <p className="mt-0.5 text-xs" style={{ color: "var(--ink-mute)" }}>
                    {d.subtitle} · {d.cardCount} cards
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 180, damping: 22, delay: SAMPLE.decks.length * 0.05 }}
          >
            <Link href="#" className="group block">
              <div
                className="flex aspect-[2/3] items-center justify-center rounded-lg border-2 border-dashed"
                style={{
                  borderColor: "var(--line-strong)",
                  background: "rgba(26,20,40,0.3)",
                }}
              >
                <Plus size={28} strokeWidth={1.5} style={{ color: "var(--gold)" }} />
              </div>
              <div className="mt-3">
                <p className="display text-base leading-tight">Create a deck</p>
                <p className="mt-0.5 text-xs" style={{ color: "var(--ink-mute)" }}>
                  Guided or quick
                </p>
              </div>
            </Link>
          </motion.div>
        </div>
      </main>

      <BottomNav active="decks" />
    </div>
  );
}
