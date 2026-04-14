"use client";

import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState, useEffect, type ReactNode } from "react";

interface PageTransitionWrapperProps {
  children: ReactNode;
}

/**
 * Cross-fade page transition with a subtle scale shift (0.99 → 1).
 * Simulates turning a page rather than swiping screens.
 * Both old and new pages coexist briefly during the transition via absolute positioning.
 * Exit uses tighter spring so it clears faster than the enter settles.
 */
export function PageTransitionWrapper({ children }: PageTransitionWrapperProps) {
  const pathname = usePathname();
  const [frozenChildren, setFrozenChildren] = useState(children);
  const [currentPath, setCurrentPath] = useState(pathname);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (pathname !== currentPath) {
      setCurrentPath(pathname);
      setFrozenChildren(children);
    }
  }, [pathname, children, currentPath]);

  // Also update children if they change on the same path (e.g. server revalidation)
  useEffect(() => {
    setFrozenChildren(children);
  }, [children]);

  const variants = {
    initial: prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.99 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: prefersReducedMotion
        ? { duration: 0 }
        : { type: "spring" as const, stiffness: 300, damping: 30 },
    },
    exit: {
      opacity: 0,
      scale: prefersReducedMotion ? 1 : 0.99,
      transition: prefersReducedMotion
        ? { duration: 0 }
        // Exit spring is stiffer so the old page clears faster than the new page settles
        : { type: "spring" as const, stiffness: 400, damping: 35 },
    },
  };

  return (
    <div className="relative" style={{ minHeight: "100dvh" }}>
      <AnimatePresence initial={false}>
        <motion.div
          key={currentPath}
          className="absolute inset-0"
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {frozenChildren}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
