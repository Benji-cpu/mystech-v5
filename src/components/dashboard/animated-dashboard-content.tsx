"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function AnimatedDashboardContent({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 25 }}
    >
      {children}
    </motion.div>
  );
}
