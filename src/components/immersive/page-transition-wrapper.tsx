"use client";

import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect, type ReactNode } from "react";

interface PageTransitionWrapperProps {
  children: ReactNode;
}

/**
 * Full cross-fade page transition. Both old and new pages coexist briefly
 * during the transition via absolute positioning.
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
    <div className="relative" style={{ minHeight: "100dvh" }}>
      <AnimatePresence initial={false}>
        <motion.div
          key={currentPath}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          {frozenChildren}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
