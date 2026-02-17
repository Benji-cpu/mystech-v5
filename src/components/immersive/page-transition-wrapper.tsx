"use client";

import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect, type ReactNode } from "react";

interface PageTransitionWrapperProps {
  children: ReactNode;
}

/**
 * Enter-only page transition. Old content vanishes instantly on route change;
 * new content fades in. No `mode="wait"` — no gap between pages.
 */
export function PageTransitionWrapper({ children }: PageTransitionWrapperProps) {
  const pathname = usePathname();
  const [frozenChildren, setFrozenChildren] = useState(children);
  const [currentPath, setCurrentPath] = useState(pathname);

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

  return (
    <AnimatePresence initial={false}>
      <motion.div
        key={currentPath}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        {frozenChildren}
      </motion.div>
    </AnimatePresence>
  );
}
