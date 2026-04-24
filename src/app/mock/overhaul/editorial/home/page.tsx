"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Settings } from "lucide-react";
import { SAMPLE } from "../../_shared/sample-data";

const fade = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };
const spring = { type: "spring" as const, stiffness: 120, damping: 20 };

export default function EditorialHome() {
  return (
    <div className="relative min-h-[100dvh] pb-28">
      <TopBar />
      <main className="mx-auto max-w-xl px-6 pt-6 sm:px-10 sm:pt-10">
        <motion.div {...fade} transition={spring} className="flex flex-wrap items-center gap-2">
          <span className="eyebrow">{SAMPLE.meta.weekday}</span>
          <span style={{ color: "var(--line)" }}>·</span>
          <span className="eyebrow">{SAMPLE.meta.moonPhase}</span>
          <span style={{ color: "var(--line)" }}>·</span>
          <span className="eyebrow">{SAMPLE.meta.moonSign}</span>
        </motion.div>

        <motion.h1
          {...fade}
          transition={{ ...spring, delay: 0.05 }}
          className="display mt-6 text-[clamp(2.5rem,9vw,4rem)] leading-[0.95]"
        >
          Good evening,<br />
          <span style={{ color: "var(--ink-soft)" }}>{SAMPLE.user.name}.</span>
        </motion.h1>

        <motion.p
          {...fade}
          transition={{ ...spring, delay: 0.12 }}
          className="whisper mt-6 text-xl leading-relaxed"
          style={{ color: "var(--ink-soft)" }}
        >
          {SAMPLE.greeting.whisper}
        </motion.p>

        {/* Primary invitation */}
        <motion.div {...fade} transition={{ ...spring, delay: 0.2 }} className="mt-10">
          <div className="rounded-3xl border p-7 hair" style={{ background: "var(--paper-card)" }}>
            <div className="flex items-baseline justify-between">
              <p className="eyebrow">{SAMPLE.primaryPractice.eyebrow}</p>
              <span
                className="rounded-full px-2.5 py-1 text-[10px] font-medium"
                style={{ background: "var(--paper-warm)", color: "var(--gold)" }}
              >
                Day {SAMPLE.meta.streak}
              </span>
            </div>
            <h2 className="display mt-5 text-3xl leading-tight">{SAMPLE.primaryPractice.title}</h2>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--ink-mute)" }}>
              {SAMPLE.primaryPractice.description}
            </p>
            <div className="mt-6 flex items-center gap-4">
              <div className="flex -space-x-3">
                {["deep", "mid", "soft"].map((t) => (
                  <CardBack key={t} tint={t as "deep" | "mid" | "soft"} />
                ))}
              </div>
              <p className="text-xs" style={{ color: "var(--ink-mute)" }}>
                {SAMPLE.primaryPractice.deckSize} cards in your chronicle
              </p>
            </div>
            <motion.button
              whileTap={{ scale: 0.98 }}
              className="mt-7 w-full rounded-full px-6 py-3.5 text-sm font-medium"
              style={{ background: "var(--ink)", color: "var(--paper)" }}
            >
              {SAMPLE.primaryPractice.cta}
            </motion.button>
          </div>
        </motion.div>

        {/* Secondary — next waypoint */}
        <motion.div {...fade} transition={{ ...spring, delay: 0.28 }} className="mt-5">
          <Link
            href="#"
            className="group flex items-center justify-between rounded-2xl border p-5 hair transition-colors hover:border-[var(--ink-soft)]"
          >
            <div>
              <p className="eyebrow">Next on {SAMPLE.nextWaypoint.pathName}</p>
              <p className="display mt-1.5 text-lg">{SAMPLE.nextWaypoint.waypointName}</p>
              <p className="mt-1 text-xs" style={{ color: "var(--ink-mute)" }}>
                {SAMPLE.nextWaypoint.position} · {SAMPLE.nextWaypoint.duration}
              </p>
            </div>
            <span className="text-base transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </motion.div>

        <motion.section {...fade} transition={{ ...spring, delay: 0.35 }} className="mt-16">
          <div className="flex items-baseline justify-between">
            <p className="eyebrow">Recent readings</p>
            <Link href="#" className="text-xs hover:underline" style={{ color: "var(--ink-mute)" }}>
              View all
            </Link>
          </div>
          <ul className="mt-4 divide-y hair">
            {SAMPLE.recent.map((r) => (
              <li key={r.id}>
                <Link href="#" className="group flex items-baseline justify-between py-4">
                  <div>
                    <p className="display text-base leading-tight">{r.title}</p>
                    <p className="mt-1 text-xs" style={{ color: "var(--ink-mute)" }}>
                      {r.spread} · {r.date}
                    </p>
                  </div>
                  <span className="text-sm opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </motion.section>

        <motion.p
          {...fade}
          transition={{ ...spring, delay: 0.45 }}
          className="whisper mt-16 text-center text-sm"
          style={{ color: "var(--ink-faint)" }}
        >
          Let the evening settle.
        </motion.p>
      </main>

      <BottomNav active="home" />
    </div>
  );
}

function TopBar() {
  return (
    <div className="sticky top-0 z-10 flex items-center justify-between px-6 pt-6 sm:px-10">
      <Link href="/mock/overhaul" className="display text-base">MysTech</Link>
      <button className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-[var(--paper-warm)]">
        <Settings size={18} strokeWidth={1.5} />
      </button>
    </div>
  );
}

function CardBack({ tint }: { tint: "deep" | "mid" | "soft" }) {
  const bg = tint === "deep" ? "linear-gradient(135deg, #2A2130 0%, #0D0A10 100%)"
    : tint === "mid" ? "linear-gradient(135deg, #3D342E 0%, #1A1420 100%)"
    : "linear-gradient(135deg, #7A6E63 0%, #3D342E 100%)";
  return <div className="h-14 w-10 rounded border" style={{ background: bg, borderColor: "rgba(168,134,63,0.4)" }} />;
}

export function BottomNav({ active }: { active: string }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-xl px-6 pb-6 sm:px-10">
      <div className="flex items-center justify-between rounded-full border px-2 py-2 backdrop-blur-xl" style={{ background: "rgba(251,247,238,0.85)", borderColor: "var(--line)" }}>
        {SAMPLE.nav.map((item) => (
          <button
            key={item.key}
            className="flex-1 rounded-full px-3 py-2 text-sm transition-colors"
            style={{
              background: item.key === active ? "var(--ink)" : "transparent",
              color: item.key === active ? "var(--paper)" : "var(--ink-mute)",
              fontWeight: item.key === active ? 500 : 400,
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
