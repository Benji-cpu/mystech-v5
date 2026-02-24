"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { MOCK_DECKS } from "../../_shared/mock-data-v1";
import type { ViewId, ViewParams } from "../../_shared/types";
import { InkStagger, InkStaggerItem } from "../ink-transitions";
import { InkTextReveal } from "../ink-text-reveal";
import { inkGlass } from "../ink-theme";

interface MyDecksViewProps {
  navigate: (view: ViewId, params?: ViewParams) => void;
}

export default function MyDecksView({ navigate }: MyDecksViewProps) {
  return (
    <div className="px-4 py-6 space-y-4 md:px-8 md:py-8 md:space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <InkTextReveal
          text="Your Decks"
          as="h1"
          className="text-2xl font-semibold tracking-tight"
          charDelay={0.04}
          glowColor="rgba(0, 229, 255, 0.15)"
        />
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.3 }}
          className="text-sm text-slate-400"
        >
          {MOCK_DECKS.length} decks in your collection
        </motion.p>
      </div>

      {/* Grid */}
      <InkStagger
        className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4"
        staggerDelay={0.08}
      >
        {MOCK_DECKS.map((deck) => (
          <InkStaggerItem key={deck.id}>
            <motion.button
              onClick={() => navigate("deck-detail", { deckId: deck.id })}
              className="relative w-full overflow-hidden rounded-xl border border-white/[0.06] text-left group cursor-pointer"
              style={{ aspectRatio: "2 / 3" }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
            >
              {/* Cover image */}
              <img
                src={deck.coverUrl}
                alt={deck.name}
                className="absolute inset-0 w-full h-full object-cover"
                draggable={false}
              />

              {/* Dark ink overlay gradient */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(to bottom, transparent 30%, rgba(2,4,8,0.5) 60%, #020408 100%)",
                }}
              />

              {/* Hover glow — inner edge illumination */}
              <div
                className="absolute inset-0 pointer-events-none opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  boxShadow: "inset 0 0 30px rgba(0, 229, 255, 0.06)",
                }}
              />

              {/* Card count pill */}
              <div className="absolute top-2 right-2">
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded-full backdrop-blur-md"
                  style={{
                    background: "rgba(0, 229, 255, 0.08)",
                    border: "1px solid rgba(0, 229, 255, 0.12)",
                    color: "rgba(0, 229, 255, 0.8)",
                  }}
                >
                  {deck.cardCount}
                </span>
              </div>

              {/* Deck name at bottom over the overlay */}
              <div className="absolute inset-x-0 bottom-0 px-3 pb-3">
                <p className="text-sm font-medium text-slate-100 leading-tight truncate">
                  {deck.name}
                </p>
              </div>

              {/* Cyan border glow on hover */}
              <motion.div
                className="absolute inset-0 rounded-xl pointer-events-none"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                style={{
                  boxShadow: "0 0 20px rgba(0, 229, 255, 0.12)",
                  border: "1px solid rgba(0, 229, 255, 0.1)",
                }}
              />
            </motion.button>
          </InkStaggerItem>
        ))}

        {/* Create New Deck card */}
        <InkStaggerItem>
          <motion.button
            onClick={() => navigate("create-deck")}
            className="relative w-full overflow-hidden rounded-xl text-left group cursor-pointer flex flex-col items-center justify-center gap-3"
            style={{
              aspectRatio: "2 / 3",
              border: "1px dashed rgba(0, 229, 255, 0.2)",
              background: "rgba(0, 229, 255, 0.02)",
            }}
            whileHover={{
              scale: 1.03,
              borderColor: "rgba(0, 229, 255, 0.4)",
              boxShadow: "0 0 24px rgba(0, 229, 255, 0.1)",
            }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
          >
            {/* Plus icon */}
            <motion.div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{
                background: "rgba(0, 229, 255, 0.06)",
                border: "1px solid rgba(0, 229, 255, 0.1)",
              }}
            >
              <Plus className="w-6 h-6 text-cyan-400" />
            </motion.div>

            <span className="text-sm font-medium text-cyan-400/80">
              Create Deck
            </span>

            {/* Hover: dashed-to-solid overlay */}
            <div
              className="absolute inset-0 rounded-xl pointer-events-none opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{
                border: "1px solid rgba(0, 229, 255, 0.25)",
              }}
            />
          </motion.button>
        </InkStaggerItem>
      </InkStagger>
    </div>
  );
}
