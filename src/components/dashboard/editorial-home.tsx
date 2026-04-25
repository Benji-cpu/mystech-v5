"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface EditorialHomeData {
  greeting: string;
  userName: string;
  whisper: string;
  subtitle: string | null;
  meta: {
    weekday: string;
    moonPhase: string | null;
    moonSign: string | null;
  };
  primary: {
    eyebrow: string;
    title: string;
    description: string;
    href: string;
    cta: string;
    badge?: string;
  };
  secondary: {
    title: string;
    durationMin: number;
    pathId: string;
    pathName: string;
    waypointName: string;
  } | null;
}

const fade = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };
const spring = { type: "spring" as const, stiffness: 120, damping: 20 };

export function EditorialHome({ data }: { data: EditorialHomeData }) {
  return (
    <div
      className="daylight fixed inset-0 overflow-y-auto"
      style={{ background: "var(--paper)", zIndex: 1 }}
    >
      <div className="mx-auto max-w-xl px-6 py-10 pb-28 sm:px-10 sm:py-14">
        {/* Meta row */}
        <motion.div {...fade} transition={spring} className="flex flex-wrap items-center gap-2">
          <span className="eyebrow">{data.meta.weekday}</span>
          {data.meta.moonPhase && (
            <>
              <span style={{ color: "var(--line)" }}>·</span>
              <span className="eyebrow">{data.meta.moonPhase}</span>
            </>
          )}
          {data.meta.moonSign && (
            <>
              <span style={{ color: "var(--line)" }}>·</span>
              <span className="eyebrow">{data.meta.moonSign}</span>
            </>
          )}
        </motion.div>

        {/* Display greeting */}
        <motion.h1
          {...fade}
          transition={{ ...spring, delay: 0.05 }}
          className="display mt-6 text-[clamp(2.5rem,9vw,4rem)] leading-[0.95]"
          style={{ color: "var(--ink)" }}
        >
          {data.greeting},
          <br />
          <span style={{ color: "var(--ink-soft)" }}>{data.userName}.</span>
        </motion.h1>

        {/* Lyra whisper */}
        <motion.p
          {...fade}
          transition={{ ...spring, delay: 0.12 }}
          className="whisper mt-6 text-xl leading-relaxed"
          style={{ color: "var(--ink-soft)" }}
        >
          {data.whisper}
        </motion.p>

        {data.subtitle && (
          <motion.p
            {...fade}
            transition={{ ...spring, delay: 0.16 }}
            className="mt-2 text-sm"
            style={{ color: "var(--ink-mute)" }}
          >
            {data.subtitle}
          </motion.p>
        )}

        {/* Primary invitation */}
        <motion.div {...fade} transition={{ ...spring, delay: 0.22 }} className="mt-10">
          <Link
            href={data.primary.href}
            className="block rounded-3xl border p-7 hair transition-colors hover:border-[var(--ink-soft)]"
            style={{ background: "var(--paper-card)" }}
          >
            <div className="flex items-baseline justify-between">
              <p className="eyebrow">{data.primary.eyebrow}</p>
              {data.primary.badge && (
                <span
                  className="rounded-full px-2.5 py-1 text-[10px] font-medium"
                  style={{ background: "var(--paper-warm)", color: "var(--accent-gold)" }}
                >
                  {data.primary.badge}
                </span>
              )}
            </div>
            <h2
              className="display mt-5 text-3xl leading-tight"
              style={{ color: "var(--ink)" }}
            >
              {data.primary.title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--ink-mute)" }}>
              {data.primary.description}
            </p>

            <div className="mt-7 flex items-center justify-between">
              <span
                className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium"
                style={{ background: "var(--ink)", color: "var(--paper)" }}
              >
                {data.primary.cta}
                <span>→</span>
              </span>

              <div className="flex -space-x-3">
                <CardBack tint="deep" />
                <CardBack tint="mid" />
                <CardBack tint="soft" />
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Secondary — next waypoint */}
        {data.secondary && (
          <motion.div {...fade} transition={{ ...spring, delay: 0.3 }} className="mt-5">
            <Link
              href={`/paths/${data.secondary.pathId}`}
              className="group flex items-center justify-between rounded-2xl border p-5 hair transition-colors hover:border-[var(--ink-soft)]"
            >
              <div>
                <p className="eyebrow">Next on {data.secondary.pathName}</p>
                <p className="display mt-1.5 text-lg" style={{ color: "var(--ink)" }}>
                  {data.secondary.waypointName}
                </p>
                <p className="mt-1 text-xs" style={{ color: "var(--ink-mute)" }}>
                  {data.secondary.title} · {data.secondary.durationMin} min
                </p>
              </div>
              <span
                className="text-lg transition-transform group-hover:translate-x-1"
                style={{ color: "var(--ink)" }}
              >
                →
              </span>
            </Link>
          </motion.div>
        )}

        {/* Ambient closing */}
        <motion.p
          {...fade}
          transition={{ ...spring, delay: 0.4 }}
          className="whisper mt-20 text-center text-sm"
          style={{ color: "var(--ink-faint)" }}
        >
          Let the day settle.
        </motion.p>
      </div>
    </div>
  );
}

function CardBack({ tint }: { tint: "deep" | "mid" | "soft" }) {
  const bg =
    tint === "deep"
      ? "linear-gradient(135deg, var(--paper-warm) 0%, #E5D7B8 100%)"
      : tint === "mid"
      ? "linear-gradient(135deg, var(--paper-card) 0%, var(--paper-warm) 100%)"
      : "linear-gradient(135deg, #FDF9F0 0%, var(--paper-card) 100%)";
  return (
    <div
      className="h-12 w-9 rounded border"
      style={{
        background: bg,
        borderColor: "rgba(168, 134, 63, 0.55)",
        boxShadow: "0 2px 6px rgba(168, 134, 63, 0.18)",
      }}
    />
  );
}
