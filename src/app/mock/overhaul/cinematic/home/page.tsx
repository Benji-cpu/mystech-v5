"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Settings } from "lucide-react";
import { SAMPLE } from "../../_shared/sample-data";

const fade = { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 } };
const spring = { type: "spring" as const, stiffness: 110, damping: 22 };

export default function CinematicHome() {
  return (
    <div className="relative min-h-[100dvh] pb-28">
      <TopBar />

      <main className="relative mx-auto max-w-xl px-6 pt-10 sm:px-10">
        {/* Ambient glow behind greeting */}
        <div
          className="breathe pointer-events-none absolute left-1/2 top-16 -z-10 h-64 w-64 -translate-x-1/2 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(212,177,88,0.25), transparent 70%)" }}
        />

        <motion.div {...fade} transition={spring} className="flex flex-wrap items-center gap-2">
          <span className="eyebrow">{SAMPLE.meta.weekday}</span>
          <span style={{ color: "var(--ink-mute)" }}>·</span>
          <span className="eyebrow">{SAMPLE.meta.moonPhase}</span>
          <span style={{ color: "var(--ink-mute)" }}>·</span>
          <span className="eyebrow">{SAMPLE.meta.moonSign}</span>
        </motion.div>

        <motion.h1
          {...fade}
          transition={{ ...spring, delay: 0.08 }}
          className="display mt-6 text-[clamp(2.5rem,9vw,4rem)] leading-[1]"
        >
          Good evening,<br />
          <span style={{ color: "var(--gold)" }}>{SAMPLE.user.name}.</span>
        </motion.h1>

        <motion.p
          {...fade}
          transition={{ ...spring, delay: 0.16 }}
          className="whisper mt-6 text-xl leading-relaxed"
          style={{ color: "var(--ink-soft)" }}
        >
          {SAMPLE.greeting.whisper}
        </motion.p>

        {/* Primary invitation — glass surface with gold border */}
        <motion.div {...fade} transition={{ ...spring, delay: 0.24 }} className="mt-10">
          <div
            className="relative overflow-hidden rounded-2xl p-7 surface"
            style={{
              borderColor: "var(--line-strong)",
              boxShadow: "0 0 40px rgba(78, 47, 122, 0.3)",
            }}
          >
            {/* Gold gradient edge */}
            <div
              className="pointer-events-none absolute inset-0 opacity-40"
              style={{
                background: "linear-gradient(135deg, rgba(212,177,88,0.15) 0%, transparent 40%)",
              }}
            />

            <div className="relative flex items-baseline justify-between">
              <p className="eyebrow">{SAMPLE.primaryPractice.eyebrow}</p>
              <span
                className="rounded-full border px-3 py-1 text-[10px]"
                style={{
                  borderColor: "var(--gold-soft)",
                  color: "var(--gold)",
                  background: "rgba(212,177,88,0.08)",
                }}
              >
                ✦ Day {SAMPLE.meta.streak}
              </span>
            </div>
            <h2 className="display relative mt-5 text-3xl leading-tight">{SAMPLE.primaryPractice.title}</h2>
            <p className="relative mt-3 text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
              {SAMPLE.primaryPractice.description}
            </p>

            <div className="relative mt-6 flex items-center gap-4">
              <div className="flex -space-x-4">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="float h-14 w-10 rounded"
                    style={{
                      background: "linear-gradient(160deg, #2A2130 0%, #0D0A10 100%)",
                      border: "1px solid rgba(212,177,88,0.4)",
                      boxShadow: "0 0 12px rgba(212,177,88,0.15)",
                      animationDelay: `${i * 0.5}s`,
                    }}
                  />
                ))}
              </div>
              <p className="text-xs" style={{ color: "var(--ink-mute)" }}>
                {SAMPLE.primaryPractice.deckSize} cards in your chronicle
              </p>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              className="relative mt-7 w-full overflow-hidden rounded-full px-6 py-3.5 text-sm font-medium"
              style={{
                background: "linear-gradient(135deg, #D4B158 0%, #8F7635 100%)",
                color: "#07050E",
                boxShadow: "0 0 24px rgba(212,177,88,0.35)",
              }}
            >
              {SAMPLE.primaryPractice.cta}
            </motion.button>
          </div>
        </motion.div>

        {/* Secondary */}
        <motion.div {...fade} transition={{ ...spring, delay: 0.32 }} className="mt-5">
          <Link
            href="#"
            className="group flex items-center justify-between rounded-xl p-5 surface transition-colors hover:bg-[rgba(26,20,40,0.8)]"
          >
            <div>
              <p className="eyebrow">Next on {SAMPLE.nextWaypoint.pathName}</p>
              <p className="display mt-1.5 text-lg">{SAMPLE.nextWaypoint.waypointName}</p>
              <p className="mt-1 text-xs" style={{ color: "var(--ink-mute)" }}>
                {SAMPLE.nextWaypoint.position} · {SAMPLE.nextWaypoint.duration}
              </p>
            </div>
            <span
              className="text-lg transition-transform group-hover:translate-x-1"
              style={{ color: "var(--gold)" }}
            >
              →
            </span>
          </Link>
        </motion.div>

        <motion.section {...fade} transition={{ ...spring, delay: 0.4 }} className="mt-16">
          <div className="flex items-baseline justify-between">
            <p className="eyebrow">Recent readings</p>
            <Link href="#" className="text-xs hover:underline" style={{ color: "var(--ink-mute)" }}>
              View all
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {SAMPLE.recent.map((r) => (
              <li key={r.id}>
                <Link
                  href="#"
                  className="flex items-baseline justify-between rounded-lg px-4 py-3 transition-colors hover:bg-[rgba(237,228,208,0.04)]"
                >
                  <div>
                    <p className="display text-base leading-tight">{r.title}</p>
                    <p className="mt-1 text-xs" style={{ color: "var(--ink-mute)" }}>
                      {r.spread} · {r.date}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </motion.section>

        <motion.p
          {...fade}
          transition={{ ...spring, delay: 0.5 }}
          className="whisper mt-16 text-center text-sm"
          style={{ color: "var(--ink-mute)" }}
        >
          ✦ Let the evening settle ✦
        </motion.p>
      </main>

      <BottomNav active="home" />
    </div>
  );
}

function TopBar() {
  return (
    <div className="sticky top-0 z-10 flex items-center justify-between px-6 pt-6 sm:px-10">
      <Link href="/mock/overhaul" className="display text-base" style={{ letterSpacing: "0.04em" }}>
        MysTech
      </Link>
      <button
        className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-[rgba(237,228,208,0.08)]"
        style={{ color: "var(--ink-soft)" }}
      >
        <Settings size={18} strokeWidth={1.5} />
      </button>
    </div>
  );
}

export function BottomNav({ active }: { active: string }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-xl px-6 pb-6 sm:px-10">
      <div
        className="flex items-center justify-between rounded-full border px-2 py-2 backdrop-blur-2xl"
        style={{
          background: "rgba(15, 10, 28, 0.8)",
          borderColor: "var(--line-strong)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        }}
      >
        {SAMPLE.nav.map((item) => (
          <button
            key={item.key}
            className="flex-1 rounded-full px-3 py-2 text-sm transition-colors"
            style={{
              background: item.key === active
                ? "linear-gradient(135deg, rgba(212,177,88,0.2) 0%, rgba(212,177,88,0.05) 100%)"
                : "transparent",
              color: item.key === active ? "var(--gold)" : "var(--ink-mute)",
              fontWeight: item.key === active ? 500 : 400,
              border: item.key === active ? "1px solid rgba(212,177,88,0.3)" : "1px solid transparent",
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
