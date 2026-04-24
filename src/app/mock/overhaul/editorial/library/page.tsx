"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { SAMPLE } from "../../_shared/sample-data";
import { BottomNav } from "../home/page";

const tabs = ["My decks", "Living", "Adopted"];

const DECK_BG: Record<string, string> = {
  indigo: "linear-gradient(160deg, #2A2130 0%, #0D0A10 100%)",
  rose: "linear-gradient(160deg, #C26A7A 0%, #4A1E2A 100%)",
  moss: "linear-gradient(160deg, #4A5B3D 0%, #1E2818 100%)",
  rust: "linear-gradient(160deg, #A34B2A 0%, #2E1814 100%)",
  pale: "linear-gradient(160deg, #E8D8BC 0%, #8A7558 100%)",
  deep: "linear-gradient(160deg, #1C2230 0%, #080B14 100%)",
};

export default function EditorialLibrary() {
  const [tab, setTab] = useState(0);

  return (
    <div className="relative min-h-[100dvh] pb-28">
      <header className="flex items-center justify-between px-6 pt-6 sm:px-10">
        <Link href="/mock/overhaul" className="display text-base">MysTech</Link>
        <button className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-[var(--paper-warm)]">
          <Search size={18} strokeWidth={1.5} />
        </button>
      </header>

      <main className="mx-auto max-w-xl px-6 pt-8 sm:px-10">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="eyebrow">Library</p>
            <h1 className="display mt-3 text-[clamp(2.25rem,8vw,3.5rem)] leading-[0.98]">
              Your decks
            </h1>
          </div>
        </div>

        <p className="whisper mt-3 text-base" style={{ color: "var(--ink-soft)" }}>
          Six decks. Each one a small argument with yourself.
        </p>

        {/* Tabs */}
        <div className="mt-8 flex gap-6 border-b hair">
          {tabs.map((t, i) => (
            <button
              key={t}
              onClick={() => setTab(i)}
              className="relative -mb-px pb-3 text-sm transition-colors"
              style={{
                color: tab === i ? "var(--ink)" : "var(--ink-mute)",
                fontWeight: tab === i ? 500 : 400,
              }}
            >
              {t}
              {tab === i && (
                <motion.span
                  layoutId="editorial-tab"
                  className="absolute inset-x-0 -bottom-px h-px"
                  style={{ background: "var(--ink)" }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Deck grid */}
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8">
          {SAMPLE.decks.map((d, i) => (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 180, damping: 22, delay: i * 0.04 }}
            >
              <Link href="#" className="group block">
                <div
                  className="relative aspect-[2/3] overflow-hidden rounded-md border"
                  style={{
                    background: DECK_BG[d.hue] ?? DECK_BG.indigo,
                    borderColor: "rgba(26,22,20,0.08)",
                    boxShadow: "0 8px 24px rgba(26,22,20,0.08)",
                  }}
                >
                  {d.tag && (
                    <span
                      className="absolute left-3 top-3 rounded-full px-2 py-0.5 text-[9px]"
                      style={{
                        background: "rgba(251,247,238,0.9)",
                        color: d.tag === "Draft" ? "var(--ink-mute)" : "var(--gold)",
                        fontWeight: 500,
                      }}
                    >
                      {d.tag}
                    </span>
                  )}
                  <div className="absolute bottom-0 p-3">
                    <span className="display text-2xl" style={{ color: "rgba(255,255,255,0.2)" }}>
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

          {/* New deck CTA */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 180, damping: 22, delay: SAMPLE.decks.length * 0.04 }}
          >
            <Link
              href="#"
              className="group block"
            >
              <div
                className="flex aspect-[2/3] items-center justify-center rounded-md border-2 border-dashed"
                style={{ borderColor: "var(--line)", background: "var(--paper-warm)" }}
              >
                <Plus size={24} strokeWidth={1.5} style={{ color: "var(--ink-mute)" }} />
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
