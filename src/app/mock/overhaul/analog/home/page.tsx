"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Settings } from "lucide-react";
import { SAMPLE } from "../../_shared/sample-data";

const fade = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } };
const spring = { type: "spring" as const, stiffness: 140, damping: 24 };

export default function AnalogHome() {
  return (
    <div className="relative min-h-[100dvh] pb-28">
      <TopBar />

      <main className="mx-auto max-w-xl px-6 pt-8 sm:px-10">
        {/* Hand-drawn ornamental divider */}
        <motion.div {...fade} transition={spring} className="flex justify-center">
          <svg width="60" height="14" viewBox="0 0 60 14" fill="none">
            <path
              d="M2 7 Q 15 2, 30 7 T 58 7"
              stroke="var(--rust)"
              strokeWidth="1"
              strokeLinecap="round"
              fill="none"
            />
            <circle cx="30" cy="7" r="1.5" fill="var(--rust)" />
          </svg>
        </motion.div>

        <motion.div
          {...fade}
          transition={{ ...spring, delay: 0.05 }}
          className="mt-6 text-center"
        >
          <p className="eyebrow">{SAMPLE.meta.weekday} · {SAMPLE.meta.date}</p>
          <p className="mt-2 text-xs" style={{ color: "var(--ink-faint)" }}>
            {SAMPLE.meta.moonPhase} · {SAMPLE.meta.moonSign}
          </p>
        </motion.div>

        <motion.h1
          {...fade}
          transition={{ ...spring, delay: 0.12 }}
          className="display mt-8 text-center text-[clamp(2.75rem,10vw,4.5rem)]"
        >
          Good evening,<br />
          <span className="display-italic" style={{ color: "var(--rust)" }}>dear {SAMPLE.user.name}</span>
        </motion.h1>

        <motion.p
          {...fade}
          transition={{ ...spring, delay: 0.2 }}
          className="whisper mt-6 text-center text-lg leading-relaxed"
          style={{ color: "var(--ink-soft)" }}
        >
          &mdash; {SAMPLE.greeting.whisper} &mdash;
        </motion.p>

        {/* Primary — letter-style card */}
        <motion.div {...fade} transition={{ ...spring, delay: 0.28 }} className="mt-12">
          <div className="relative paper rounded-sm p-7" style={{ boxShadow: "0 4px 12px rgba(46, 35, 24, 0.08), 0 1px 3px rgba(46, 35, 24, 0.06)" }}>
            {/* Corner stamp */}
            <div className="absolute right-5 top-5">
              <span className="stamp">Day {SAMPLE.meta.streak}</span>
            </div>

            <p className="eyebrow">{SAMPLE.primaryPractice.eyebrow}</p>
            <h2 className="display mt-4 text-3xl">
              {SAMPLE.primaryPractice.title}
            </h2>
            <p className="whisper mt-3 text-base leading-relaxed" style={{ color: "var(--ink-soft)" }}>
              {SAMPLE.primaryPractice.description}
            </p>

            {/* Hand-drawn cards */}
            <div className="mt-6 flex items-center gap-4">
              <div className="relative flex">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="relative -mr-5 h-16 w-11 rounded-sm"
                    style={{
                      background: i === 0 ? "var(--rust)" : i === 1 ? "var(--moss)" : "var(--rust-deep)",
                      border: "1.5px solid var(--ink-brown)",
                      transform: `rotate(${-4 + i * 4}deg)`,
                      boxShadow: "2px 2px 0 rgba(46,35,24,0.15)",
                    }}
                  >
                    <div className="flex h-full items-center justify-center">
                      <span className="display text-2xl" style={{ color: "var(--parchment)" }}>✦</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs" style={{ color: "var(--ink-faint)" }}>
                {SAMPLE.primaryPractice.deckSize} cards
              </p>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              className="mt-7 relative w-full rounded-sm border-2 px-6 py-3 text-center text-base font-semibold transition-colors"
              style={{
                borderColor: "var(--ink-brown)",
                background: "var(--rust)",
                color: "var(--parchment)",
                boxShadow: "3px 3px 0 var(--ink-brown)",
              }}
            >
              <span className="display-italic">~ {SAMPLE.primaryPractice.cta} ~</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Secondary — waypoint */}
        <motion.div {...fade} transition={{ ...spring, delay: 0.36 }} className="mt-6">
          <Link
            href="#"
            className="group relative block rounded-sm border-2 p-5 transition-colors paper"
            style={{ borderColor: "var(--line)" }}
          >
            <div className="flex items-center gap-4">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                style={{ background: "var(--moss)", color: "var(--parchment)" }}
              >
                <span className="display">✦</span>
              </div>
              <div className="flex-1">
                <p className="eyebrow" style={{ color: "var(--moss)" }}>
                  {SAMPLE.nextWaypoint.pathName}
                </p>
                <p className="display mt-1 text-xl">{SAMPLE.nextWaypoint.waypointName}</p>
                <p className="whisper mt-1 text-xs" style={{ color: "var(--ink-faint)" }}>
                  {SAMPLE.nextWaypoint.position} · {SAMPLE.nextWaypoint.duration}
                </p>
              </div>
              <span className="display-italic text-2xl" style={{ color: "var(--rust)" }}>→</span>
            </div>
          </Link>
        </motion.div>

        <motion.section {...fade} transition={{ ...spring, delay: 0.44 }} className="mt-16">
          <div className="flex items-center justify-between">
            <p className="eyebrow">Recent Entries</p>
            <Link href="#" className="whisper text-sm hover:underline" style={{ color: "var(--rust)" }}>
              see all
            </Link>
          </div>

          <ul className="mt-6 space-y-6">
            {SAMPLE.recent.map((r, i) => (
              <li key={r.id} className="flex gap-5">
                <div className="flex flex-col items-center">
                  <span
                    className="display-italic text-3xl"
                    style={{ color: i === 0 ? "var(--rust)" : "var(--ink-faint)" }}
                  >
                    {i + 1}
                  </span>
                  {i < SAMPLE.recent.length - 1 && (
                    <div
                      className="mt-1 w-px flex-1"
                      style={{
                        background: `linear-gradient(to bottom, var(--line), transparent)`,
                        minHeight: "2rem",
                      }}
                    />
                  )}
                </div>
                <Link href="#" className="group flex-1 pb-2">
                  <p className="display text-lg">{r.title}</p>
                  <p className="whisper mt-1 text-sm" style={{ color: "var(--ink-soft)" }}>
                    {r.spread}, {r.date}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </motion.section>

        <motion.div {...fade} transition={{ ...spring, delay: 0.55 }} className="mt-16 flex justify-center">
          <svg width="60" height="14" viewBox="0 0 60 14" fill="none">
            <path d="M2 7 Q 15 2, 30 7 T 58 7" stroke="var(--rust)" strokeWidth="1" strokeLinecap="round" fill="none" />
            <circle cx="30" cy="7" r="1.5" fill="var(--rust)" />
          </svg>
        </motion.div>

        <motion.p
          {...fade}
          transition={{ ...spring, delay: 0.62 }}
          className="whisper mt-4 text-center text-sm"
          style={{ color: "var(--ink-faint)" }}
        >
          with love &mdash; the deck
        </motion.p>
      </main>

      <BottomNav active="home" />
    </div>
  );
}

function TopBar() {
  return (
    <div className="flex items-center justify-between px-6 pt-6 sm:px-10">
      <Link href="/mock/overhaul" className="display-italic text-xl" style={{ color: "var(--rust)" }}>
        MysTech
      </Link>
      <button className="flex h-9 w-9 items-center justify-center rounded-full" style={{ color: "var(--ink-soft)" }}>
        <Settings size={18} strokeWidth={1.5} />
      </button>
    </div>
  );
}

export function BottomNav({ active }: { active: string }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-xl px-4 pb-5 sm:px-10">
      <div
        className="relative flex items-center justify-between rounded-full border-2 px-2 py-2"
        style={{
          background: "var(--parchment-card)",
          borderColor: "var(--ink-brown)",
          boxShadow: "3px 3px 0 var(--ink-brown)",
        }}
      >
        {SAMPLE.nav.map((item) => (
          <button
            key={item.key}
            className="flex-1 rounded-full px-3 py-2 text-sm transition-colors"
            style={{
              background: item.key === active ? "var(--rust)" : "transparent",
              color: item.key === active ? "var(--parchment)" : "var(--ink-soft)",
              fontFamily: item.key === active ? "var(--font-instrument), Georgia, serif" : undefined,
              fontStyle: item.key === active ? "italic" : "normal",
              fontWeight: item.key === active ? 400 : 500,
              fontSize: item.key === active ? "15px" : "13px",
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
