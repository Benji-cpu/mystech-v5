"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { ActivityRow } from "@/components/profile/activity-row";
import { cn } from "@/lib/utils";
import type { ActivityItemWithTemporal } from "@/types";

interface RecentActivityProps {
  items: ActivityItemWithTemporal[];
  className?: string;
}

const COLLAPSED_COUNT = 3;

export function RecentActivity({ items, className }: RecentActivityProps) {
  const [expanded, setExpanded] = useState(false);

  if (items.length === 0) return null;

  const visible = expanded ? items : items.slice(0, COLLAPSED_COUNT);
  const hasMore = items.length > COLLAPSED_COUNT;

  return (
    <motion.div
      className={cn("space-y-2", className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.3 }}
    >
      <div className="flex items-center justify-between px-1">
        <p className="text-xs font-medium uppercase tracking-wider text-white/30">
          Recent Activity
        </p>
      </div>

      <div className="space-y-1.5">
        <AnimatePresence initial={false}>
          {visible.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <ActivityRow item={item} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 px-1 py-1.5 text-xs text-white/30 hover:text-white/50 transition-colors"
        >
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 transition-transform",
              expanded && "rotate-180"
            )}
          />
          {expanded
            ? "Show less"
            : `Show ${items.length - COLLAPSED_COUNT} more`}
        </button>
      )}
    </motion.div>
  );
}
