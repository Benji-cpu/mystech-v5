"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const DISMISS_KEY = "mystech_astro_nudge_dismissed";

export function AstroNudgeBanner({ className }: { className?: string }) {
  const [visible, setVisible] = useState(false);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;

    // Check localStorage first
    if (typeof window !== "undefined") {
      try {
        if (localStorage.getItem(DISMISS_KEY) === "true") return;
      } catch {
        // localStorage unavailable
      }
    }

    // Check if profile already exists
    fetch("/api/astrology/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) return; // profile exists, stay hidden
        setVisible(true);
      })
      .catch(() => {});
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(DISMISS_KEY, "true");
    } catch {
      // localStorage unavailable
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className={cn(
            "flex items-center gap-3 px-4 py-2.5 rounded-xl",
            "bg-white/5 backdrop-blur-xl border border-white/10",
            className
          )}
        >
          <Sparkles className="w-4 h-4 text-[#c9a94e] shrink-0" />
          <p className="flex-1 text-sm text-white/60 min-w-0">
            Add your birth data to unlock astrological insights
          </p>
          <Link
            href="/profile"
            className="shrink-0 flex items-center gap-1 text-xs text-[#c9a94e] hover:text-[#daa520] font-medium transition-colors"
          >
            Profile
            <ArrowRight className="w-3 h-3" />
          </Link>
          <button
            onClick={handleDismiss}
            aria-label="Dismiss astrology nudge"
            className="shrink-0 p-1 rounded-md text-white/40 hover:text-white/70 hover:bg-white/10 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
