"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { ReactNode } from "react";

interface FlowShellProps {
  /** Phase label shown in the status zone */
  statusLabel: string;
  /** Unique key for AnimatePresence on the status label */
  statusKey: string;
  /** Main card/content zone */
  cardZone: ReactNode;
  /** Whether the card zone should shrink (e.g., during interpreting) */
  cardZoneShrink?: boolean;
  /** Text zone content (interpretation, completion text) */
  textZone?: ReactNode;
  /** Whether the text zone should expand */
  textZoneExpanded?: boolean;
  /** Action zone (CTA button) */
  actionZone?: ReactNode;
}

export function FlowShell({
  statusLabel,
  statusKey,
  cardZone,
  cardZoneShrink,
  textZone,
  textZoneExpanded,
  actionZone,
}: FlowShellProps) {
  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden">
      {/* Status Zone */}
      <div className="shrink-0 px-4 pt-4 pb-1 min-h-[44px]">
        <AnimatePresence mode="wait">
          <motion.p
            key={statusKey}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="text-center text-sm text-white/60"
          >
            {statusLabel}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Card Zone — always mounted, flex changes */}
      <motion.div
        layout
        className="min-h-0 flex flex-col items-center justify-center px-4"
        animate={{
          flex: cardZoneShrink ? "none" : 1,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {cardZone}
      </motion.div>

      {/* Text Zone — always mounted, grows from 0 */}
      <motion.div
        layout
        className="min-h-0 overflow-auto px-4"
        animate={{
          flex: textZoneExpanded ? 1 : 0,
          opacity: textZoneExpanded ? 1 : 0,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {textZone}
      </motion.div>

      {/* Action Zone */}
      <div className="shrink-0 flex justify-center px-4 py-3">
        {actionZone}
      </div>
    </div>
  );
}
