"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useState } from "react";
import { SAMPLE } from "../../_shared/sample-data";
import { BottomNav } from "../home/page";

const tabs = ["my decks", "living", "adopted"];

const DECK_STYLES: Record<string, { bg: string; fg: string; border: string }> = {
  indigo: { bg: "var(--moss-deep)", fg: "var(--parchment)", border: "var(--ink-brown)" },
  rose: { bg: "#A34B5A", fg: "var(--parchment)", border: "var(--ink-brown)" },
  moss: { bg: "var(--moss)", fg: "var(--parchment)", border: "var(--ink-brown)" },
  rust: { bg: "var(--rust)", fg: "var(--parchment)", border: "var(--ink-brown)" },
  pale: { bg: "var(--parchment-warm)", fg: "var(--ink-brown)", border: "var(--ink-brown)" },
  deep: { bg: "var(--ink-brown)", fg: "var(--rust)", border: "var(--ink-brown)" },
};

export default function AnalogLibrary() {
  const [tab, setTab] = useState(0);

  return (
    <div className="relative min-h-[100dvh] pb-28">
      <header className="flex items-center justify-between px-6 pt-6 sm:px-10">
        <Link href="/mock/overhaul" className="display-italic text-xl" style={{ color: "var(--rust)" }}>
          MysTech
        </Link>
        <button className="flex h-9 w-9 items-center justify-center" style={{ color: "var(--ink-soft)" }}>
          <Search size={18} strokeWidth={1.5} />
        </button>
      </header>

      <main className="mx-auto max-w-xl px-6 pt-6 sm:px-10">
        <div className="flex justify-center">
          <svg width="60" height="14" viewBox="0 0 60 14" fill="none">
            <path d="M2 7 Q 15 2, 30 7 T 58 7" stroke="var(--rust)" strokeWidth="1" strokeLinecap="round" fill="none" />
            <circle cx="30" cy="7" r="1.5" fill="var(--rust)" />
          </svg>
        </div>

        <div className="mt-6 text-center">
          <p className="eyebrow">A library</p>
          <h1 className="display mt-3 text-[clamp(2.5rem,9vw,4rem)]">
            your <span className="display-italic" style={{ color: "var(--rust)" }}>decks</span>
          </h1>
          <p className="whisper mt-3 text-base" style={{ color: "var(--ink-soft)" }}>
            six decks &mdash; each a small argument with yourself
          </p>
        </div>

        {/* Tabs — with underline */}
        <div className="mt-10 flex justify-center gap-8">
          {tabs.map((t, i) => (
            <button
              key={t}
              onClick={() => setTab(i)}
              className="display-italic relative pb-2 text-base transition-colors"
              style={{ color: tab === i ? "var(--rust)" : "var(--ink-faint)" }}
            >
              {t}
              {tab === i && (
                <motion.span
                  layoutId="analog-tab"
                  className="absolute inset-x-0 -bottom-0.5"
                  style={{ height: "2px", background: "var(--rust)" }}
                />
              )}
            </button>
          ))}
        </div>

        <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10">
          {SAMPLE.decks.map((d, i) => {
            const style = DECK_STYLES[d.hue] ?? DECK_STYLES.indigo;
            const rot = [-1.5, 1, -0.5, 1.5, -1, 0.8][i % 6];
            return (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, y: 12, rotate: rot - 4 }}
                animate={{ opacity: 1, y: 0, rotate: rot }}
                transition={{ type: "spring", stiffness: 180, damping: 22, delay: i * 0.06 }}
                style={{ transformOrigin: "center" }}
              >
                <Link href="#" className="group block">
                  <div
                    className="relative aspect-[2/3] rounded-sm border-2"
                    style={{
                      background: style.bg,
                      color: style.fg,
                      borderColor: style.border,
                      boxShadow: "3px 3px 0 var(--ink-brown)",
                    }}
                  >
                    {d.tag && (
                      <div className="absolute -left-1 -top-2">
                        <span className="stamp" style={{ background: "var(--parchment)" }}>
                          {d.tag}
                        </span>
                      </div>
                    )}
                    <div className="flex h-full flex-col items-center justify-center p-3">
                      <span className="display text-5xl">✦</span>
                      <p className="whisper mt-2 text-center text-xs leading-tight" style={{ opacity: 0.9 }}>
                        {d.title}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 px-1">
                    <p className="display text-base leading-tight">{d.title}</p>
                    <p className="whisper mt-1 text-xs" style={{ color: "var(--ink-faint)" }}>
                      {d.subtitle} · {d.cardCount} cards
                    </p>
                  </div>
                </Link>
              </motion.div>
            );
          })}

          {/* New deck */}
          <motion.div
            initial={{ opacity: 0, y: 12, rotate: -2 }}
            animate={{ opacity: 1, y: 0, rotate: 1 }}
            transition={{ type: "spring", stiffness: 180, damping: 22, delay: SAMPLE.decks.length * 0.06 }}
          >
            <Link href="#" className="group block">
              <div
                className="flex aspect-[2/3] items-center justify-center rounded-sm border-2 border-dashed"
                style={{
                  borderColor: "var(--rust)",
                  background: "var(--parchment-card)",
                  boxShadow: "3px 3px 0 var(--line)",
                }}
              >
                <div className="text-center">
                  <span className="display text-6xl" style={{ color: "var(--rust)" }}>+</span>
                  <p className="display-italic mt-2 text-sm" style={{ color: "var(--rust)" }}>
                    a new deck
                  </p>
                </div>
              </div>
              <div className="mt-3 px-1">
                <p className="display text-base leading-tight">Create a deck</p>
                <p className="whisper mt-1 text-xs" style={{ color: "var(--ink-faint)" }}>
                  guided or quick
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
