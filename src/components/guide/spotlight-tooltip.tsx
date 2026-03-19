"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LyraSigil } from "./lyra-sigil";
import { cn } from "@/lib/utils";

interface SpotlightTooltipProps {
  /** Element to spotlight — pass a ref's getBoundingClientRect, or null to hide */
  targetRect: DOMRect | null;
  message: string;
  onDismiss: () => void;
  className?: string;
  /** When true, clicks pass through the overlay to elements below. Only the tooltip card is interactive. */
  passthrough?: boolean;
  /** Custom label for the action button (default: "Got it") */
  actionLabel?: string;
  /** Custom callback for the action button. If not provided, calls onDismiss. */
  onAction?: () => void;
}

export function SpotlightTooltip({
  targetRect,
  message,
  onDismiss,
  className,
  passthrough = false,
  actionLabel = "Got it",
  onAction,
}: SpotlightTooltipProps) {
  const [visible, setVisible] = useState(false);

  // Delay appearance slightly so it feels intentional
  useEffect(() => {
    if (!targetRect) return;
    const timer = setTimeout(() => setVisible(true), 400);
    return () => clearTimeout(timer);
  }, [targetRect]);

  if (!targetRect) return null;

  const padding = 12;
  const cutout = {
    x: targetRect.x - padding,
    y: targetRect.y - padding,
    width: targetRect.width + padding * 2,
    height: targetRect.height + padding * 2,
    rx: targetRect.width > targetRect.height ? targetRect.height / 2 + padding : 24,
  };

  // Position tooltip above the target
  const tooltipTop = cutout.y - 16;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className={cn(
            "fixed inset-0 z-[100]",
            passthrough && "pointer-events-none",
            className,
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          onClick={passthrough ? undefined : onDismiss}
        >
          {/* Dimmed backdrop with cutout */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <defs>
              <mask id="spotlight-mask">
                <rect width="100%" height="100%" fill="white" />
                <rect
                  x={cutout.x}
                  y={cutout.y}
                  width={cutout.width}
                  height={cutout.height}
                  rx={cutout.rx}
                  fill="black"
                />
              </mask>
            </defs>
            <rect
              width="100%"
              height="100%"
              fill="rgba(0,0,0,0.7)"
              mask="url(#spotlight-mask)"
            />
          </svg>

          {/* Gold pulsing ring around target */}
          <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
              left: cutout.x - 4,
              top: cutout.y - 4,
              width: cutout.width + 8,
              height: cutout.height + 8,
              borderRadius: cutout.rx + 4,
              border: "2px solid rgba(201, 169, 78, 0.6)",
              boxShadow: "0 0 20px rgba(201, 169, 78, 0.3)",
            }}
            animate={{
              boxShadow: [
                "0 0 20px rgba(201, 169, 78, 0.3)",
                "0 0 30px rgba(201, 169, 78, 0.5)",
                "0 0 20px rgba(201, 169, 78, 0.3)",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Tooltip card above target */}
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 w-[min(320px,90vw)] pointer-events-auto"
            style={{ bottom: `calc(100vh - ${tooltipTop}px)` }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.2 }}
          >
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-lg shadow-purple-900/30">
              <div className="flex items-start gap-3">
                <LyraSigil size="sm" state="speaking" />
                <div className="flex-1">
                  <p className="text-sm text-white/80 leading-relaxed">
                    {message}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      (onAction ?? onDismiss)();
                    }}
                    className="mt-3 text-xs font-medium text-[#c9a94e] hover:text-[#d4b85a] transition-colors"
                  >
                    {actionLabel}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
