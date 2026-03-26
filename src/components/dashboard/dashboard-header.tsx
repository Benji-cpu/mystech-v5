"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { LyraSigil } from "@/components/guide/lyra-sigil";
import { cn } from "@/lib/utils";

interface DashboardHeaderProps {
  userName: string;
  className?: string;
}

const spring = { type: "spring" as const, stiffness: 300, damping: 25 };

function formatDate(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function DashboardHeader({ userName, className }: DashboardHeaderProps) {
  return (
    <motion.div
      className={cn("flex items-center gap-4", className)}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring}
    >
      <Link
        href="/home"
        className="shrink-0 group"
        aria-label="Return to Lyra"
      >
        <div className="transition-transform group-hover:scale-110">
          <LyraSigil size="md" state="attentive" />
        </div>
      </Link>

      <div className="min-w-0">
        <h1 className="text-lg font-semibold text-white/90 truncate">
          {userName}
        </h1>
        <p className="text-xs text-white/40 tracking-wide">
          {formatDate()}
        </p>
      </div>
    </motion.div>
  );
}
