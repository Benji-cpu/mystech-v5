"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import { SAMPLE } from "../../_shared/sample-data";
import { BottomNav } from "../home/page";

const tabs = ["MY", "LIVING", "ADOPTED"];

const DECK_BG: Record<string, string> = {
  indigo: "#1A1524",
  rose: "#6B2A3A",
  moss: "#2A3A28",
  rust: "#8A3A20",
  pale: "#D4CBB5",
  deep: "#0A0A0A",
};

const DECK_FG: Record<string, string> = {
  indigo: "var(--bone)",
  rose: "var(--bone)",
  moss: "var(--bone)",
  rust: "var(--bone)",
  pale: "var(--black)",
  deep: "var(--yellow)",
};

export default function BrutalistLibrary() {
  const [tab, setTab] = useState(0);

  return (
    <div className="relative min-h-[100dvh] pb-24">
      <header className="flex items-center justify-between px-5 pt-5">
        <Link href="/mock/overhaul" className="text-sm font-black tracking-tight">MYSTECH</Link>
        <span className="mono text-[10px] uppercase tracking-widest">{SAMPLE.decks.length} DECKS</span>
      </header>
      <div className="divider mx-5 mt-4" />

      <main className="px-5 pt-8">
        <p className="eyebrow">Library / 002</p>
        <h1 className="display mt-4 text-[clamp(3rem,13vw,6.5rem)]">
          YOUR<br />DECKS.
        </h1>

        {/* Tabs — stark buttons */}
        <div className="mt-10 grid grid-cols-3 gap-0">
          {tabs.map((t, i) => (
            <button
              key={t}
              onClick={() => setTab(i)}
              className="border-2 py-3 text-sm font-black uppercase tracking-widest transition-colors"
              style={{
                borderColor: "var(--black)",
                background: tab === i ? "var(--black)" : "transparent",
                color: tab === i ? "var(--yellow)" : "var(--black)",
                borderRightWidth: i < 2 ? 0 : 2,
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Deck grid — two columns, hard borders */}
        <div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-8">
          {SAMPLE.decks.map((d, i) => (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 28, delay: i * 0.04 }}
            >
              <Link href="#" className="group block">
                <div
                  className="relative aspect-[2/3] border-2"
                  style={{
                    background: DECK_BG[d.hue] ?? DECK_BG.indigo,
                    color: DECK_FG[d.hue] ?? "var(--bone)",
                    borderColor: "var(--black)",
                  }}
                >
                  <div className="absolute left-2 top-2">
                    <span className="mono text-[9px] font-bold uppercase tracking-widest">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  {d.tag && (
                    <span
                      className="absolute right-2 top-2 px-2 py-1 text-[9px] font-bold uppercase tracking-widest"
                      style={{
                        background: "var(--yellow)",
                        color: "var(--black)",
                      }}
                    >
                      {d.tag}
                    </span>
                  )}
                  <div className="flex h-full items-center justify-center">
                    <span className="display text-6xl">✦</span>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="display-tight text-lg leading-tight">{d.title.toUpperCase()}</p>
                  <p className="mono mt-1 text-[10px] uppercase tracking-widest" style={{ color: "var(--mid)" }}>
                    {d.cardCount} CARDS · {d.subtitle.toUpperCase()}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}

          {/* New deck CTA */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 28, delay: SAMPLE.decks.length * 0.04 }}
          >
            <Link href="#" className="group block">
              <div
                className="relative flex aspect-[2/3] items-center justify-center border-2"
                style={{
                  background: "var(--yellow)",
                  borderColor: "var(--black)",
                }}
              >
                <span className="display text-8xl">+</span>
              </div>
              <div className="mt-2">
                <p className="display-tight text-lg leading-tight">NEW DECK</p>
                <p className="mono mt-1 text-[10px] uppercase tracking-widest" style={{ color: "var(--mid)" }}>
                  START
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
