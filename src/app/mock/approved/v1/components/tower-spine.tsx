"use client";

import { motion } from "framer-motion";
import type { ViewId } from "@/app/mock/full/_shared/types";

const FLOOR_ORDER: { id: ViewId; label: string }[] = [
  { id: "dashboard", label: "Home" },
  { id: "reading", label: "Reading" },
  { id: "decks", label: "Decks" },
  { id: "create-deck", label: "Create" },
  { id: "generation", label: "Generate" },
  { id: "deck-detail", label: "Deck" },
  { id: "card-detail", label: "Card" },
  { id: "art-styles", label: "Styles" },
  { id: "art-style-detail", label: "Style" },
  { id: "settings", label: "Settings" },
];

interface TowerSpineProps {
  currentView: ViewId;
  onNavigate: (view: ViewId) => void;
}

export function TowerSpine({ currentView, onNavigate }: TowerSpineProps) {
  const currentIndex = FLOOR_ORDER.findIndex((f) => f.id === currentView);

  return (
    <div className="hidden lg:flex fixed right-4 top-1/2 -translate-y-1/2 z-50 flex-col items-center gap-0">
      {/* Vertical golden line */}
      <div className="absolute inset-0 flex justify-center">
        <div className="w-px h-full bg-gradient-to-b from-transparent via-[#c9a94e]/30 to-transparent" />
      </div>

      {FLOOR_ORDER.map((floor, idx) => {
        const isActive = floor.id === currentView;
        const isMainNav = ["dashboard", "reading", "decks", "art-styles", "settings"].includes(floor.id);

        return (
          <div key={floor.id} className="relative flex items-center py-2">
            <motion.button
              onClick={() => onNavigate(floor.id)}
              className="relative z-10 group flex items-center"
              whileHover={{ scale: 1.3 }}
              whileTap={{ scale: 0.9 }}
            >
              {/* Dot */}
              <motion.div
                animate={{
                  width: isActive ? 12 : isMainNav ? 6 : 4,
                  height: isActive ? 12 : isMainNav ? 6 : 4,
                  backgroundColor: isActive ? "#c9a94e" : isMainNav ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.15)",
                  boxShadow: isActive ? "0 0 12px rgba(201,169,78,0.6)" : "none",
                }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="rounded-full"
              />

              {/* Label on hover */}
              <div className="absolute right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                <span className="text-xs text-white/70 bg-black/60 backdrop-blur-sm px-2 py-1 rounded">
                  {floor.label}
                </span>
              </div>
            </motion.button>

            {/* Active indicator glow ring */}
            {isActive && (
              <motion.div
                layoutId="spine-active"
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <div className="w-5 h-5 rounded-full border border-[#c9a94e]/30" />
              </motion.div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Helper to determine floor index for transition direction
export function getFloorIndex(view: ViewId): number {
  return FLOOR_ORDER.findIndex((f) => f.id === view);
}
