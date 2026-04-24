"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Plus, ScrollText, Search } from "lucide-react";
import type { Deck } from "@/types";

interface EditorialDecksLibraryProps {
  userDecks: Deck[];
  adoptedDecks: Deck[];
  hasChronicle: boolean;
}

const spring = { type: "spring" as const, stiffness: 180, damping: 22 };

export function EditorialDecksLibrary({
  userDecks,
  adoptedDecks,
  hasChronicle,
}: EditorialDecksLibraryProps) {
  const tabs = useMemo(() => {
    const t: { key: "mine" | "community"; label: string; count: number }[] = [
      { key: "mine", label: "My decks", count: userDecks.length },
    ];
    if (adoptedDecks.length > 0) {
      t.push({ key: "community", label: "Community", count: adoptedDecks.length });
    }
    return t;
  }, [userDecks.length, adoptedDecks.length]);

  const [tab, setTab] = useState<"mine" | "community">("mine");
  const active = tab === "mine" ? userDecks : adoptedDecks;

  return (
    <div
      className="daylight fixed inset-0 overflow-y-auto"
      style={{ background: "var(--paper)", zIndex: 1 }}
    >
      <div className="mx-auto max-w-3xl px-6 pb-28 pt-10 sm:px-10 sm:pt-14">
        {/* Header */}
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Library</p>
            <h1
              className="display mt-3 text-[clamp(2.25rem,8vw,3.5rem)] leading-[0.98]"
              style={{ color: "var(--ink)" }}
            >
              Your decks
            </h1>
            <p className="whisper mt-3 text-base" style={{ color: "var(--ink-soft)" }}>
              {userDecks.length === 0
                ? "A collection waiting to begin."
                : `${userDecks.length} ${userDecks.length === 1 ? "deck" : "decks"}. Each one a small argument with yourself.`}
            </p>
          </div>
          <button
            aria-label="Search"
            className="mt-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-[var(--paper-warm)]"
            style={{ color: "var(--ink-soft)" }}
          >
            <Search size={18} strokeWidth={1.5} />
          </button>
        </header>

        {/* Chronicle nudge */}
        {!hasChronicle && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={spring}
            className="mt-8"
          >
            <Link
              href="/chronicle/setup"
              className="group flex items-center gap-4 rounded-2xl border p-5 hair transition-colors hover:border-[var(--ink-soft)]"
              style={{ background: "var(--paper-card)" }}
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                style={{ background: "var(--paper-warm)", color: "var(--accent-gold)" }}
              >
                <ScrollText size={18} strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <p className="eyebrow" style={{ color: "var(--accent-gold)" }}>
                  Begin a chronicle
                </p>
                <p
                  className="display mt-1 text-lg leading-tight"
                  style={{ color: "var(--ink)" }}
                >
                  Start a daily practice
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

        {/* Tabs */}
        {tabs.length > 1 && (
          <div className="mt-10 flex gap-6 border-b hair">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className="relative -mb-px flex items-baseline gap-2 pb-3 text-sm transition-colors"
                style={{
                  color: tab === t.key ? "var(--ink)" : "var(--ink-mute)",
                  fontWeight: tab === t.key ? 500 : 400,
                }}
              >
                {t.label}
                <span className="text-xs" style={{ color: "var(--ink-faint)" }}>
                  {t.count}
                </span>
                {tab === t.key && (
                  <motion.span
                    layoutId="decks-tab"
                    className="absolute inset-x-0 -bottom-px h-px"
                    style={{ background: "var(--ink)" }}
                  />
                )}
              </button>
            ))}
          </div>
        )}

        {/* Empty */}
        {active.length === 0 && tab === "mine" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={spring}
            className="mt-14 rounded-3xl border p-10 text-center hair"
            style={{ background: "var(--paper-card)" }}
          >
            <h3 className="display text-2xl" style={{ color: "var(--ink)" }}>
              Your collection awaits.
            </h3>
            <p
              className="whisper mx-auto mt-3 max-w-sm text-base leading-relaxed"
              style={{ color: "var(--ink-mute)" }}
            >
              Let's create your first deck — one that speaks to where you are right now.
            </p>
            <Link
              href="/decks/new"
              className="mt-6 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium"
              style={{ background: "var(--ink)", color: "var(--paper)" }}
            >
              Create a deck →
            </Link>
          </motion.div>
        )}

        {/* Grid */}
        {active.length > 0 && (
          <section className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3">
            {active.map((deck, i) => (
              <motion.div
                key={deck.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...spring, delay: Math.min(i * 0.04, 0.4) }}
              >
                <EditorialDeckTile deck={deck} />
              </motion.div>
            ))}

            {tab === "mine" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...spring, delay: Math.min(active.length * 0.04, 0.4) }}
              >
                <Link href="/decks/new" className="group block">
                  <div
                    className="flex aspect-[3/4] items-center justify-center rounded-md border-2 border-dashed transition-colors group-hover:border-[var(--ink)]"
                    style={{ borderColor: "var(--line)", background: "var(--paper-warm)" }}
                  >
                    <div className="text-center">
                      <Plus
                        size={28}
                        strokeWidth={1.5}
                        className="mx-auto transition-colors group-hover:text-[var(--ink)]"
                        style={{ color: "var(--ink-mute)" }}
                      />
                      <p
                        className="mt-3 text-xs"
                        style={{ color: "var(--ink-mute)" }}
                      >
                        Create a deck
                      </p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <p
                      className="display text-base leading-tight"
                      style={{ color: "var(--ink)" }}
                    >
                      New deck
                    </p>
                    <p className="mt-0.5 text-xs" style={{ color: "var(--ink-mute)" }}>
                      Guided or quick
                    </p>
                  </div>
                </Link>
              </motion.div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

function EditorialDeckTile({ deck }: { deck: Deck }) {
  const isChronicle = deck.deckType === "chronicle";
  const isDraft = deck.status === "draft";

  return (
    <Link href={`/decks/${deck.id}`} className="group block">
      <div
        className="relative aspect-[3/4] overflow-hidden rounded-md border transition-all group-hover:border-[var(--ink-soft)] group-hover:shadow-lg"
        style={{
          borderColor: "var(--line)",
          background: deck.coverImageUrl
            ? undefined
            : "linear-gradient(160deg, #2A2130 0%, #0D0A10 100%)",
          boxShadow: "0 4px 12px rgba(26, 22, 20, 0.06)",
        }}
      >
        {deck.coverImageUrl ? (
          <Image
            src={deck.coverImageUrl}
            alt=""
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center">
            <span className="text-6xl" style={{ color: "rgba(168,134,63,0.3)" }}>
              ✦
            </span>
          </div>
        )}

        {/* Tag */}
        {(isChronicle || isDraft) && (
          <span
            className="absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-[10px] font-medium backdrop-blur-sm"
            style={{
              background: "rgba(251, 247, 238, 0.9)",
              color: isChronicle ? "var(--accent-gold)" : "var(--ink-mute)",
            }}
          >
            {isChronicle ? "Chronicle" : "Draft"}
          </span>
        )}
      </div>

      <div className="mt-3">
        <h3
          className="display line-clamp-2 text-base leading-tight"
          style={{ color: "var(--ink)" }}
        >
          {deck.title}
        </h3>
        <p className="mt-0.5 text-xs" style={{ color: "var(--ink-mute)" }}>
          {isDraft
            ? "In progress"
            : isChronicle
            ? `${deck.cardCount} card${deck.cardCount !== 1 ? "s" : ""} and growing`
            : `${deck.cardCount} card${deck.cardCount !== 1 ? "s" : ""}`}
        </p>
      </div>
    </Link>
  );
}
