"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

interface AnimatedPageProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedPage({ children, className }: AnimatedPageProps) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
