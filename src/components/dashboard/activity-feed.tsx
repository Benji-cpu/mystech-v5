"use client";

import { useState } from "react";
import { BookOpen, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { EmptyState } from "@/components/shared/empty-state";
import {
  ActivityRow,
  SectionLabel,
} from "@/components/profile/activity-row";
import type { ActivityItemWithTemporal } from "@/types";

// ── Main component ───────────────────────────────────────────────────────

interface ActivityFeedProps {
  items: ActivityItemWithTemporal[];
  className?: string;
}

export function ActivityFeed({ items, className }: ActivityFeedProps) {
  const [open, setOpen] = useState(false);

  if (items.length === 0) {
    return (
      <div className={className}>
        <EmptyState
          icon={BookOpen}
          title="Your journey begins here"
          description="Create a deck or perform a reading to see your story unfold."
          actionLabel="Create a Deck"
          actionHref="/decks/new"
        />
      </div>
    );
  }

  const futureItems = items.filter((i) => i.isFuture);
  const pastItems = items.filter((i) => !i.isFuture);

  // Build the full ordered list with section labels
  const allRows: { key: string; node: React.ReactNode }[] = [];

  if (futureItems.length > 0) {
    allRows.push({
      key: "label-upcoming",
      node: <SectionLabel color="text-indigo-400">Upcoming</SectionLabel>,
    });
    for (const item of futureItems) {
      allRows.push({
        key: item.id,
        node: <ActivityRow item={item} />,
      });
    }
  }

  if (pastItems.length > 0) {
    allRows.push({
      key: "label-recent",
      node: <SectionLabel color="text-white/30">Recent</SectionLabel>,
    });
    for (const item of pastItems) {
      allRows.push({
        key: item.id,
        node: <ActivityRow item={item} />,
      });
    }
  }

  const preview = allRows.slice(0, 5);
  const rest = allRows.slice(5);

  return (
    <Collapsible open={open} onOpenChange={setOpen} className={className}>
      <div className="space-y-2">
        {preview.map(({ key, node }) => (
          <div key={key}>{node}</div>
        ))}
      </div>

      {rest.length > 0 && (
        <>
          <CollapsibleContent className="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
            <div className="space-y-2 pt-2">
              {rest.map(({ key, node }) => (
                <div key={key}>{node}</div>
              ))}
            </div>
          </CollapsibleContent>

          <CollapsibleTrigger className="mt-2 flex items-center gap-1.5 text-xs text-white/40 hover:text-white/60 transition-colors cursor-pointer mx-auto">
            <span>{open ? "Show less" : `${rest.length} more`}</span>
            <motion.div
              animate={{ rotate: open ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <ChevronDown className="h-3 w-3" />
            </motion.div>
          </CollapsibleTrigger>
        </>
      )}
    </Collapsible>
  );
}
