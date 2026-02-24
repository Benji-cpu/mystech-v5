"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import Image from "next/image";
import type { ViewId, ViewParams } from "../../_shared/types";
import { MOCK_DECKS } from "../../_shared/mock-data-v1";

interface ViewProps {
  navigate: (view: ViewId, params?: ViewParams) => void;
  goBack: () => void;
  currentView: ViewId;
  viewParams: ViewParams;
}

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 30 } },
};

function DeckCard({
  deck,
  onClick,
}: {
  deck: (typeof MOCK_DECKS)[number];
  onClick: () => void;
}) {
  return (
    <motion.button
      variants={fadeUp}
      onClick={onClick}
      className="group relative text-left"
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        layoutId={`deck-${deck.id}`}
        className="aspect-[3/4] rounded-2xl overflow-hidden bg-white/5 border border-white/10 relative"
        whileHover={{
          borderColor: "rgba(201,169,78,0.3)",
          boxShadow: "0 0 30px rgba(201,169,78,0.15)",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <Image
          src={deck.coverUrl}
          alt={deck.name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Card count badge */}
        <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-md rounded-full px-2 py-0.5 text-[10px] text-white/70 border border-white/10">
          {deck.cardCount} cards
        </div>
      </motion.div>

      <div className="mt-2.5 px-0.5 space-y-0.5">
        <p className="text-sm font-medium text-white/90 truncate">{deck.name}</p>
        <p className="text-[11px] text-white/30 capitalize">{deck.artStyleId.replace("-", " ")}</p>
      </div>
    </motion.button>
  );
}

export function DecksView({ navigate }: ViewProps) {
  return (
    <div className="h-full overflow-y-auto pb-24 sm:pb-8 sm:pl-[72px]">
      <motion.div
        className="max-w-4xl mx-auto p-4 sm:p-8 space-y-6"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={fadeUp} className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">My Decks</h1>
            <p className="text-sm text-white/40 mt-0.5">{MOCK_DECKS.length} decks created</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {MOCK_DECKS.map((deck) => (
            <DeckCard
              key={deck.id}
              deck={deck}
              onClick={() => navigate("deck-detail", { deckId: deck.id })}
            />
          ))}

          {/* Create new deck card */}
          <motion.button
            variants={fadeUp}
            onClick={() => navigate("create-deck")}
            className="aspect-[3/4] rounded-2xl border-2 border-dashed border-white/10 hover:border-[#c9a94e]/30 flex flex-col items-center justify-center gap-3 transition-colors group"
            whileHover={{ borderColor: "rgba(201,169,78,0.4)" }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#c9a94e]/10 transition-colors">
              <Plus size={20} className="text-white/30 group-hover:text-[#c9a94e] transition-colors" />
            </div>
            <span className="text-xs text-white/30 group-hover:text-white/50 transition-colors">
              Create New
            </span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
