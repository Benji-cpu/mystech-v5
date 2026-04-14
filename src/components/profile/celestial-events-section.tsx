"use client";

import { useState } from "react";
import { Moon, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ActivityRow } from "./activity-row";
import type { ActivityItemWithTemporal } from "@/types";

interface CelestialEventsSectionProps {
  items: ActivityItemWithTemporal[];
  className?: string;
}

export function CelestialEventsSection({
  items,
  className,
}: CelestialEventsSectionProps) {
  const [expanded, setExpanded] = useState(false);

  if (items.length === 0) return null;

  const preview = items.slice(0, 3);
  const rest = items.slice(3);
  const hasMore = rest.length > 0;

  return (
    <div
      className={cn(
        "bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-4",
        className
      )}
    >
      <div className="flex items-center gap-2.5 mb-3">
        <Moon className="h-4 w-4 text-indigo-400" />
        <span className="text-sm font-medium text-white/80">
          Celestial Events
        </span>
        <span className="text-xs text-white/30">{items.length}</span>
      </div>

      <div className="space-y-2">
        {preview.map((item) => (
          <ActivityRow key={item.id} item={item} />
        ))}

        <AnimatePresence initial={false}>
          {expanded &&
            rest.map((item) => (
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
          onClick={() => setExpanded((prev) => !prev)}
          className="mt-3 flex items-center gap-1.5 mx-auto text-xs text-white/40 hover:text-white/60 transition-colors cursor-pointer"
        >
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </motion.div>
          {expanded ? "Show less" : `${rest.length} more`}
        </button>
      )}
    </div>
  );
}
