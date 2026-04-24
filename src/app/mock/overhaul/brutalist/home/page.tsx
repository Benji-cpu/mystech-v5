"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { SAMPLE } from "../../_shared/sample-data";

const fade = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 } };
const spring = { type: "spring" as const, stiffness: 260, damping: 28 };

export default function BrutalistHome() {
  return (
    <div className="relative min-h-[100dvh] pb-24">
      {/* Header with hard divider */}
      <header className="flex items-center justify-between px-5 pt-5">
        <Link href="/mock/overhaul" className="text-sm font-black tracking-tight">MYSTECH</Link>
        <span className="mono text-[10px] uppercase tracking-widest">{SAMPLE.meta.date.toUpperCase()}</span>
      </header>
      <div className="divider mx-5 mt-4" />

      <main className="px-5 pt-8">
        {/* Meta row — monospace */}
        <motion.div {...fade} transition={spring} className="mono flex items-center justify-between text-[10px] uppercase tracking-widest">
          <span>{SAMPLE.meta.weekday}</span>
          <span>{SAMPLE.meta.moonPhase}</span>
          <span>{SAMPLE.meta.moonSign}</span>
        </motion.div>

        {/* Massive display greeting */}
        <motion.h1
          {...fade}
          transition={{ ...spring, delay: 0.04 }}
          className="display mt-8 text-[clamp(3.5rem,16vw,7rem)]"
        >
          GOOD<br />
          EVENING,<br />
          <span className="relative inline-block">
            {SAMPLE.user.name.toUpperCase()}.
            <span
              className="absolute -right-2 -top-1 inline-block h-4 w-4"
              style={{ background: "var(--yellow)" }}
            />
          </span>
        </motion.h1>

        {/* Whisper — small, uppercase, single line */}
        <motion.p
          {...fade}
          transition={{ ...spring, delay: 0.1 }}
          className="mono mt-8 max-w-sm text-xs uppercase tracking-widest leading-relaxed"
          style={{ color: "var(--mid)" }}
        >
          {SAMPLE.greeting.whisper}
        </motion.p>

        <div className="divider mt-10" />

        {/* Primary — full black block, no rounded corners */}
        <motion.div
          {...fade}
          transition={{ ...spring, delay: 0.16 }}
          className="mt-10"
        >
          <div
            className="relative overflow-hidden p-6"
            style={{ background: "var(--black)", color: "var(--bone)" }}
          >
            <div className="flex items-center justify-between">
              <p className="eyebrow" style={{ color: "var(--yellow)" }}>
                {SAMPLE.primaryPractice.eyebrow.toUpperCase()}
              </p>
              <span
                className="mono text-[10px] font-bold uppercase tracking-widest"
                style={{ color: "var(--yellow)" }}
              >
                DAY {SAMPLE.meta.streak}
              </span>
            </div>
            <h2 className="display mt-4 text-4xl sm:text-5xl">
              {SAMPLE.primaryPractice.title.toUpperCase()}
            </h2>
            <p className="mono mt-4 text-xs uppercase tracking-widest" style={{ color: "var(--dim)" }}>
              {SAMPLE.primaryPractice.deckSize} CARDS / 5 MIN
            </p>

            <motion.button
              whileTap={{ scale: 0.98 }}
              className="mt-6 flex w-full items-center justify-between px-4 py-4 text-left"
              style={{ background: "var(--yellow)", color: "var(--black)" }}
            >
              <span className="display-tight text-xl">{SAMPLE.primaryPractice.cta.toUpperCase()} →</span>
              <span className="mono text-[10px] font-bold uppercase tracking-widest">
                / {String(SAMPLE.meta.streak).padStart(2, "0")}
              </span>
            </motion.button>
          </div>
        </motion.div>

        {/* Secondary — bordered block with arrow */}
        <motion.div {...fade} transition={{ ...spring, delay: 0.22 }} className="mt-5">
          <Link
            href="#"
            className="group flex items-center justify-between border-2 p-5 transition-colors hover:bg-[var(--black)] hover:text-[var(--bone)]"
            style={{ borderColor: "var(--black)" }}
          >
            <div>
              <p className="mono text-[10px] uppercase tracking-widest">
                NEXT / {SAMPLE.nextWaypoint.pathName.toUpperCase()}
              </p>
              <p className="display-tight mt-2 text-2xl">
                {SAMPLE.nextWaypoint.waypointName.toUpperCase()}
              </p>
              <p className="mono mt-2 text-[10px] uppercase tracking-widest" style={{ color: "var(--mid)" }}>
                {SAMPLE.nextWaypoint.position.toUpperCase()} · {SAMPLE.nextWaypoint.duration.toUpperCase()}
              </p>
            </div>
            <span className="display text-4xl">→</span>
          </Link>
        </motion.div>

        {/* Recent readings as numbered list */}
        <motion.section {...fade} transition={{ ...spring, delay: 0.3 }} className="mt-14">
          <div className="flex items-baseline justify-between">
            <p className="eyebrow">Recent / Log</p>
            <Link href="#" className="mono text-[10px] uppercase tracking-widest hover:underline">
              ALL →
            </Link>
          </div>

          <ul className="mt-4">
            {SAMPLE.recent.map((r, i) => (
              <li key={r.id} className="border-b-2 last:border-b-0" style={{ borderColor: "var(--black)" }}>
                <Link href="#" className="group flex items-center gap-4 py-5 transition-colors hover:bg-[var(--black)] hover:text-[var(--bone)]">
                  <span className="display w-10 text-3xl shrink-0">{String(i + 1).padStart(2, "0")}</span>
                  <div className="flex-1">
                    <p className="display-tight text-xl">{r.title.toUpperCase()}</p>
                    <p className="mono mt-1 text-[10px] uppercase tracking-widest" style={{ color: "var(--mid)" }}>
                      {r.spread.toUpperCase()} · {r.date.toUpperCase()}
                    </p>
                  </div>
                  <span className="display text-2xl">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </motion.section>
      </main>

      <BottomNav active="home" />
    </div>
  );
}

export function BottomNav({ active }: { active: string }) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-4 border-t-2"
      style={{ background: "var(--bone)", borderColor: "var(--black)" }}
    >
      {SAMPLE.nav.map((item, i) => (
        <button
          key={item.key}
          className="relative flex flex-col items-center gap-0.5 py-3 text-xs transition-colors"
          style={{
            background: item.key === active ? "var(--black)" : "transparent",
            color: item.key === active ? "var(--yellow)" : "var(--black)",
            borderLeft: i > 0 ? "2px solid var(--black)" : undefined,
          }}
        >
          <span className="mono text-[9px] uppercase tracking-widest font-bold">
            {String(i + 1).padStart(2, "0")}
          </span>
          <span className="display-tight text-sm">{item.label.toUpperCase()}</span>
        </button>
      ))}
    </nav>
  );
}
