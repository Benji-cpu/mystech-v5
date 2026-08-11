"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useIsDesktop } from "@/hooks/use-media-query";
import { SPRINGS } from "./reading-flow-theme";

export type StageVariant = "single" | "split";

interface ReadingStageProps {
  /**
   * `single` — one centred column (setup, and the drawing moment).
   * `split`  — cards hold one side, the reading holds the other.
   */
  variant: StageVariant;
  header: ReactNode;
  /** Card stage. Occupies its region only in `split`. */
  primary?: ReactNode;
  /** The reading itself — the one scrollable region on the page. */
  secondary: ReactNode;
  /** Pinned action row. Sits on a solid bar, never a gradient mask. */
  action?: ReactNode;
  /** Height of the card stage on mobile, in px. Ignored on desktop. */
  mobilePrimaryHeight?: number;
}

/**
 * The persistent shell for the whole reading.
 *
 * Every region below stays mounted for the entire flow and animates its
 * proportions — nothing unmounts between phases (see
 * `.claude/rules/flow-patterns.md`).
 *
 * Three structural rules this shell exists to enforce:
 *
 * 1. **One scroll owner.** Only the reading region scrolls. The old flow
 *    nested an `overflow-y-auto` panel inside a `fixed inset-0` shell, which
 *    gave mobile a cramped inner scrollbar while the cards were cropped above
 *    it.
 * 2. **Chrome is reserved, not overlapped.** The header is a real flex row, so
 *    cards can never slide under it. The previous shell padded a flat `1.5rem`
 *    and let the fixed `FocusHeader` land on top of the spread.
 * 3. **Width is composed, not stretched.** On `lg` the stage splits, so a
 *    paragraph is never dragged across 2000px of viewport.
 */
export function ReadingStage({
  variant,
  header,
  primary,
  secondary,
  action,
  mobilePrimaryHeight,
}: ReadingStageProps) {
  const isDesktop = useIsDesktop();
  const isSplit = variant === "split";

  // Desktop sizes the card stage by flex width; mobile sizes it by measured
  // height. Mixing the two is what produced the cropped spread — an inline
  // height always beats `lg:h-full`.
  const primaryStyle = isDesktop
    ? { borderColor: "var(--line)" }
    : { borderColor: "var(--line)", height: isSplit ? mobilePrimaryHeight : 0 };

  return (
    <div
      className="fixed inset-0 flex flex-col overflow-hidden lg:pl-16"
      style={{ zIndex: 1, background: "var(--paper)", color: "var(--ink)" }}
    >
      <header className="shrink-0">{header}</header>

      <div className="flex-1 min-h-0 flex flex-col lg:flex-row">
        {/* ── Card stage ─────────────────────────────────────────────────
            No `layout` prop here on purpose. A layout animation would scale
            the section, and scaling squashes the card art inside it — the
            cards run their own springs into position instead. Only opacity
            animates, which is transform-free. */}
        <motion.section
          initial={false}
          animate={{ opacity: isSplit ? 1 : 0 }}
          transition={SPRINGS.zone}
          className={cn(
            "relative min-h-0 shrink-0 overflow-hidden transition-[height] duration-300",
            isSplit
              ? "lg:h-full lg:w-[42%] lg:max-w-[560px] lg:border-r"
              : "lg:w-0 lg:max-w-0"
          )}
          style={primaryStyle}
          aria-hidden={!isSplit}
        >
          {isSplit ? primary : null}
        </motion.section>

        {/* ── Reading column — the single scroll owner ────────────────── */}
        <section className="flex-1 min-h-0 flex flex-col">
          {/* `m-auto` on the child, not `justify-center` on the parent: auto
              margins resolve to 0 once the content is taller than the box, so
              a long reading scrolls from its true top instead of having its
              first lines clipped above the scroll origin. */}
          <div className="flex flex-1 min-h-0 flex-col overflow-y-auto overscroll-contain">
            <div className="m-auto w-full">{secondary}</div>
          </div>

          {action ? (
            <div
              className="shrink-0 border-t"
              style={{
                borderColor: "var(--line)",
                background: "var(--paper)",
                paddingBottom: "max(env(safe-area-inset-bottom), 0px)",
              }}
            >
              {/* `mb-16` clears the mobile BottomNav, which is fixed at z-50. */}
              <div className="px-4 py-3 sm:px-6 mb-16 lg:mb-0">{action}</div>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
