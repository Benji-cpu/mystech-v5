"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const item = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 30,
    },
  },
};

interface AnimatedItemProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedItem({ children, className }: AnimatedItemProps) {
  return (
    <motion.div variants={item} className={cn(className)}>
      {children}
    </motion.div>
  );
}
